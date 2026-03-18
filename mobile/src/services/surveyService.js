import api from "./api.js";
import { offlineQueue } from "./offlineQueue.js";

const appendFileIfExists = (formData, field, asset, type) => {
  if (!asset?.uri) {
    return;
  }

  formData.append(field, {
    uri: asset.uri,
    name: asset.fileName || `${field}-${Date.now()}.${type}`,
    type: asset.mimeType || `${field}/${type}`
  });
};

export const surveyService = {
  submitOnline: async (draft) => {
    const formData = new FormData();
    formData.append("projectId", draft.projectId);
    formData.append("offlineReferenceId", draft.offlineReferenceId);
    formData.append("answers", JSON.stringify(draft.answers));
    formData.append("gpsLocation", JSON.stringify(draft.gpsLocation));

    (draft.photos || []).forEach((photo, index) => {
      appendFileIfExists(formData, "photos", { ...photo, fileName: `photo-${index}.jpg` }, "jpeg");
    });

    appendFileIfExists(formData, "voice", draft.voiceRecording, "m4a");

    const { data } = await api.post("/surveys/submitSurvey", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    return data.data;
  },
  submitOrQueue: async (draft) => {
    try {
      return await surveyService.submitOnline(draft);
    } catch (error) {
      await offlineQueue.add(draft);
      return {
        queued: true,
        message: error.response?.data?.message || "Saved offline for sync"
      };
    }
  },
  syncPending: async () => {
    const queued = await offlineQueue.list();
    const failed = [];

    for (const draft of queued) {
      try {
        await surveyService.submitOnline(draft);
      } catch (error) {
        failed.push(draft);
      }
    }

    await offlineQueue.replace(failed);
    return {
      synced: queued.length - failed.length,
      remaining: failed.length
    };
  }
};

