import api from "./api.js";

export const projectService = {
  list: async () => {
    const { data } = await api.get("/projects");
    return data.data;
  },
  create: async (payload) => {
    const { data } = await api.post("/projects", payload);
    return data.data;
  }
};

