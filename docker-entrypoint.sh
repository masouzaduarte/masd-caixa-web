#!/bin/sh
set -e
sed "s/\${PORT}/${PORT:-80}/g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
