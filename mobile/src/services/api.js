import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL
});

api.interceptors.request.use(async (config) => {
  const raw = await AsyncStorage.getItem("political-soch-mobile-session");
  if (raw) {
    const session = JSON.parse(raw);
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
  }
  return config;
});

export default api;

