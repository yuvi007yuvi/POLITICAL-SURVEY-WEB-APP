import api from "./api.js";

export const reportService = {
  list: async ({ page = 1, projectId = "", date = "" }) => {
    const params = new URLSearchParams({ page, limit: 100 });
    if (projectId) params.set("projectId", projectId);
    if (date) params.set("date", date);
    
    const { data } = await api.get(`/surveys/surveyReports?${params.toString()}`);
    return data.data;
  },
  submit: async (payload) => {
    // Note: Backend expects multipart/form-data for photos/voice, 
    // but for now we send JSON as the middleware can handle it if no files are present,
    // or we can wrap it in FormData.
    const { data } = await api.post("/surveys/submitSurvey", payload);
    return data.data;
  }
};

