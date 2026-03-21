import api from "./api.js";

export const authService = {
  login: async (payload) => {
    const { data } = await api.post("auth/login", payload);
    return data;
  },
  getProfile: async () => {
    const { data } = await api.get("auth/profile");
    return data;
  }
};

