#!/bin/sh
set -e

# Obrigatório em produção: defina API_BASE_URL no serviço do FRONTEND (masd-caixa-web) no Railway
: "${API_BASE_URL:=http://localhost:8080/api}"

# Gera env.js em /tmp (sempre gravável); nginx serve esse arquivo em /env.js
printf '%s\n' "window.MASD_CAIXA = { API_BASE_URL: \"${API_BASE_URL}\" };" > /tmp/env.js

sed "s/\${PORT}/${PORT:-80}/g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
