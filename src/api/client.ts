import axios from "axios";
import { getToken, clearToken } from "../storage/authStorage";

/**
 * URL da API: runtime (window.MASD_CAIXA.API_BASE_URL) ou build (VITE_API_BASE_URL).
 * O app adiciona /api no final (context-path do backend).
 */
const runtimeBaseURL = typeof window !== "undefined" ? (window as { MASD_CAIXA?: { API_BASE_URL?: string } }).MASD_CAIXA?.API_BASE_URL : undefined;
const buildBaseURL = import.meta.env.VITE_API_BASE_URL ?? "";
let baseURL = runtimeBaseURL || buildBaseURL;
if (baseURL && !baseURL.endsWith("/api")) {
  baseURL = baseURL.replace(/\/?$/, "") + "/api";
}

if (!baseURL) {
  throw new Error(
    import.meta.env.DEV
      ? "Defina VITE_API_BASE_URL no .env (ex.: http://localhost:8080)."
      : "Defina VITE_API_BASE_URL no Railway (variáveis do serviço) e faça redeploy."
  );
}

export const apiBaseURL = baseURL;

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      clearToken();
    }
    return Promise.reject(err);
  }
);
