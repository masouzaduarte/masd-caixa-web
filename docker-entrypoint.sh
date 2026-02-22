#!/bin/sh
set -e

# Obrigatório em produção: defina API_BASE_URL no serviço do FRONTEND (masd-caixa-web) no Railway
: "${API_BASE_URL:=http://localhost:8080/api}"

# Sobrescreve env.js para que o front use a URL da API em runtime (evita localhost em produção)
printf '%s\n' "window.MASD_CAIXA = { API_BASE_URL: \"${API_BASE_URL}\" };" > /usr/share/nginx/html/env.js

sed "s/\${PORT}/${PORT:-80}/g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
