#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
WEB_DIR="$DIST_DIR/web"
EXT_DIR="$DIST_DIR/extension"

echo "[Portico] Cleaning dist output..."
rm -rf "$WEB_DIR" "$EXT_DIR"
mkdir -p "$WEB_DIR" "$EXT_DIR"

echo "[Portico] Building web target..."
rsync -a --delete \
  --exclude "dist" \
  --exclude "extension" \
  --exclude "scripts" \
  "$ROOT_DIR/" "$WEB_DIR/"

echo "[Portico] Building extension target..."
rsync -a --delete \
  --exclude "dist" \
  --exclude "extension" \
  --exclude "scripts" \
  "$ROOT_DIR/" "$EXT_DIR/"

cp "$ROOT_DIR/Portico.html" "$EXT_DIR/newtab.html"
cp "$ROOT_DIR/extension/manifest.json" "$EXT_DIR/manifest.json"
rm -f "$EXT_DIR/manifest.webmanifest"

VENDOR_SORTABLE="$ROOT_DIR/js/vendor/Sortable.min.js"
if [[ -f "$VENDOR_SORTABLE" ]]; then
  mkdir -p "$EXT_DIR/js/vendor"
  cp "$VENDOR_SORTABLE" "$EXT_DIR/js/vendor/Sortable.min.js"
  sed -i \
    's|<script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js"></script>|<script src="js/vendor/Sortable.min.js"></script>|' \
    "$EXT_DIR/newtab.html"
  echo "[Portico] Extension uses local SortableJS vendor file."
else
  sed -i '/sortablejs@1\.15\.2\/Sortable\.min\.js/d' "$EXT_DIR/newtab.html"
  echo "[Portico] WARNING: js/vendor/Sortable.min.js not found."
  echo "[Portico]          Extension build disables tile drag/reorder/folder-merge until vendored."
fi

mkdir -p "$EXT_DIR/icons"
magick "$ROOT_DIR/icons/Portico_icon.svg" -background none -resize 16x16 "$EXT_DIR/icons/portico-16.png"
magick "$ROOT_DIR/icons/Portico_icon.svg" -background none -resize 32x32 "$EXT_DIR/icons/portico-32.png"
magick "$ROOT_DIR/icons/Portico_icon.svg" -background none -resize 48x48 "$EXT_DIR/icons/portico-48.png"
magick "$ROOT_DIR/icons/Portico_icon.svg" -background none -resize 128x128 "$EXT_DIR/icons/portico-128.png"

echo "[Portico] Build complete:"
echo "  - Web: $WEB_DIR"
echo "  - Extension: $EXT_DIR"
