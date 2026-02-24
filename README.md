<p align="center">
<img src="/icons/Portico_icon.svg"
</p>

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

## Installation

For now, just set your browser to start on:

https://rebelmastermind.github.io/Portico/

- Any changes you make will be remembered and stored locally
- Changes are stored by-browser so you can have diferent personalizations for Firefox, Chrome, Opera, etc.

We're getting Portico as an extension for Chrome, Brave, Vivaldi and other Chromium-based browsers on Google Web Store as soon as it's working reliably.

## Offline Behavior

- Portico caches its own static files with a service worker (`sw.js`).
- Weather requests are always network-first (no stale forecast cache).
- SortableJS is loaded from CDN, and Portico now runtime-caches that script after first successful load.
- Result: after one online load, Portico can work offline more reliably.
