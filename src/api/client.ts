import axios from "axios";

/**
 * URL base da API — uma única fonte por ambiente:
 *
 * LOCAL (npm run dev):
 *   - .env: VITE_API_BASE_URL=http://localhost:8080
 *   - O client adiciona /api automaticamente (context-path do backend).
 *
 * PRODUÇÃO (Docker/Railway):
 *   - Opção A (recomendada): variável de BUILD VITE_API_BASE_URL no Railway
 *     (ex.: https://sua-api.up.railway.app/api) → valor fixo no bundle.
 *   - Opção B: variável de RUNTIME API_BASE_URL no Railway → entrypoint gera
 *     /env.js e o app usa window.MASD_CAIXA.API_BASE_URL.
 */

const isLocalhost = (url: string) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(url);

function getBaseURL(): string {
  const runtime = typeof window !== "undefined" ? window.MASD_CAIXA?.API_BASE_URL : undefined;
  const build = import.meta.env.VITE_API_BASE_URL;
  let url = runtime || build || "";

  // Produção: nunca usar localhost; se veio do env.js com default, tentar build
  if (import.meta.env.PROD && url && isLocalhost(url)) {
    url = build && !isLocalhost(build) ? build : "";
  }

  // Sempre terminar em /api (context-path do backend)
  if (url && !url.endsWith("/api")) {
    url = url.replace(/\/?$/, "") + "/api";
  }

  return url;
}

const baseURL = getBaseURL();

if (!baseURL) {
  const msg = import.meta.env.DEV
    ? "Defina VITE_API_BASE_URL no .env (ex.: http://localhost:8080)."
    : "Defina no Railway a variável VITE_API_BASE_URL (build) ou API_BASE_URL (runtime), ex.: https://sua-api.up.railway.app/api";
  throw new Error("API base URL não configurada. " + msg);
}

export const apiBaseURL = baseURL;

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});
