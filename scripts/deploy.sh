#!/usr/bin/env sh
# Build the site and publish dist/ to the VPS.
# Usage: DEPLOY_HOST=<user>@<host> scripts/deploy.sh
# Only the teagar-site container is recreated; the shared Caddy is not touched.
set -eu

: "${DEPLOY_HOST:?set DEPLOY_HOST=<user>@<host>}"
DEPLOY_DIR="${DEPLOY_DIR:-/opt/apps/teagar.com.br}"

cd "$(dirname "$0")/.."
npm run build
npm test

tar -C deploy -cf - compose.yaml Caddyfile | ssh "$DEPLOY_HOST" "mkdir -p '$DEPLOY_DIR' && tar -xf - -C '$DEPLOY_DIR'"
tar -C dist -cf - . | ssh "$DEPLOY_HOST" "set -e
cd '$DEPLOY_DIR'
rm -rf dist.new && mkdir dist.new && tar -xf - -C dist.new
rm -rf dist.old && if [ -d dist ]; then mv dist dist.old; fi
mv dist.new dist
docker compose up -d --force-recreate
rm -rf dist.old"

for path in / /en/; do
	code=$(curl -s -o /dev/null -w '%{http_code}' "https://teagar.com.br$path")
	echo "https://teagar.com.br$path -> $code"
	[ "$code" = 200 ]
done
