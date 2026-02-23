import axios from "axios";
import { getToken, clearToken } from "../storage/authStorage";

/** Mesma estratégia para API e Google: runtime (config.js) primeiro, depois build (VITE_*). */
type WindowConfig = { MASD_CAIXA?: { API_BASE_URL?: string; GOOGLE_CLIENT_ID?: string } };
const w = typeof window !== "undefined" ? (window as WindowConfig).MASD_CAIXA : undefined;

const runtimeBaseURL = w?.API_BASE_URL;
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

const runtimeGoogleId = w?.GOOGLE_CLIENT_ID ?? "";
const buildGoogleId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";
/** Em dev: sempre usar .env (config.js não existe). Em prod: runtime (config.js) ou build. */
export const googleClientId = import.meta.env.DEV ? buildGoogleId : (runtimeGoogleId || buildGoogleId);
export function getGoogleClientId(): string {
  return googleClientId;
}

/** Objeto de debug: sempre exposto em window. No console digite: __MASD_CAIXA_DEBUG__ */
function getConfigDebugSnapshot() {
  return {
    "window.MASD_CAIXA existe?": !!w,
    "API_BASE_URL (runtime)": runtimeBaseURL || "(vazio)",
    "API_BASE_URL (build)": buildBaseURL ? "***" : "(vazio)",
    "GOOGLE_CLIENT_ID (runtime)": runtimeGoogleId ? `${runtimeGoogleId.slice(0, 20)}...` : "(vazio)",
    "GOOGLE_CLIENT_ID (build)": buildGoogleId ? "***" : "(vazio)",
    "googleClientId final": googleClientId ? "preenchido" : "VAZIO",
  };
}

if (typeof window !== "undefined") {
  (window as unknown as { __MASD_CAIXA_DEBUG__?: unknown }).__MASD_CAIXA_DEBUG__ = getConfigDebugSnapshot();
}

export function logConfigDebug(): void {
  if (typeof window === "undefined") return;
  const snap = getConfigDebugSnapshot();
  (window as unknown as { __MASD_CAIXA_DEBUG__?: unknown }).__MASD_CAIXA_DEBUG__ = snap;
  console.warn("[MASD Caixa config] Digite no console: __MASD_CAIXA_DEBUG__", snap);
}

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
