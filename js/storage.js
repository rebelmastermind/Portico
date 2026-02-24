(() => {
  const ns = (window.portico = window.portico || {});
  const { utils } = ns;

  ns.storage = {
    _writeWarned: false,

    toNumberInRange(value, fallback, min, max) {
      const parsed = Number(value);
      const base = Number.isFinite(parsed) ? parsed : fallback;
      return Math.min(max, Math.max(min, base));
    },

    normalizeHexColor(value, fallback) {
      const raw = String(value ?? "").trim();
      if (/^#[0-9a-f]{6}$/i.test(raw)) return raw;
      if (/^#[0-9a-f]{3}$/i.test(raw)) {
        const [r, g, b] = raw.slice(1);
        return `#${r}${r}${g}${g}${b}${b}`;
      }
      return fallback;
    },

    readJson(key) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch {
        return null;
      }
    },

    normalizeWidget(widget) {
      if (!widget || typeof widget !== "object") return null;
      const type = widget.type === "folder" ? "folder" : "link";
      const config = widget.config && typeof widget.config === "object" ? widget.config : widget;

      if (type === "link") {
        const title = String(config.title || "").trim();
        const url = utils.normalizeUrl(String(config.url || ""));
        if (!title || !url) return null;

        return {
          id: typeof widget.id === "string" && widget.id ? widget.id : crypto.randomUUID(),
          type: "link",
          visible: widget.visible !== false,
          layout: {
            w: this.toNumberInRange(widget.layout?.w, 1, 1, 8),
            h: this.toNumberInRange(widget.layout?.h, 1, 1, 8),
          },
          config: {
            title,
            url,
            iconUrl: String(config.iconUrl || "").trim(),
          },
        };
      }

      const folderTitle = String(config.title || "Folder").trim() || "Folder";
      const folderColor = this.normalizeHexColor(config.color, ns.DEFAULT_FOLDER_COLOR);
      const sourceItems = Array.isArray(config.items) ? config.items : [];
      const items = sourceItems
        .map((item) => {
          const title = String(item?.title || "").trim();
          const url = utils.normalizeUrl(String(item?.url || ""));
          if (!title || !url) return null;
          return {
            id: typeof item.id === "string" && item.id ? item.id : crypto.randomUUID(),
            title,
            url,
            iconUrl: String(item.iconUrl || "").trim(),
          };
        })
        .filter(Boolean);

      if (items.length === 0) return null;

      return {
        id: typeof widget.id === "string" && widget.id ? widget.id : crypto.randomUUID(),
        type: "folder",
        visible: widget.visible !== false,
        layout: {
          w: this.toNumberInRange(widget.layout?.w, 1, 1, 8),
          h: this.toNumberInRange(widget.layout?.h, 1, 1, 8),
        },
        config: {
          title: folderTitle,
          color: folderColor,
          items,
        },
      };
    },

    normalizeSettings(settings) {
      const incoming = settings && typeof settings === "object" ? settings : {};
      const merged = { ...ns.DEFAULT_SETTINGS, ...incoming };
      const validEngineIds = new Set(ns.SEARCH_ENGINES.map((engine) => engine.id));
      const candidateEngine = String(merged.searchEngine || ns.DEFAULT_SETTINGS.searchEngine);
      const legacyFontSize = this.toNumberInRange(incoming.fontSize, ns.DEFAULT_SETTINGS.titleSize, 10, 80);
      const legacyFontColor = this.normalizeHexColor(incoming.fontColor, ns.DEFAULT_SETTINGS.titleColor);
      const legacyFontFamily = String(merged.fontFamily || ns.DEFAULT_SETTINGS.fontFamily);
      const titleColor = this.normalizeHexColor(merged.titleColor, legacyFontColor);
      const subtitleColor = this.normalizeHexColor(merged.subtitleColor, legacyFontColor);
      const tileTitleColor = this.normalizeHexColor(merged.tileTitleColor, legacyFontColor);
      const searchColor = this.normalizeHexColor(merged.searchColor, legacyFontColor);
      const widgetColor = this.normalizeHexColor(merged.widgetColor, legacyFontColor);
      const tempUnitRaw = String(merged.tempUnit || "C").toUpperCase();
      const tempUnit = tempUnitRaw === "F" ? "F" : "C";
      const clockFormatRaw = String(merged.clockFormat || ns.DEFAULT_SETTINGS.clockFormat).toLowerCase();
      const clockFormat = clockFormatRaw === "12h" ? "12h" : "24h";

      return {
        ...merged,
        bgOpacity: this.toNumberInRange(merged.bgOpacity, ns.DEFAULT_SETTINGS.bgOpacity, 0, 100),
        bgBrightness: this.toNumberInRange(merged.bgBrightness, ns.DEFAULT_SETTINGS.bgBrightness, 0, 200),
        bgContrast: this.toNumberInRange(merged.bgContrast, ns.DEFAULT_SETTINGS.bgContrast, 0, 200),
        bgSaturation: this.toNumberInRange(merged.bgSaturation, ns.DEFAULT_SETTINGS.bgSaturation, 0, 200),
        bgBlur: this.toNumberInRange(merged.bgBlur, ns.DEFAULT_SETTINGS.bgBlur, 0, 40),
        titleFontFamily: String(merged.titleFontFamily || legacyFontFamily),
        subtitleFontFamily: String(merged.subtitleFontFamily || legacyFontFamily),
        tileTitleFontFamily: String(merged.tileTitleFontFamily || legacyFontFamily),
        titleSize: this.toNumberInRange(merged.titleSize, legacyFontSize, 14, 80),
        subtitleSize: this.toNumberInRange(merged.subtitleSize, legacyFontSize, 10, 42),
        tileTitleSize: this.toNumberInRange(merged.tileTitleSize, ns.DEFAULT_SETTINGS.tileTitleSize, 10, 28),
        searchSize: this.toNumberInRange(merged.searchSize, legacyFontSize, 12, 28),
        titleColor,
        subtitleColor,
        tileTitleColor,
        searchColor,
        widgetColor,
        iconSize: this.toNumberInRange(merged.iconSize, ns.DEFAULT_SETTINGS.iconSize, 15, 256),
        iconRadius: this.toNumberInRange(merged.iconRadius, ns.DEFAULT_SETTINGS.iconRadius, 0, 50),
        showLogo: merged.showLogo !== false,
        logoImage: String(merged.logoImage || ""),
        logoOpacity: this.toNumberInRange(merged.logoOpacity, ns.DEFAULT_SETTINGS.logoOpacity, 0, 100),
        showSearchBar: merged.showSearchBar !== false,
        showWidget: merged.showWidget !== false,
        tempUnit,
        clockFormat,
        searchEngine: validEngineIds.has(candidateEngine) ? candidateEngine : ns.DEFAULT_SETTINGS.searchEngine,
        searchBrightness: this.toNumberInRange(merged.searchBrightness, ns.DEFAULT_SETTINGS.searchBrightness, 0, 200),
        searchOpacity: this.toNumberInRange(merged.searchOpacity, ns.DEFAULT_SETTINGS.searchOpacity, 0, 100),
        searchBlur: this.toNumberInRange(merged.searchBlur, ns.DEFAULT_SETTINGS.searchBlur, 0, 24),
        titleText: merged.titleText !== undefined ? String(merged.titleText) : ns.DEFAULT_SETTINGS.titleText,
        subtitleText: merged.subtitleText !== undefined ? String(merged.subtitleText) : ns.DEFAULT_SETTINGS.subtitleText,
      };
    },

    normalizeState(data) {
      const payload = data && typeof data === "object" ? data : {};
      const inputWidgets = Array.isArray(payload.widgets)
        ? payload.widgets
        : Array.isArray(payload.links)
          ? payload.links.map((link) => ({ ...link, type: "link", config: link }))
          : [];
      const widgets = inputWidgets
        .map((widget) => this.normalizeWidget(widget))
        .filter(Boolean);

      return {
        schemaVersion: ns.SCHEMA_VERSION,
        widgets,
        settings: this.normalizeSettings(payload.settings),
      };
    },

    read() {
      const current = this.readJson(ns.STATE_STORAGE_KEY);
      const previousStateKey = this.readJson("newtab_state");
      if (current) {
        if (current.schemaVersion === ns.SCHEMA_VERSION) {
          return this.normalizeState(current);
        }
        if (Array.isArray(current.links) || current.settings) {
          const migratedCurrent = this.normalizeState(current);
          this.write(migratedCurrent);
          return migratedCurrent;
        }
      }
      if (previousStateKey) {
        const migratedPrevious = this.normalizeState(previousStateKey);
        this.write(migratedPrevious);
        return migratedPrevious;
      }

      const legacyLinks = this.readJson(ns.LEGACY_LINKS_KEY);
      const legacySettings = this.readJson(ns.LEGACY_SETTINGS_KEY);
      const oldLegacyLinks = this.readJson("newtab_links_v1");
      const oldLegacySettings = this.readJson("newtab_settings_v1");
      if (legacyLinks || legacySettings || oldLegacyLinks || oldLegacySettings) {
        const migratedLegacy = this.normalizeState({
          links: Array.isArray(legacyLinks) ? legacyLinks : Array.isArray(oldLegacyLinks) ? oldLegacyLinks : [],
          settings: legacySettings || oldLegacySettings || {},
        });
        this.write(migratedLegacy);
        return migratedLegacy;
      }

      const seed = this.normalizeState({
        widgets: ns.DEFAULT_WIDGETS.map((widget) => ({ ...widget, id: crypto.randomUUID() })),
        settings: ns.DEFAULT_SETTINGS,
      });
      this.write(seed);
      return seed;
    },

    write(currentState) {
      const payload = {
        schemaVersion: ns.SCHEMA_VERSION,
        widgets: currentState.widgets,
        settings: currentState.settings,
      };
      try {
        localStorage.setItem(ns.STATE_STORAGE_KEY, JSON.stringify(payload));
        return true;
      } catch (error) {
        if (!this._writeWarned) {
          this._writeWarned = true;
          console.warn("Could not persist state to localStorage.", error);
          ns.notify("Your latest changes could not be saved to browser storage.", "error");
        }
        return false;
      }
    },
  };
})();
