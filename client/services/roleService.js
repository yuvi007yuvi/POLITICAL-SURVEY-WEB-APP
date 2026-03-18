import api from "./api.js";

export const roleService = {
    list: async () => {
        const { data } = await api.get("/roles");
        return data.data;
    },
    create: async (payload) => {
        const { data } = await api.post("/roles", payload);
        return data.data;
    },
    update: async (id, payload) => {
        const { data } = await api.put(`/roles/${id}`, payload);
        return data.data;
    },
    remove: async (id) => {
        const { data } = await api.delete(`/roles/${id}`);
        return data;
    }
};
