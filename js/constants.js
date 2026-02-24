(() => {
  const ns = (window.portico = window.portico || {});

  ns.SCHEMA_VERSION = 4;
  ns.STATE_STORAGE_KEY = "portico_state";
  ns.LEGACY_LINKS_KEY = "portico_links_v1";
  ns.LEGACY_SETTINGS_KEY = "portico_settings_v1";
  ns.APP_VERSION = "1.0.0";

  ns.FONT_OPTIONS = [
    "Space Grotesk",
    "Manrope",
    "Sora",
    "Inter",
    "Figtree",
    "DM Sans",
    "Work Sans",
    "Montserrat",
    "Rubik",
    "Poppins",
    "Outfit",
    "Urbanist",
    "Jost",
    "Josefin Sans",
    "Oswald",
    "Oxygen",
    "Hind",
    "Plus Jakarta Sans",
    "Alegreya Sans",
    "Source Sans 3",
    "Libre Franklin",
    "Tinos",
    "Libre Baskerville",
    "Lora",
    "Merriweather",
    "Playfair Display",
    "Radley",
    "Besley",
    "Crimson Text",
    "Cormorant Garamond",
    "EB Garamond",
    "Bitter",
    "Fraunces",
    "Spectral",
    "Crimson Pro",
    "Anton",
    "Tangerine",
    "Lobster",
    "Pacifico",
    "Dancing Script",
    "Baloo 2",
    "Sacramento",
    "Great Vibes",
    "Italianno",
    "Nunito",
    "Quicksand",
    "Mulish",
    "Raleway",
    "IBM Plex Sans",
    "IBM Plex Serif",
    "Inconsolata",
    "JetBrains Mono",
    "IBM Plex Mono",
    "Space Mono",
  ];

  ns.DEFAULT_ICON = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><rect width='64' height='64' rx='12' fill='%23121a2a'/><path d='M20 44h24M20 32h24M20 20h16' stroke='%23f4b266' stroke-width='4' stroke-linecap='round'/></svg>";
  ns.DEFAULT_FOLDER_ICON = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><rect x='6' y='16' width='52' height='36' rx='10' fill='%23131b2a'/><path d='M8 24h48' stroke='%23e6abca' stroke-width='3' opacity='0.7'/><path d='M14 16h15l6 7' stroke='%23e6abca' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>";
  ns.DEFAULT_FOLDER_COLOR = "#0f141f";

  const BASE_DEFAULT_SETTINGS = {
    bgImage: "",
    bgOpacity: 100,
    bgBrightness: 100,
    bgContrast: 100,
    bgSaturation: 100,
    bgBlur: 0,
    fontFamily: "Space Grotesk",
    titleFontFamily: "Space Grotesk",
    subtitleFontFamily: "Space Grotesk",
    titleSize: 32,
    titleColor: "#e8eef7",
    subtitleSize: 14,
    subtitleColor: "#9aa5b1",
    tileTitleFontFamily: "Space Grotesk",
    tileTitleSize: 12,
    tileTitleColor: "#e8eef7",
    searchSize: 14,
    searchColor: "#e8eef7",
    widgetColor: "#c6d0df",
    iconSize: 40,
    iconRadius: 25,
    showLogo: true,
    logoImage: "",
    logoOpacity: 100,
    showSearchBar: true,
    showWidget: true,
    tempUnit: "C",
    clockFormat: "24h",
    searchEngine: "google",
    searchBrightness: 100,
    searchOpacity: 72,
    searchBlur: 8,
    titleText: "Portico",
    subtitleText: "Drag cards to reorder. Hover to see the URL.",
  };
  ns.DEFAULT_SETTINGS = {
    ...BASE_DEFAULT_SETTINGS,
    ...((ns.DEFAULT_PROFILE && ns.DEFAULT_PROFILE.settings) || {}),
  };

  ns.SEARCH_ENGINES = [
    { id: "google", label: "Google", url: "https://www.google.com/search?q={query}" },
    { id: "duckduckgo", label: "DuckDuckGo", url: "https://duckduckgo.com/?q={query}" },
    { id: "bing", label: "Bing", url: "https://www.bing.com/search?q={query}" },
    { id: "brave", label: "Brave", url: "https://search.brave.com/search?q={query}" },
    { id: "startpage", label: "Startpage", url: "https://www.startpage.com/do/search?query={query}" },
    { id: "yahoo", label: "Yahoo", url: "https://search.yahoo.com/search?p={query}" },
  ];

  const BASE_DEFAULT_WIDGETS = [
    {
      type: "link",
      visible: true,
      layout: { w: 1, h: 1 },
      config: { title: "Docs", url: "https://developer.mozilla.org", iconUrl: "" },
    },
    {
      type: "link",
      visible: true,
      layout: { w: 1, h: 1 },
      config: { title: "GitHub", url: "https://github.com", iconUrl: "" },
    },
    {
      type: "link",
      visible: true,
      layout: { w: 1, h: 1 },
      config: { title: "Calendar", url: "https://calendar.google.com", iconUrl: "" },
    },
  ];
  ns.DEFAULT_WIDGETS =
    Array.isArray(ns.DEFAULT_PROFILE?.widgets) && ns.DEFAULT_PROFILE.widgets.length > 0
      ? ns.DEFAULT_PROFILE.widgets
      : BASE_DEFAULT_WIDGETS;
})();
