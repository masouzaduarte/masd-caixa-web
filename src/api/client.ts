import axios from "axios";

/**
 * URL da API: sempre via VITE_API_BASE_URL (.env local / variável no Railway no build).
 * O app adiciona /api no final (context-path do backend).
 */
const raw = import.meta.env.VITE_API_BASE_URL ?? "";
const baseURL = raw ? raw.replace(/\/?$/, "") + "/api" : "";

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
