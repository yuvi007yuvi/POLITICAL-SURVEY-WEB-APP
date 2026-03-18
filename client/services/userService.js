import api from "./api.js";

export const userService = {
  list: async (page = 1) => {
    const { data } = await api.get(`/users?page=${page}&limit=50`);
    return data.data;
  },
  create: async (payload) => {
    const { data } = await api.post("/users", payload);
    return data.data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/users/${id}`, payload);
    return data.data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  }
};
