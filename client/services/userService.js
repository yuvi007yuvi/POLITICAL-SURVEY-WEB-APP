import api from "./api.js";

export const userService = {
  list: async (page = 1) => {
    const { data } = await api.get(`/users?page=${page}&limit=10`);
    return data.data;
  }
};

