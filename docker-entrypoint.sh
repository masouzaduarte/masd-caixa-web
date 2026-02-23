#!/bin/sh
set -e
sed "s/\${PORT}/${PORT:-80}/g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Injetar variáveis de runtime no frontend (build já gravou config.js; aqui só atualizamos se runtime tiver valor)
CONFIG_JS="/usr/share/nginx/html/config.js"
API_FILE="/usr/share/nginx/html/.api_url"
GOOGLE_ID_FILE="/usr/share/nginx/html/.google_client_id"
escape_js() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g; s/'"'"'/\\'"'"'/g'; }
# Preferir runtime; senão usar valor gravado no build
API_VAL="$(escape_js "${VITE_API_BASE_URL:-}")"
[ -z "$API_VAL" ] && [ -f "$API_FILE" ] && API_VAL="$(escape_js "$(cat "$API_FILE")")"
GOOGLE_VAL="$(escape_js "${VITE_GOOGLE_CLIENT_ID:-${GOOGLE_CLIENT_ID:-}}")"
[ -z "$GOOGLE_VAL" ] && [ -f "$GOOGLE_ID_FILE" ] && GOOGLE_VAL="$(escape_js "$(cat "$GOOGLE_ID_FILE")")"
printf 'window.MASD_CAIXA={"API_BASE_URL":"%s","GOOGLE_CLIENT_ID":"%s"};\n' "$API_VAL" "$GOOGLE_VAL" > "$CONFIG_JS"
chmod 644 "$CONFIG_JS"

exec nginx -g 'daemon off;'
