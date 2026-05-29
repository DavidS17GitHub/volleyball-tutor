#!/bin/sh
set -eu

cat > /usr/share/nginx/html/config.js <<EOF
window.__APP_CONFIG__ = {
  azureVideoBaseUrl: "${VITE_AZURE_VIDEO_BASE_URL:-}",
  lessonsMetadataUrl: "${VITE_LESSONS_METADATA_URL:-/lessons.json}",
  authClientId: "${VITE_AUTH_CLIENT_ID:-}",
  authAuthority: "${VITE_AUTH_AUTHORITY:-}",
  authApiScope: "${VITE_AUTH_API_SCOPE:-}"
};
EOF

exec "$@"
