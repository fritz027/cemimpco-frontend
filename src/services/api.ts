// src/services/api.ts
import axios, { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth";

const baseURL = `${import.meta.env.VITE_API_BASE_URL}/v1` || "http://localhost:3000/api";

const api = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true, // ✅ required so refresh_token cookie is sent
});

const REFRESH_URL = "/auth/refresh-token"; // ✅ adjust if needed (baseURL already has /v1)

let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

function processQueue(newToken: string) {
  queue.forEach((cb) => cb(newToken));
  queue = [];
}

function clearQueue() {
  queue = [];
}

api.interceptors.request.use((config) => {
  const authStore = useAuthStore();

  // attach access token
  if (authStore.accessToken) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${authStore.accessToken}`;
  }

  // ✅ FormData: let browser set boundary
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete (config.headers as any)["Content-Type"];
      delete (config.headers as any)["content-type"];
    }
  } else {
    // ✅ JSON: set content-type
    config.headers = config.headers ?? {};
    (config.headers as any)["Content-Type"] = "application/json";
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const authStore = useAuthStore();
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean });

    // No response (network error)
    if (!error.response) return Promise.reject(error);

    // If refresh endpoint itself fails, logout
    const isRefreshCall =
      typeof original?.url === "string" && original.url.includes(REFRESH_URL);
    console.log('is refreshcall', isRefreshCall);
    // Only handle 401 once per request
    if (error.response.status === 401 && original && !original._retry && !isRefreshCall) {
      original._retry = true;

      // If already refreshing, queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push((token: string) => {
            try {
              original.headers = original.headers ?? {};
              (original.headers as any).Authorization = `Bearer ${token}`;
              resolve(api(original));
            } catch (e) {
              reject(e);
            }
          });
        });
      }

      isRefreshing = true;

      try {
        // ✅ request new access token using refresh cookie
        const refreshRes = await api.post(REFRESH_URL);

        const newToken = (refreshRes.data as any)?.accessToken;
        if (!newToken) {
          // refresh response didn't include token
          authStore.logout?.();
          clearQueue();
          return Promise.reject(error);
        }

        // save new token
        authStore.accessToken = newToken;

        // retry queued requests
        processQueue(newToken);

        // retry the original request
        original.headers = original.headers ?? {};
        (original.headers as any).Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr: any) {
        // refresh failed (expired/invalid refresh token, user disabled, etc.)
        clearQueue();
        authStore.logout?.();

        // optional: you can inspect refreshErr.response.status === 403 etc.
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // If refresh call fails, just logout
    if (isRefreshCall) {
      authStore.logout?.();
    }

    return Promise.reject(error);
  }
);

export default api;