import api from "./api.js";

export const dashboardService = {
  stats: async (projectId = "") => {
    const params = new URLSearchParams();
    if (projectId) params.append("projectId", projectId);
    const { data } = await api.get(`/dashboardStats?${params.toString()}`);
    return data.data;
  }
};

