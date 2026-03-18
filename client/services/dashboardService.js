import api from "./api.js";

export const dashboardService = {
  stats: async () => {
    const { data } = await api.get("/dashboardStats");
    return data.data;
  }
};

