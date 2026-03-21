import api from "./api.js";

export const projectService = {
  list: async () => {
    const { data } = await api.get("/projects");
    return data.data;
  },
  create: async (payload) => {
    const { data } = await api.post("/projects", payload);
    return data.data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/projects/${id}`, payload);
    return data.data;
  },
  delete: async (id) => {
    const { data } = await api.delete(`/projects/${id}`);
    return data.data;
  },
  get: async (id) => {
    const { data } = await api.get(`/projects/${id}`);
    return data.data;
  }
};

