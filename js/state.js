(() => {
  const ns = (window.portico = window.portico || {});

  ns.state = {
    widgets: [],
    settings: { ...ns.DEFAULT_SETTINGS },
    ui: {
      editingId: null,
      editingFolderItem: null,
      openFolderId: null,
      sortableInstance: null,
      folderSortable: null,
      renderedWidgets: {},
    },
  };

  ns.dom = {
    grid: document.getElementById("grid"),
    gridWrap: document.getElementById("grid-wrap"),
    empty: document.getElementById("empty"),
    modal: document.getElementById("modal"),
    modalForm: document.getElementById("modal-form"),
    titleInput: document.getElementById("modal-title-input"),
    urlInput: document.getElementById("modal-url-input"),
    iconPreview: document.getElementById("icon-preview"),
    iconInput: document.getElementById("modal-icon-input"),
    modalTitle: document.getElementById("modal-title"),
    modalSubmit: document.querySelector("#modal-form button.primary"),
    folderModal: document.getElementById("folder-modal"),
    folderPanel: document.querySelector("#folder-modal .folder-panel"),
    folderName: document.getElementById("folder-name"),
    folderColorSwatch: document.getElementById("folder-color-swatch"),
    folderColorNativeInput: document.getElementById("folder-color-native-input"),
    folderGrid: document.getElementById("folder-grid"),
    settingsModal: document.getElementById("settings-modal"),
    openSettingsBtn: document.getElementById("open-settings"),
    settingsForm: document.getElementById("settings-form"),
    searchSettingsSection: document.getElementById("search-settings-section"),
    widgetSettingsSection: document.getElementById("widget-settings-section"),
    bgImageInput: document.getElementById("bg-image-input"),
    bgImageFileBtn: document.getElementById("bg-image-file-btn"),
    bgImageFileInput: document.getElementById("bg-image-file"),
    bgOpacityInput: document.getElementById("bg-opacity-input"),
    bgBrightnessInput: document.getElementById("bg-brightness-input"),
    bgContrastInput: document.getElementById("bg-contrast-input"),
    bgSaturationInput: document.getElementById("bg-saturation-input"),
    bgBlurInput: document.getElementById("bg-blur-input"),
    bgOpacityValue: document.getElementById("bg-opacity-value"),
    bgBrightnessValue: document.getElementById("bg-brightness-value"),
    bgContrastValue: document.getElementById("bg-contrast-value"),
    bgSaturationValue: document.getElementById("bg-saturation-value"),
    bgBlurValue: document.getElementById("bg-blur-value"),
    titleFontSelect: document.getElementById("title-font-select"),
    subtitleFontSelect: document.getElementById("subtitle-font-select"),
    tileTitleFontSelect: document.getElementById("tile-title-font-select"),
    showSearchInput: document.getElementById("show-search-input"),
    showWidgetInput: document.getElementById("show-widget-input"),
    tempUnitInput: document.getElementById("temp-unit-input"),
    clockFormatInput: document.getElementById("clock-format-input"),
    searchEngineSelect: document.getElementById("search-engine-select"),
    searchBrightnessInput: document.getElementById("search-brightness-input"),
    searchOpacityInput: document.getElementById("search-opacity-input"),
    searchBlurInput: document.getElementById("search-blur-input"),
    searchSizeInput: document.getElementById("search-size-input"),
    titleSizeInput: document.getElementById("title-size-input"),
    subtitleSizeInput: document.getElementById("subtitle-size-input"),
    tileTitleSizeInput: document.getElementById("tile-title-size-input"),
    searchBrightnessValue: document.getElementById("search-brightness-value"),
    searchOpacityValue: document.getElementById("search-opacity-value"),
    searchBlurValue: document.getElementById("search-blur-value"),
    searchSizeValue: document.getElementById("search-size-value"),
    titleSizeValue: document.getElementById("title-size-value"),
    subtitleSizeValue: document.getElementById("subtitle-size-value"),
    tileTitleSizeValue: document.getElementById("tile-title-size-value"),
    titleColorInput: document.getElementById("title-color-input"),
    titleColorSwatch: document.getElementById("title-color-swatch"),
    subtitleColorInput: document.getElementById("subtitle-color-input"),
    subtitleColorSwatch: document.getElementById("subtitle-color-swatch"),
    tileTitleColorInput: document.getElementById("tile-title-color-input"),
    tileTitleColorSwatch: document.getElementById("tile-title-color-swatch"),
    searchColorInput: document.getElementById("search-color-input"),
    searchColorSwatch: document.getElementById("search-color-swatch"),
    widgetColorInput: document.getElementById("widget-color-input"),
    widgetColorSwatch: document.getElementById("widget-color-swatch"),
    iconSizeInput: document.getElementById("icon-size-input"),
    iconSizeValue: document.getElementById("icon-size-value"),
    iconRadiusInput: document.getElementById("icon-radius-input"),
    iconRadiusValue: document.getElementById("icon-radius-value"),
    showLogoInput: document.getElementById("show-logo-input"),
    logoImageInput: document.getElementById("logo-image-input"),
    logoImageFileBtn: document.getElementById("logo-image-file-btn"),
    logoImageFileInput: document.getElementById("logo-image-file"),
    logoOpacityInput: document.getElementById("logo-opacity-input"),
    logoOpacityValue: document.getElementById("logo-opacity-value"),
    settingsResetBtn: document.getElementById("settings-reset"),
    profileExportBtn: document.getElementById("profile-export"),
    profileImportBtn: document.getElementById("profile-import"),
    profileImportFileInput: document.getElementById("profile-import-file"),
    profileImportOptionsModal: document.getElementById("profile-import-options-modal"),
    importSettingsCheckbox: document.getElementById("import-settings-checkbox"),
    importLinksCheckbox: document.getElementById("import-links-checkbox"),
    profileImportApplyBtn: document.getElementById("profile-import-apply"),
    pageTitle: document.getElementById("page-title"),
    pageSubtitle: document.getElementById("page-subtitle"),
    searchForm: document.getElementById("search-form"),
    searchShell: document.getElementById("search-shell"),
    searchInput: document.getElementById("search-input"),
    searchSubmit: document.getElementById("search-submit"),
    ambientWidget: document.getElementById("ambient-widget"),
    ambientClock: document.getElementById("ambient-clock"),
    ambientLocation: document.getElementById("ambient-location"),
    ambientWeatherIcon: document.getElementById("ambient-weather-icon"),
    ambientWeatherText: document.getElementById("ambient-weather-text"),
    brandIcon: document.getElementById("brand-icon"),
    toastStack: document.getElementById("toast-stack"),
  };

  ns.notificationQueue = [];
  ns.notify = (message, type = "error") => {
    if (ns.ui && typeof ns.ui.showToast === "function") {
      ns.ui.showToast(message, type);
      return;
    }
    ns.notificationQueue.push({ message, type });
  };

  ns.stateStore = {
    persist() {
      if (ns.storage) return ns.storage.write(ns.state);
      return false;
    },

    setState(next, options = {}) {
      const patch = typeof next === "function" ? next(ns.state) : next;
      if (!patch || typeof patch !== "object") return ns.state;

      if (patch.widgets !== undefined) ns.state.widgets = patch.widgets;
      if (patch.settings !== undefined) ns.state.settings = patch.settings;
      if (patch.ui !== undefined) ns.state.ui = patch.ui;

      if (options.persist !== false && ns.storage) {
        ns.storage.write(ns.state);
      }
      if (options.applySettings && ns.settingsModule) {
        ns.settingsModule.applyToCss();
        ns.settingsModule.ensureFontsLoaded([
          ns.state.settings.titleFontFamily || ns.state.settings.fontFamily,
          ns.state.settings.subtitleFontFamily || ns.state.settings.fontFamily,
          ns.state.settings.tileTitleFontFamily || ns.state.settings.fontFamily,
        ]);
      }
      if (options.render && ns.ui) {
        ns.ui.render();
      } else if (options.updateGrid && ns.ui) {
        ns.ui.updateGridLayout();
      }

      return ns.state;
    },

    updateState(updater, options = {}) {
      if (typeof updater !== "function") return this.setState(updater, options);
      return this.setState((current) => updater(current), options);
    },
  };
})();
