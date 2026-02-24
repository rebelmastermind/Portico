(() => {
  const ns = (window.portico = window.portico || {});
  const { dom, state, storage, stateStore } = ns;
  let settingsPersistTimer = null;
  let pendingProfileImport = null;
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
    applyToCss() {
      const s = state.settings;
      const root = document.documentElement;
      const bgImage = s.bgImage ? `url("${s.bgImage}")` : "none";

      root.style.setProperty("--bg-image", bgImage);
      root.style.setProperty("--bg-opacity", (s.bgOpacity / 100).toFixed(2));
      root.style.setProperty("--bg-brightness", (s.bgBrightness / 100).toFixed(2));
      root.style.setProperty("--bg-contrast", (s.bgContrast / 100).toFixed(2));
      root.style.setProperty("--bg-saturation", (s.bgSaturation / 100).toFixed(2));
      root.style.setProperty("--bg-blur", `${s.bgBlur}px`);
      root.style.setProperty("--font-family", s.titleFontFamily || s.fontFamily || '"Space Grotesk", "Figtree", "Segoe UI", sans-serif');
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

      dom.pageTitle.textContent = s.titleText;
      dom.pageSubtitle.textContent = s.subtitleText;
      dom.brandIcon.hidden = s.showLogo === false;
      dom.brandIcon.src = s.logoImage ? s.logoImage : "icons/Portico_icon.svg";
      dom.brandIcon.style.opacity = `${Math.max(0, Math.min(100, s.logoOpacity)) / 100}`;
      dom.searchForm.hidden = s.showSearchBar === false;
      dom.ambientWidget.hidden = s.showWidget === false;
      this.syncSectionDisabledStates();
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

    populateFontOptions() {
      dom.titleFontSelect.innerHTML = "";
      dom.subtitleFontSelect.innerHTML = "";
      dom.tileTitleFontSelect.innerHTML = "";
      ns.FONT_OPTIONS.forEach((font) => {
        const titleOption = document.createElement("option");
        titleOption.value = font;
        titleOption.textContent = font;
        dom.titleFontSelect.append(titleOption);
        const subtitleOption = document.createElement("option");
        subtitleOption.value = font;
        subtitleOption.textContent = font;
        dom.subtitleFontSelect.append(subtitleOption);
        const tileTitleOption = document.createElement("option");
        tileTitleOption.value = font;
        tileTitleOption.textContent = font;
        dom.tileTitleFontSelect.append(tileTitleOption);
      });
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
      dom.bgOpacityValue.textContent = `${dom.bgOpacityInput.value}%`;
      dom.bgBrightnessValue.textContent = `${dom.bgBrightnessInput.value}%`;
      dom.bgContrastValue.textContent = `${dom.bgContrastInput.value}%`;
      dom.bgSaturationValue.textContent = `${dom.bgSaturationInput.value}%`;
      dom.bgBlurValue.textContent = `${dom.bgBlurInput.value}px`;
      dom.iconSizeValue.textContent = `${dom.iconSizeInput.value}px`;
      dom.iconRadiusValue.textContent = `${dom.iconRadiusInput.value}%`;
      dom.searchBrightnessValue.textContent = `${dom.searchBrightnessInput.value}%`;
      dom.searchOpacityValue.textContent = `${dom.searchOpacityInput.value}%`;
      dom.searchBlurValue.textContent = `${dom.searchBlurInput.value}px`;
      dom.titleSizeValue.textContent = `${dom.titleSizeInput.value}px`;
      dom.subtitleSizeValue.textContent = `${dom.subtitleSizeInput.value}px`;
      dom.tileTitleSizeValue.textContent = `${dom.tileTitleSizeInput.value}px`;
      dom.searchSizeValue.textContent = `${dom.searchSizeInput.value}px`;
      dom.logoOpacityValue.textContent = `${dom.logoOpacityInput.value}%`;
    },

    syncColorSwatches() {
      dom.titleColorSwatch.style.background = dom.titleColorInput.value || state.settings.titleColor;
      dom.subtitleColorSwatch.style.background = dom.subtitleColorInput.value || state.settings.subtitleColor;
      dom.tileTitleColorSwatch.style.background = dom.tileTitleColorInput.value || state.settings.tileTitleColor;
      dom.searchColorSwatch.style.background = dom.searchColorInput.value || state.settings.searchColor;
      dom.widgetColorSwatch.style.background = dom.widgetColorInput.value || state.settings.widgetColor;
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
      dom.showLogoInput.checked = s.showLogo !== false;
      dom.logoImageInput.value = s.logoImage || "";
      dom.logoOpacityInput.value = s.logoOpacity;
      dom.bgImageFileInput.value = "";
      dom.logoImageFileInput.value = "";
      this.updateSliderValues();
      this.syncColorSwatches();
      this.syncSectionDisabledStates();
    },

    collectFromForm() {
      return {
        bgImage: dom.bgImageInput.value.trim(),
        bgOpacity: Number(dom.bgOpacityInput.value),
        bgBrightness: Number(dom.bgBrightnessInput.value),
        bgContrast: Number(dom.bgContrastInput.value),
        bgSaturation: Number(dom.bgSaturationInput.value),
        bgBlur: Number(dom.bgBlurInput.value),
        titleFontFamily: dom.titleFontSelect.value,
        subtitleFontFamily: dom.subtitleFontSelect.value,
        tileTitleFontFamily: dom.tileTitleFontSelect.value,
        showSearchBar: dom.showSearchInput.checked,
        showWidget: dom.showWidgetInput.checked,
        tempUnit: dom.tempUnitInput.checked ? "F" : "C",
        clockFormat: dom.clockFormatInput.checked ? "12h" : "24h",
        searchEngine: dom.searchEngineSelect.value,
        searchBrightness: Number(dom.searchBrightnessInput.value),
        searchOpacity: Number(dom.searchOpacityInput.value),
        searchBlur: Number(dom.searchBlurInput.value),
        titleSize: Number(dom.titleSizeInput.value),
        subtitleSize: Number(dom.subtitleSizeInput.value),
        tileTitleSize: Number(dom.tileTitleSizeInput.value),
        searchSize: Number(dom.searchSizeInput.value),
        titleColor: dom.titleColorInput.value.trim(),
        subtitleColor: dom.subtitleColorInput.value.trim(),
        tileTitleColor: dom.tileTitleColorInput.value.trim(),
        searchColor: dom.searchColorInput.value.trim(),
        widgetColor: dom.widgetColorInput.value.trim(),
        iconSize: Number(dom.iconSizeInput.value),
        iconRadius: Number(dom.iconRadiusInput.value),
        showLogo: dom.showLogoInput.checked,
        logoImage: dom.logoImageInput.value.trim(),
        logoOpacity: Number(dom.logoOpacityInput.value),
      };
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
