#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
WEB_DIR="$DIST_DIR/web"

echo "[Portico] Cleaning web output..."
rm -rf "$WEB_DIR"
mkdir -p "$WEB_DIR"

echo "[Portico] Building web target..."
rsync -a --delete \
  --exclude "dist" \
  --exclude "extension" \
  --exclude "scripts" \
  "$ROOT_DIR/" "$WEB_DIR/"

if [[ -f "$WEB_DIR/Portico.html" ]]; then
  cp "$WEB_DIR/Portico.html" "$WEB_DIR/index.html"
fi

echo "[Portico] Web build complete: $WEB_DIR"
