import { createContext, useContext, useMemo, useState } from "react";

const SurveyDraftContext = createContext(null);

const baseDraft = {
  projectId: "",
  projectName: "",
  answers: [],
  photos: [],
  voiceRecording: null,
  gpsLocation: null,
  offlineReferenceId: ""
};

export const SurveyDraftProvider = ({ children }) => {
  const [draft, setDraft] = useState(baseDraft);

  const value = useMemo(
    () => ({
      draft,
      startDraft: (project) =>
        setDraft({
          ...baseDraft,
          projectId: project._id,
          projectName: project.name,
          offlineReferenceId: `offline-${Date.now()}`
        }),
      updateAnswers: (answers) => setDraft((current) => ({ ...current, answers })),
      addPhoto: (photo) =>
        setDraft((current) => ({
          ...current,
          photos: [...current.photos, photo]
        })),
      setVoiceRecording: (voiceRecording) =>
        setDraft((current) => ({
          ...current,
          voiceRecording
        })),
      setGpsLocation: (gpsLocation) =>
        setDraft((current) => ({
          ...current,
          gpsLocation
        })),
      resetDraft: () => setDraft(baseDraft)
    }),
    [draft]
  );

  return <SurveyDraftContext.Provider value={value}>{children}</SurveyDraftContext.Provider>;
};

export const useSurveyDraft = () => {
  const context = useContext(SurveyDraftContext);
  if (!context) {
    throw new Error("useSurveyDraft must be used inside SurveyDraftProvider");
  }
  return context;
};

