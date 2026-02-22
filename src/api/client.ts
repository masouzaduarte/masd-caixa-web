import axios from "axios";

const runtimeBaseURL = typeof window !== "undefined" ? window.MASD_CAIXA?.API_BASE_URL : undefined;
const buildBaseURL = import.meta.env.VITE_API_BASE_URL;

let baseURL = runtimeBaseURL || buildBaseURL;

// Em produção, nunca usar localhost (indica que env.js não foi gerado no container ou variável no serviço errado)
const isLocalhost = (url: string) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(url);
if (import.meta.env.PROD && baseURL && isLocalhost(baseURL)) {
  baseURL = "";
}

// Em dev, se a API for localhost:8080, usa a URL direta do backend com context-path /api (CORS já permite localhost:*)
const devDirectOrigins = ["http://localhost:8080", "http://127.0.0.1:8080"];
if (import.meta.env.DEV && baseURL && devDirectOrigins.includes(baseURL)) {
  baseURL = baseURL.replace(/\/?$/, "") + "/api";
}

if (!baseURL && !import.meta.env.DEV) {
  throw new Error("API base URL não configurada (runtime ou VITE_API_BASE_URL).");
}
if (import.meta.env.DEV && !baseURL && !runtimeBaseURL && !buildBaseURL) {
  throw new Error("API base URL não configurada (runtime ou VITE_API_BASE_URL).");
}

/** URL da API para exibir em mensagens de erro (em dev com proxy mostra o backend real). */
export const apiBaseURL = baseURL || runtimeBaseURL || buildBaseURL || "";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
