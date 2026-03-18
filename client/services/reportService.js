import api from "./api.js";

export const reportService = {
  list: async ({ page = 1, projectId = "" }) => {
    const params = new URLSearchParams({ page, limit: 10 });
    if (projectId) {
      params.set("projectId", projectId);
    }
    const { data } = await api.get(`/surveys/surveyReports?${params.toString()}`);
    return data.data;
  }
};

