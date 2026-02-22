#!/bin/sh
set -e

: "${API_BASE_URL:=http://localhost:8080}"

cat > /usr/share/nginx/html/env.js <<EOF
window.MASD_CAIXA = {
  API_BASE_URL: "${API_BASE_URL}"
};
EOF

sed "s/\${PORT}/${PORT:-80}/g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
