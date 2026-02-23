#!/bin/sh
set -e
sed "s/\${PORT}/${PORT:-80}/g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Injetar variáveis de runtime no frontend (Railway envia em runtime, não no build)
# O app lê window.MASD_CAIXA.API_BASE_URL e window.MASD_CAIXA.GOOGLE_CLIENT_ID
CONFIG_JS="/usr/share/nginx/html/config.js"
escape_js() { echo "$1" | sed 's/\\/\\\\/g; s/"/\\"/g; s/'"'"'/\\'"'"'/g'; }
API_VAL="$(escape_js "${VITE_API_BASE_URL:-}")"
GOOGLE_VAL="$(escape_js "${VITE_GOOGLE_CLIENT_ID:-}")"
printf 'window.MASD_CAIXA={"API_BASE_URL":"%s","GOOGLE_CLIENT_ID":"%s"};\n' "$API_VAL" "$GOOGLE_VAL" > "$CONFIG_JS"

exec nginx -g 'daemon off;'
