import axios from "axios";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

let finalBaseUrl = apiBaseUrl;
if (!finalBaseUrl.includes("/api")) {
  finalBaseUrl = finalBaseUrl.endsWith("/") ? `${finalBaseUrl}api` : `${finalBaseUrl}/api`;
}

const api = axios.create({
  baseURL: finalBaseUrl.endsWith("/") ? finalBaseUrl : `${finalBaseUrl}/`
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("political-soch-admin");
  if (raw) {
    const session = JSON.parse(raw);
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
  }
  return config;
});

export default api;
