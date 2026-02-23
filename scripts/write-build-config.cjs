/**
 * Roda durante o Docker build. Grava config.js e arquivos de fallback
 * para o entrypoint usar em runtime (Railway pode não injetar vars no container).
 * Lê: process.env.VITE_API_BASE_URL, process.env.VITE_GOOGLE_CLIENT_ID
 */
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const apiUrl = (process.env.VITE_API_BASE_URL || '').trim();
const googleId = (process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '').trim();

const config = {
  API_BASE_URL: apiUrl,
  GOOGLE_CLIENT_ID: googleId,
};
const configJs = `window.MASD_CAIXA=${JSON.stringify(config)};\n`;
fs.writeFileSync(path.join(dist, 'config.js'), configJs, 'utf8');

fs.writeFileSync(path.join(dist, '.api_url'), apiUrl, 'utf8');
fs.writeFileSync(path.join(dist, '.google_client_id'), googleId, 'utf8');

console.log('[write-build-config] config.js written; GOOGLE_CLIENT_ID length:', googleId.length);
