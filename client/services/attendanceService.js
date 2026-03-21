import api from "./api.js";
import * as faceapi from "face-api.js";

export const attendanceService = {
  loadModels: async () => {
    const MODEL_URL = "/models";
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
  },

  registerFace: async (descriptor) => {
    const { data } = await api.post("/attendance/register-face", {
      descriptor: Array.from(descriptor)
    });
    return data;
  },

  markAttendance: async (payload) => {
    const formData = new FormData();
    formData.append("type", payload.type);
    formData.append("gpsLocation", JSON.stringify(payload.gpsLocation));
    if (payload.deviceName) formData.append("deviceName", payload.deviceName);
    if (payload.photo) formData.append("photo", payload.photo);

    const { data } = await api.post("/attendance/mark-attendance", formData);
    return data;
  },

  getHistory: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const { data } = await api.get(`/attendance/history?${params.toString()}`);
    return data.data;
  },

  getStats: async () => {
    const { data } = await api.get("/attendance/stats");
    return data.data;
  },

  getCalendar: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const { data } = await api.get(`/attendance/calendar?${params.toString()}`);
    return data;
  },

  getTodayStatus: async () => {
    const { data } = await api.get("/attendance/today-status");
    return data.data;
  }
};
