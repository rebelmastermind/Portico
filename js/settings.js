(() => {
  const ns = (window.portico = window.portico || {});
  const { dom, state, storage, stateStore, utils } = ns;
  let settingsPersistTimer = null;
  let pendingProfileImport = null;
  const FONT_SELECT_FIELDS = [
    { selectKey: "uiFontSelect", settingKey: "uiFontFamily" },
    { selectKey: "titleFontSelect", settingKey: "titleFontFamily" },
    { selectKey: "subtitleFontSelect", settingKey: "subtitleFontFamily" },
    { selectKey: "tileTitleFontSelect", settingKey: "tileTitleFontFamily" },
  ];
  const RANGE_FIELDS = [
    { inputKey: "bgOpacityInput", valueKey: "bgOpacityValue", suffix: "%" },
    { inputKey: "bgBrightnessInput", valueKey: "bgBrightnessValue", suffix: "%" },
    { inputKey: "bgContrastInput", valueKey: "bgContrastValue", suffix: "%" },
    { inputKey: "bgSaturationInput", valueKey: "bgSaturationValue", suffix: "%" },
    { inputKey: "bgBlurInput", valueKey: "bgBlurValue", suffix: "px" },
    { inputKey: "titleSizeInput", valueKey: "titleSizeValue", suffix: "px" },
    { inputKey: "subtitleSizeInput", valueKey: "subtitleSizeValue", suffix: "px" },
    { inputKey: "tileTitleSizeInput", valueKey: "tileTitleSizeValue", suffix: "px" },
    { inputKey: "iconSizeInput", valueKey: "iconSizeValue", suffix: "px" },
    { inputKey: "iconRadiusInput", valueKey: "iconRadiusValue", suffix: "%" },
    { inputKey: "logoOpacityInput", valueKey: "logoOpacityValue", suffix: "%" },
    { inputKey: "buttonOpacityInput", valueKey: "buttonOpacityValue", suffix: "%" },
    { inputKey: "buttonBlurInput", valueKey: "buttonBlurValue", suffix: "px" },
    { inputKey: "tileBgOpacityInput", valueKey: "tileBgOpacityValue", suffix: "%" },
    { inputKey: "tileBgBlurInput", valueKey: "tileBgBlurValue", suffix: "px" },
    { inputKey: "gridGapInput", valueKey: "gridGapValue", suffix: "px" },
    { inputKey: "pageMaxWidthInput", valueKey: "pageMaxWidthValue", suffix: "px" },
    { inputKey: "pageSidePaddingInput", valueKey: "pageSidePaddingValue", suffix: "px" },
    { inputKey: "searchSizeInput", valueKey: "searchSizeValue", suffix: "px" },
    { inputKey: "searchBrightnessInput", valueKey: "searchBrightnessValue", suffix: "%" },
    { inputKey: "searchOpacityInput", valueKey: "searchOpacityValue", suffix: "%" },
    { inputKey: "searchBlurInput", valueKey: "searchBlurValue", suffix: "px" },
  ];
  const SWATCH_FIELDS = [
    { swatchKey: "titleColorSwatch", inputKey: "titleColorInput", settingKey: "titleColor" },
    { swatchKey: "subtitleColorSwatch", inputKey: "subtitleColorInput", settingKey: "subtitleColor" },
    { swatchKey: "tileTitleColorSwatch", inputKey: "tileTitleColorInput", settingKey: "tileTitleColor" },
    { swatchKey: "searchColorSwatch", inputKey: "searchColorInput", settingKey: "searchColor" },
    { swatchKey: "widgetColorSwatch", inputKey: "widgetColorInput", settingKey: "widgetColor" },
    { swatchKey: "buttonColorSwatch", inputKey: "buttonColorInput", settingKey: "buttonColor" },
    { swatchKey: "buttonIconColorSwatch", inputKey: "buttonIconColorInput", settingKey: "buttonIconColor" },
    { swatchKey: "tileBgColorSwatch", inputKey: "tileBgColorInput", settingKey: "tileBackgroundColor" },
  ];
  const FORM_FIELD_KEYS = [
    "uiFontFamily",
    "bgImage",
    "bgOpacity",
    "bgBrightness",
    "bgContrast",
    "bgSaturation",
    "bgBlur",
    "titleFontFamily",
    "subtitleFontFamily",
    "tileTitleFontFamily",
    "titleSize",
    "subtitleSize",
    "tileTitleSize",
    "titleColor",
    "subtitleColor",
    "tileTitleColor",
    "iconSize",
    "iconRadius",
    "showLogo",
    "logoImage",
    "logoOpacity",
    "performanceMode",
    "buttonColor",
    "buttonIconColor",
    "buttonOpacity",
    "buttonBlur",
    "tileBackgroundColor",
    "tileBackgroundOpacity",
    "tileBackgroundBlur",
    "gridGap",
    "pageMaxWidth",
    "pageSidePadding",
    "showSearchBar",
    "searchEngine",
    "searchSize",
    "searchColor",
    "searchBrightness",
    "searchOpacity",
    "searchBlur",
    "showWidget",
    "tempUnit",
    "clockFormat",
    "widgetColor",
  ];
  const getSettingsFormValue = (key) => {
    switch (key) {
      case "uiFontFamily": return dom.uiFontSelect.value;
      case "bgImage": return dom.bgImageInput.value.trim();
      case "bgOpacity": return Number(dom.bgOpacityInput.value);
      case "bgBrightness": return Number(dom.bgBrightnessInput.value);
      case "bgContrast": return Number(dom.bgContrastInput.value);
      case "bgSaturation": return Number(dom.bgSaturationInput.value);
      case "bgBlur": return Number(dom.bgBlurInput.value);
      case "titleFontFamily": return dom.titleFontSelect.value;
      case "subtitleFontFamily": return dom.subtitleFontSelect.value;
      case "tileTitleFontFamily": return dom.tileTitleFontSelect.value;
      case "titleSize": return Number(dom.titleSizeInput.value);
      case "subtitleSize": return Number(dom.subtitleSizeInput.value);
      case "tileTitleSize": return Number(dom.tileTitleSizeInput.value);
      case "titleColor": return dom.titleColorInput.value.trim();
      case "subtitleColor": return dom.subtitleColorInput.value.trim();
      case "tileTitleColor": return dom.tileTitleColorInput.value.trim();
      case "iconSize": return Number(dom.iconSizeInput.value);
      case "iconRadius": return Number(dom.iconRadiusInput.value);
      case "showLogo": return dom.showLogoInput.checked;
      case "logoImage": return dom.logoImageInput.value.trim();
      case "logoOpacity": return Number(dom.logoOpacityInput.value);
      case "performanceMode": return dom.performanceModeInput.checked;
      case "buttonColor": return dom.buttonColorInput.value.trim();
      case "buttonIconColor": return dom.buttonIconColorInput.value.trim();
      case "buttonOpacity": return Number(dom.buttonOpacityInput.value);
      case "buttonBlur": return Number(dom.buttonBlurInput.value);
      case "tileBackgroundColor": return dom.tileBgColorInput.value.trim();
      case "tileBackgroundOpacity": return Number(dom.tileBgOpacityInput.value);
      case "tileBackgroundBlur": return Number(dom.tileBgBlurInput.value);
      case "gridGap": return Number(dom.gridGapInput.value);
      case "pageMaxWidth": return Number(dom.pageMaxWidthInput.value);
      case "pageSidePadding": return Number(dom.pageSidePaddingInput.value);
      case "showSearchBar": return dom.showSearchInput.checked;
      case "searchEngine": return dom.searchEngineSelect.value;
      case "searchSize": return Number(dom.searchSizeInput.value);
      case "searchColor": return dom.searchColorInput.value.trim();
      case "searchBrightness": return Number(dom.searchBrightnessInput.value);
      case "searchOpacity": return Number(dom.searchOpacityInput.value);
      case "searchBlur": return Number(dom.searchBlurInput.value);
      case "showWidget": return dom.showWidgetInput.checked;
      case "tempUnit": return dom.tempUnitInput.checked ? "F" : "C";
      case "clockFormat": return dom.clockFormatInput.checked ? "12h" : "24h";
      case "widgetColor": return dom.widgetColorInput.value.trim();
      default: return undefined;
    }
  };
  const readTextFile = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => reject(new Error("Could not read file"));
      reader.readAsText(file);
    });
  const downloadJson = (payload, fileNamePrefix) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const fileName = `${fileNamePrefix}-${stamp}.json`;
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  ns.settingsModule = {
    getDragAnimationDuration() {
      return state.settings.performanceMode ? 170 : 260;
    },

    getDragEasing() {
      return state.settings.performanceMode
        ? "cubic-bezier(0.22, 0.8, 0.22, 1)"
        : "cubic-bezier(0.16, 1, 0.3, 1)";
    },

    syncInteractionPerformance() {
      const animation = this.getDragAnimationDuration();
      const easing = this.getDragEasing();
      if (state.ui.sortableInstance) {
        state.ui.sortableInstance.option("animation", animation);
        state.ui.sortableInstance.option("easing", easing);
      }
      if (state.ui.folderSortable) {
        state.ui.folderSortable.option("animation", animation);
        state.ui.folderSortable.option("easing", easing);
      }
    },

    applyToCss() {
      const s = state.settings;
      const root = document.documentElement;
      const bgImage = s.bgImage ? `url("${s.bgImage}")` : "none";
      const blurScale = s.performanceMode ? 0.62 : 1;
      const buttonRgb = utils.hexToRgbTriplet(s.buttonColor, "17, 22, 34");
      const buttonOpacity = Math.max(0, Math.min(1, s.buttonOpacity / 100));
      const tileBgRgb = utils.hexToRgbTriplet(s.tileBackgroundColor, "17, 22, 34");
      const tileBgOpacity = Math.max(0, Math.min(1, s.tileBackgroundOpacity / 100));

      root.style.setProperty("--bg-image", bgImage);
      root.style.setProperty("--bg-opacity", (s.bgOpacity / 100).toFixed(2));
      root.style.setProperty("--bg-brightness", (s.bgBrightness / 100).toFixed(2));
      root.style.setProperty("--bg-contrast", (s.bgContrast / 100).toFixed(2));
      root.style.setProperty("--bg-saturation", (s.bgSaturation / 100).toFixed(2));
      root.style.setProperty("--bg-blur", `${s.bgBlur}px`);
      root.style.setProperty("--bg-blur-effective", `${(s.bgBlur * blurScale).toFixed(2)}px`);
      root.style.setProperty("--font-family", s.uiFontFamily || s.fontFamily || '"Space Grotesk", "Figtree", "Segoe UI", sans-serif');
      root.style.setProperty("--title-font-family", s.titleFontFamily || s.fontFamily || '"Space Grotesk", "Figtree", "Segoe UI", sans-serif');
      root.style.setProperty("--subtitle-font-family", s.subtitleFontFamily || s.fontFamily || '"Space Grotesk", "Figtree", "Segoe UI", sans-serif');
      root.style.setProperty("--tile-title-font-family", s.tileTitleFontFamily || s.fontFamily || '"Space Grotesk", "Figtree", "Segoe UI", sans-serif');
      root.style.setProperty("--title-size", `${s.titleSize}px`);
      root.style.setProperty("--title-color", s.titleColor || "#e8eef7");
      root.style.setProperty("--subtitle-size", `${s.subtitleSize}px`);
      root.style.setProperty("--subtitle-color", s.subtitleColor || "#9aa5b1");
      root.style.setProperty("--tile-title-size", `${s.tileTitleSize}px`);
      root.style.setProperty("--tile-title-color", s.tileTitleColor || "#e8eef7");
      root.style.setProperty("--search-size", `${s.searchSize}px`);
      root.style.setProperty("--search-color", s.searchColor || "#e8eef7");
      root.style.setProperty("--widget-color", s.widgetColor || "#c6d0df");
      root.style.setProperty("--icon-size", `${s.iconSize}px`);
      root.style.setProperty("--icon-radius", `${s.iconRadius}`);
      root.style.setProperty("--search-brightness", `${(s.searchBrightness / 100).toFixed(2)}`);
      root.style.setProperty("--search-opacity", `${(s.searchOpacity / 100).toFixed(2)}`);
      root.style.setProperty("--search-blur", `${s.searchBlur}px`);
      root.style.setProperty("--search-blur-effective", `${(s.searchBlur * blurScale).toFixed(2)}px`);
      root.style.setProperty("--button-rgb", buttonRgb);
      root.style.setProperty("--button-surface-opacity", `${buttonOpacity.toFixed(2)}`);
      root.style.setProperty("--button-bg", `rgba(${buttonRgb}, ${buttonOpacity.toFixed(2)})`);
      root.style.setProperty("--button-bg-strong", `rgba(${buttonRgb}, ${Math.min(1, buttonOpacity + 0.18).toFixed(2)})`);
      root.style.setProperty("--button-bg-subtle", `rgba(${buttonRgb}, ${Math.max(0.12, buttonOpacity * 0.72).toFixed(2)})`);
      root.style.setProperty("--button-blur", `${s.buttonBlur}px`);
      root.style.setProperty("--button-blur-effective", `${(s.buttonBlur * blurScale).toFixed(2)}px`);
      root.style.setProperty("--button-icon-color", s.buttonIconColor || "#9aa5b1");
      root.style.setProperty("--tile-bg-rgb", tileBgRgb);
      root.style.setProperty("--tile-bg-opacity", `${tileBgOpacity.toFixed(2)}`);
      root.style.setProperty("--tile-bg-surface", `rgba(${tileBgRgb}, ${tileBgOpacity.toFixed(2)})`);
      root.style.setProperty("--tile-bg-blur", `${s.tileBackgroundBlur}px`);
      root.style.setProperty("--tile-bg-blur-effective", `${(s.tileBackgroundBlur * blurScale).toFixed(2)}px`);
      root.style.setProperty("--grid-gap", `${s.gridGap}px`);
      root.style.setProperty("--page-max-width", `${s.pageMaxWidth}px`);
      root.style.setProperty("--page-side-padding", `${s.pageSidePadding}px`);
      root.dataset.performanceMode = s.performanceMode ? "on" : "off";

      dom.pageTitle.textContent = s.titleText;
      dom.pageSubtitle.textContent = s.subtitleText;
      dom.brandIcon.hidden = s.showLogo === false;
      dom.brandIcon.src = s.logoImage ? s.logoImage : "icons/Portico_icon.svg";
      dom.brandIcon.style.opacity = `${Math.max(0, Math.min(100, s.logoOpacity)) / 100}`;
      dom.searchForm.hidden = s.showSearchBar === false;
      dom.ambientWidget.hidden = s.showWidget === false;
      this.syncSectionDisabledStates();
      this.syncInteractionPerformance();
      const selected = ns.SEARCH_ENGINES.find((engine) => engine.id === s.searchEngine) || ns.SEARCH_ENGINES[0];
      dom.searchInput.placeholder = `Search with ${selected.label}`;
      if (ns.ambientWidget && typeof ns.ambientWidget.refreshPresentation === "function") {
        ns.ambientWidget.refreshPresentation();
      }
    },

    ensureFontLoaded(font) {
      if (!font) return;
      return this.ensureFontsLoaded([font]);
    },

    ensureFontsLoaded(fonts) {
      const unique = [...new Set((fonts || []).filter(Boolean))];
      if (unique.length === 0) return;
      const id = "google-font-link";
      const families = unique.map((font) => `family=${font.replace(/\s+/g, "+")}:wght@300;400;500;600;700`);
      const href = `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;

      const existing = document.getElementById(id);
      if (existing) {
        existing.href = href;
        return;
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.id = id;
      link.href = href;
      document.head.appendChild(link);
    },

    ensurePreviewFontsLoaded() {
      if (this.previewFontsLoaded) return;
      const id = "google-font-preview-link";
      const families = ns.FONT_OPTIONS
        .map((font) => `family=${font.replace(/\s+/g, "+")}:wght@300;400;500;600;700`)
        .join("&");
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.id = id;
      link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
      document.head.appendChild(link);
      this.previewFontsLoaded = true;
    },

    populateFontOptions() {
      FONT_SELECT_FIELDS.forEach(({ selectKey }) => {
        if (dom[selectKey]) dom[selectKey].innerHTML = "";
      });

      ns.FONT_GROUPS.forEach((group) => {
        FONT_SELECT_FIELDS.forEach(({ selectKey }) => {
          const select = dom[selectKey];
          if (!select) return;
          const optgroup = document.createElement("optgroup");
          optgroup.label = group.label;
          group.options.forEach((font) => {
            const option = document.createElement("option");
            option.value = font;
            option.textContent = font;
            option.style.fontFamily = `"${font}", sans-serif`;
            optgroup.append(option);
          });
          select.append(optgroup);
        });
      });
    },

    ensureSelectHasOption(select, value, groupLabel = "Saved") {
      if (!select || !value) return;
      const hasOption = Array.from(select.options).some((option) => option.value === value);
      if (hasOption) return;
      let group = Array.from(select.children).find(
        (element) => element.tagName === "OPTGROUP" && element.label === groupLabel
      );
      if (!group) {
        group = document.createElement("optgroup");
        group.label = groupLabel;
        select.prepend(group);
      }
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      option.style.fontFamily = `"${value}", sans-serif`;
      group.append(option);
    },

    populateSearchEngineOptions() {
      dom.searchEngineSelect.innerHTML = "";
      ns.SEARCH_ENGINES.forEach((engine) => {
        const option = document.createElement("option");
        option.value = engine.id;
        option.textContent = engine.label;
        dom.searchEngineSelect.append(option);
      });
    },

    updateSliderValues() {
      RANGE_FIELDS.forEach(({ inputKey, valueKey, suffix }) => {
        const input = dom[inputKey];
        const value = dom[valueKey];
        if (!input || !value) return;
        value.textContent = `${input.value}${suffix}`;
      });
    },

    syncColorSwatches() {
      SWATCH_FIELDS.forEach(({ swatchKey, inputKey, settingKey }) => {
        const swatch = dom[swatchKey];
        const input = dom[inputKey];
        if (!swatch || !input) return;
        swatch.style.background = input.value || state.settings[settingKey];
      });
    },

    syncSectionDisabledStates() {
      const applyDisabledState = (section, enabled, allowInput) => {
        if (!section) return;
        section.classList.toggle("is-disabled", !enabled);
        section.querySelectorAll("input, select, button").forEach((control) => {
          if (control === allowInput) return;
          control.disabled = !enabled;
        });
      };

      applyDisabledState(dom.searchSettingsSection, dom.showSearchInput.checked, dom.showSearchInput);
      applyDisabledState(dom.widgetSettingsSection, dom.showWidgetInput.checked, dom.showWidgetInput);
    },

    hydrateForm() {
      const s = state.settings;
      dom.bgImageInput.value = s.bgImage;
      dom.bgOpacityInput.value = s.bgOpacity;
      dom.bgBrightnessInput.value = s.bgBrightness;
      dom.bgContrastInput.value = s.bgContrast;
      dom.bgSaturationInput.value = s.bgSaturation;
      dom.bgBlurInput.value = s.bgBlur;
      this.ensureSelectHasOption(dom.uiFontSelect, s.uiFontFamily || s.fontFamily);
      this.ensureSelectHasOption(dom.titleFontSelect, s.titleFontFamily || s.fontFamily);
      this.ensureSelectHasOption(dom.subtitleFontSelect, s.subtitleFontFamily || s.fontFamily);
      this.ensureSelectHasOption(dom.tileTitleFontSelect, s.tileTitleFontFamily || s.fontFamily);
      dom.uiFontSelect.value = s.uiFontFamily || s.fontFamily;
      dom.titleFontSelect.value = s.titleFontFamily || s.fontFamily;
      dom.subtitleFontSelect.value = s.subtitleFontFamily || s.fontFamily;
      dom.tileTitleFontSelect.value = s.tileTitleFontFamily || s.fontFamily;
      dom.showSearchInput.checked = s.showSearchBar !== false;
      dom.showWidgetInput.checked = s.showWidget !== false;
      dom.tempUnitInput.checked = String(s.tempUnit || "C").toUpperCase() === "F";
      dom.clockFormatInput.checked = String(s.clockFormat || "24h").toLowerCase() === "12h";
      dom.searchEngineSelect.value = s.searchEngine;
      dom.searchBrightnessInput.value = s.searchBrightness;
      dom.searchOpacityInput.value = s.searchOpacity;
      dom.searchBlurInput.value = s.searchBlur;
      dom.titleSizeInput.value = s.titleSize;
      dom.subtitleSizeInput.value = s.subtitleSize;
      dom.tileTitleSizeInput.value = s.tileTitleSize;
      dom.searchSizeInput.value = s.searchSize;
      dom.titleColorInput.value = s.titleColor;
      dom.subtitleColorInput.value = s.subtitleColor;
      dom.tileTitleColorInput.value = s.tileTitleColor;
      dom.searchColorInput.value = s.searchColor;
      dom.widgetColorInput.value = s.widgetColor;
      dom.iconSizeInput.value = s.iconSize;
      dom.iconRadiusInput.value = s.iconRadius;
      dom.buttonColorInput.value = s.buttonColor;
      dom.buttonIconColorInput.value = s.buttonIconColor;
      dom.buttonOpacityInput.value = s.buttonOpacity;
      dom.buttonBlurInput.value = s.buttonBlur;
      dom.tileBgColorInput.value = s.tileBackgroundColor;
      dom.tileBgOpacityInput.value = s.tileBackgroundOpacity;
      dom.tileBgBlurInput.value = s.tileBackgroundBlur;
      dom.gridGapInput.value = s.gridGap;
      dom.pageMaxWidthInput.value = s.pageMaxWidth;
      dom.pageSidePaddingInput.value = s.pageSidePadding;
      dom.showLogoInput.checked = s.showLogo !== false;
      dom.performanceModeInput.checked = s.performanceMode === true;
      dom.logoImageInput.value = s.logoImage || "";
      dom.logoOpacityInput.value = s.logoOpacity;
      dom.bgImageFileInput.value = "";
      dom.logoImageFileInput.value = "";
      this.updateSliderValues();
      this.syncColorSwatches();
      this.syncSectionDisabledStates();
    },

    collectFromForm() {
      return FORM_FIELD_KEYS.reduce((acc, key) => {
        acc[key] = getSettingsFormValue(key);
        return acc;
      }, {});
    },

    schedulePersist(delayMs = 220) {
      clearTimeout(settingsPersistTimer);
      settingsPersistTimer = setTimeout(() => {
        stateStore.persist();
      }, delayMs);
    },

    commit(patch, options = {}) {
      const nextSettings = storage.normalizeSettings({ ...state.settings, ...patch });
      stateStore.setState(
        { settings: nextSettings },
        { applySettings: true, updateGrid: true, persist: options.persist !== false }
      );
      if (options.debouncePersistMs) {
        this.schedulePersist(options.debouncePersistMs);
      }
    },

    async processLocalImage(file) {
      if (!file) return;
      if (file.size > 8 * 1024 * 1024) {
        ns.notify("That image is quite large. Please choose a file under 8MB.", "info");
        dom.bgImageFileInput.value = "";
        return;
      }

      let bitmap = null;
      try {
        bitmap = await createImageBitmap(file);
        const maxSize = 1920;
        const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
        const width = Math.round(bitmap.width * scale);
        const height = Math.round(bitmap.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D context unavailable");
        ctx.drawImage(bitmap, 0, 0, width, height);

        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
        if (!blob) throw new Error("Image conversion failed");

        const reader = new FileReader();
        reader.onload = () => {
          const value = typeof reader.result === "string" ? reader.result : "";
          dom.bgImageInput.value = value;
          this.commit({ bgImage: value });
        };
        reader.readAsDataURL(blob);
      } catch {
        ns.notify("Could not process that image. Please try a different file.", "error");
      } finally {
        if (bitmap && typeof bitmap.close === "function") bitmap.close();
      }
    },

    async processLogoImage(file) {
      if (!file) return;
      if (file.size > 8 * 1024 * 1024) {
        ns.notify("That image is quite large. Please choose a file under 8MB.", "info");
        dom.logoImageFileInput.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const value = typeof reader.result === "string" ? reader.result : "";
        dom.logoImageInput.value = value;
        this.commit({ logoImage: value, showLogo: true });
      };
      reader.onerror = () => {
        ns.notify("Could not process that image. Please try a different file.", "error");
      };
      reader.readAsDataURL(file);
    },

    resetDefaults() {
      clearTimeout(settingsPersistTimer);
      const nextSettings = storage.normalizeSettings(ns.DEFAULT_SETTINGS);
      stateStore.setState({ settings: nextSettings }, { applySettings: true, updateGrid: true });
      this.hydrateForm();
    },

    exportProfile() {
      downloadJson({
        type: "portico-profile",
        schemaVersion: ns.SCHEMA_VERSION,
        appVersion: ns.APP_VERSION,
        exportedAt: new Date().toISOString(),
        state: {
          widgets: state.widgets,
          settings: state.settings,
        },
      }, "portico-profile");
    },

    async stageProfileImport(file) {
      if (!file) return;
      try {
        const raw = await readTextFile(file);
        const parsed = JSON.parse(raw);
        const payload = (parsed?.type === "portico-profile" || parsed?.type === "newtab-profile")
          ? parsed?.state
          : parsed;
        pendingProfileImport = storage.normalizeState(payload);
        dom.profileImportFileInput.value = "";
        return true;
      } catch {
        pendingProfileImport = null;
        dom.profileImportFileInput.value = "";
        ns.notify("Could not import profile file.", "error");
        return false;
      }
    },

    clearStagedProfileImport() {
      pendingProfileImport = null;
    },

    applyStagedProfileImport({ importSettings = true, importLinks = true } = {}) {
      if (!pendingProfileImport) {
        ns.notify("No profile selected to import.", "error");
        return false;
      }
      if (!importSettings && !importLinks) {
        ns.notify("Select at least one import option.", "info");
        return false;
      }

      const patch = {
        ui: {
          ...state.ui,
          openFolderId: null,
          editingId: null,
          editingFolderItem: null,
        },
      };
      if (importLinks) patch.widgets = pendingProfileImport.widgets;
      if (importSettings) patch.settings = pendingProfileImport.settings;

      try {
        stateStore.setState(
          patch,
          {
            applySettings: importSettings,
            render: importLinks,
            updateGrid: !importLinks,
          }
        );
        if (importSettings) this.hydrateForm();
        if (importLinks && !importSettings) ns.ui.updateGridLayout();
        pendingProfileImport = null;
        ns.notify("Profile imported.", "info");
        return true;
      } catch {
        ns.notify("Could not apply imported profile.", "error");
        return false;
      }
    },

    saveEditableText() {
      this.commit({
        titleText: dom.pageTitle.textContent.trim(),
        subtitleText: dom.pageSubtitle.textContent.trim(),
      });
    },
  };
})();
