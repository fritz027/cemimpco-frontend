import axios from "axios";

const baseURL = `${import.meta.env.VITE_API_BASE_URL}/v1` || "http://localhost:3000/api";

const api = axios.create({
  baseURL,
  timeout: 10000,
  // ✅ REMOVE Content-Type default
  // headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ✅ If sending FormData, let browser set multipart boundary automatically
  if (config.data instanceof FormData) {
    // make sure we don't force JSON
    if (config.headers) {
      delete (config.headers as any)["Content-Type"];
      delete (config.headers as any)["content-type"];
    }
  } else {
    // ✅ For normal JSON requests, set it here
    config.headers = config.headers ?? {};
    (config.headers as any)["Content-Type"] = "application/json";
  }

  return config;
});

export default api;