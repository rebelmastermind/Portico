![Portico](icons/Portico_icon.svg)

# Portico

Portico is a customizable start page / new tab experience focused on speed, aesthetics, and local-first privacy.

You can use it as a personal launchpad with drag-and-drop links, folders, weather info, and deep visual settings.

## What Portico Does

- Displays your links as a clean icon grid.
- Supports drag-and-drop reordering.
- Lets you create folders by dropping one tile over another.
- Includes a search bar with selectable search engines.
- Includes a compact ambient widget:
  - clock
  - location
  - weather
- Offers extensive style controls:
  - background image + visual filters
  - fonts, sizes, colors
  - icon size + roundness
  - search/widget visibility and styling

## What Portico Does NOT

- Hide features behind a premium plan
- Use your data in any way

## Privacy & Data

Portico is client-side and local-first:

- Your setup is saved in your browser storage (`localStorage`).
- No account required.
- No backend required.

You can move setups across browsers/devices using:

- **Export Profile**
- **Import Profile** (with selective import for `Settings` and `Links and folders`)

## Run Local (Development)

```bash
cd /home/raul/Documentos/Code
python3 -m http.server 8000
```

Open:

`http://localhost:8000/Portico/Portico.html`

Using `localhost` gives more stable permission behavior than opening with `file://`.

## Build Targets (Web + Extension)

Portico now supports two outputs from the same source:

- `dist/web` for GitHub Pages (or any static hosting)
- `dist/extension` for Chrome extension packaging

Run:

```bash
cd /home/raul/Documentos/Code/Portico
./scripts/build-targets.sh
```

## Publish Web (GitHub Pages)

This repo includes `.github/workflows/deploy-pages.yml` for auto-deploy.

1. Push this project to a GitHub repository.
2. In GitHub: `Settings` -> `Pages` -> `Source`, choose **GitHub Actions**.
3. Push to `main`.
4. The workflow builds `dist/web` and deploys it automatically.
5. Open the published URL from the Pages environment.

You can also trigger deployment manually from `Actions` -> `Deploy Portico Pages` -> `Run workflow`.

## Chrome Extension (New Tab)

1. Build with `./scripts/build-targets.sh`.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select `Portico/dist/extension`.

For Chrome Web Store:

1. Zip the contents of `Portico/dist/extension` (files inside, not the parent folder).
2. Upload that zip in your Developer Dashboard.

Important:

- Chrome extensions cannot use remote hosted JS for store submissions.
- Portico expects a local vendor file at `js/vendor/Sortable.min.js` for full drag/folder behavior in extension mode.
- If that file is missing, the build removes CDN Sortable from extension output and drag/reorder/folder-merge in main grid is disabled.

## Offline Behavior

- Portico caches its own static files with a service worker (`sw.js`).
- Weather requests are always network-first (no stale forecast cache).
- SortableJS is loaded from CDN, and Portico now runtime-caches that script after first successful load.
- Result: after one online load, Portico can work offline more reliably.

## Service Worker Versioning

`sw.js` uses:

- `PORTICO_CACHE_VERSION = "v1.0.0"`

When you publish changes:

1. Bump that version (example: `v1.0.1`).
2. Deploy.
3. Reload once to let the new service worker activate.

This ensures old cached files are replaced cleanly.

## Dependency Strategy

Current decision:

- Keep SortableJS on CDN for simplicity.
- Cache it at runtime for offline resilience.

If you want fully self-contained offline behavior from first load (and Chrome Web Store compliance), vendor `Sortable.min.js` into `Portico/js/vendor/`. The build script auto-wires it for the extension target.
