(() => {
  const ns = (window.portico = window.portico || {});
  const { dom, state, utils } = ns;
  const SWATCH_TOOLTIP = "Ctrl+V to paste color code";

  const bindModalCloseTriggers = (selector, onClose) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.addEventListener("click", onClose);
    });
  };

  const resolveFolderColor = (config) =>
    ns.storage.normalizeHexColor(config?.color, ns.DEFAULT_FOLDER_COLOR);

  const bindHexPaste = (swatch, input) => {
    if (!swatch || !input) return;
    swatch.title = SWATCH_TOOLTIP;
    swatch.addEventListener("paste", (event) => {
      const raw = event.clipboardData?.getData("text") || "";
      const value = raw.trim();
      const isHex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
      if (!isHex) return;
      event.preventDefault();
      input.value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  };

  const bindHexPasteTarget = (target, input) => {
    if (!target || !input) return;
    target.addEventListener("paste", (event) => {
      const raw = event.clipboardData?.getData("text") || "";
      const value = raw.trim();
      const isHex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
      if (!isHex) return;
      event.preventDefault();
      input.value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  };

  ns.uiEvents = {
    bind(ui) {
      ui.flushQueuedNotifications();

      dom.modalForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const title = dom.titleInput.value.trim();
        const url = utils.normalizeUrl(dom.urlInput.value);
        const iconUrl = dom.iconInput.value.trim();
        if (!title || !url) return;

        if (state.ui.editingFolderItem?.folderId && state.ui.editingFolderItem?.itemId) {
          ns.widgetsModule.updateFolderItem(
            state.ui.editingFolderItem.folderId,
            state.ui.editingFolderItem.itemId,
            { title, url, iconUrl }
          );
          ui.refreshOpenFolderModal();
        } else if (state.ui.editingId) {
          ns.widgetsModule.updateWidget(state.ui.editingId, {
            config: { title, url, iconUrl },
          });
        } else {
          ns.widgetsModule.addWidget({
            type: "link",
            visible: true,
            layout: { w: 1, h: 1 },
            config: { title, url, iconUrl },
          });
        }

        ui.closeLinkModal();
      });

      dom.urlInput.addEventListener("input", () => ns.uiModal.updateIconPreview());
      dom.iconInput.addEventListener("input", () => ns.uiModal.updateIconPreview());
      dom.iconPreview.addEventListener("click", () => {
        dom.iconInput.hidden = !dom.iconInput.hidden;
        if (!dom.iconInput.hidden) dom.iconInput.focus();
      });

      bindModalCloseTriggers("[data-close]", () => ui.closeLinkModal());
      bindModalCloseTriggers("[data-folder-close]", () => ui.closeFolderModal());
      dom.folderColorSwatch.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        ns.uiFolder.openColorPicker(ui);
      });
      bindHexPaste(dom.folderColorSwatch, dom.folderColorNativeInput);
      bindHexPasteTarget(dom.folderName, dom.folderColorNativeInput);
      dom.folderColorNativeInput.addEventListener("input", (event) => {
        const next = resolveFolderColor({ color: event.target.value });
        if (!next) return;
        ns.uiFolder.syncColorUi(next);
        const folderId = state.ui.openFolderId;
        if (!folderId) return;
        ns.widgetsModule.updateFolderColor(folderId, next);
        ui.refreshOpenFolderModal();
      });
      dom.folderName.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        dom.folderName.blur();
      });
      dom.folderName.addEventListener("blur", () => {
        const folderId = state.ui.openFolderId;
        if (!folderId) return;
        const nextTitle = dom.folderName.textContent.trim() || "Folder";
        ns.widgetsModule.updateFolderTitle(folderId, nextTitle);
        dom.folderName.textContent = nextTitle;
      });

      bindModalCloseTriggers("[data-settings-close]", () => ui.closeSettingsModal());
      dom.openSettingsBtn.addEventListener("click", () => ui.openSettingsModal());

      dom.searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const query = dom.searchInput.value.trim();
        if (!query) return;
        const engine = ns.SEARCH_ENGINES.find((item) => item.id === state.settings.searchEngine) || ns.SEARCH_ENGINES[0];
        const targetUrl = engine.url.replace("{query}", encodeURIComponent(query));
        window.location.assign(targetUrl);
      });

      dom.searchShell.addEventListener("pointerdown", (event) => {
        if (dom.searchSubmit.contains(event.target)) return;
        if (event.target === dom.searchInput) return;
        event.preventDefault();
        dom.searchInput.focus();
        const pos = dom.searchInput.value.length;
        dom.searchInput.setSelectionRange(pos, pos);
      });

      const commitSettingsFromForm = () => {
        ns.settingsModule.updateSliderValues();
        ns.settingsModule.syncColorSwatches();
        ns.settingsModule.commit(ns.settingsModule.collectFromForm(), {
          persist: false,
          debouncePersistMs: 220,
        });
      };

      const handleSettingsFormMutation = (event) => {
        if (
          event.target === dom.bgImageInput ||
          event.target === dom.bgImageFileInput ||
          event.target === dom.logoImageInput ||
          event.target === dom.logoImageFileInput
        ) return;
        commitSettingsFromForm();
      };
      dom.settingsForm.addEventListener("input", handleSettingsFormMutation);
      dom.settingsForm.addEventListener("change", handleSettingsFormMutation);
      dom.showSearchInput.addEventListener("change", commitSettingsFromForm);
      dom.showWidgetInput.addEventListener("change", commitSettingsFromForm);

      const bindColorSwatch = (swatch, input) => {
        if (!swatch || !input) return;
        swatch.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          input.click();
        });
        bindHexPaste(swatch, input);
      };
      bindColorSwatch(dom.titleColorSwatch, dom.titleColorInput);
      bindColorSwatch(dom.subtitleColorSwatch, dom.subtitleColorInput);
      bindColorSwatch(dom.tileTitleColorSwatch, dom.tileTitleColorInput);
      bindColorSwatch(dom.searchColorSwatch, dom.searchColorInput);
      bindColorSwatch(dom.widgetColorSwatch, dom.widgetColorInput);

      dom.bgImageInput.addEventListener("change", () => {
        ns.settingsModule.commit({ bgImage: dom.bgImageInput.value.trim() });
      });

      dom.bgImageFileBtn.addEventListener("click", () => {
        dom.bgImageFileInput.click();
      });

      dom.bgImageInput.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        ns.settingsModule.commit({ bgImage: dom.bgImageInput.value.trim() });
      });

      dom.bgImageFileInput.addEventListener("change", async (event) => {
        await ns.settingsModule.processLocalImage(event.target.files?.[0]);
      });

      dom.logoImageInput.addEventListener("change", () => {
        ns.settingsModule.commit({ logoImage: dom.logoImageInput.value.trim(), showLogo: dom.showLogoInput.checked });
      });
      dom.logoImageInput.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        ns.settingsModule.commit({ logoImage: dom.logoImageInput.value.trim(), showLogo: dom.showLogoInput.checked });
      });
      dom.logoImageFileBtn.addEventListener("click", () => {
        dom.logoImageFileInput.click();
      });
      dom.logoImageFileInput.addEventListener("change", async (event) => {
        await ns.settingsModule.processLogoImage(event.target.files?.[0]);
      });

      dom.settingsResetBtn.addEventListener("click", () => {
        ns.settingsModule.resetDefaults();
      });
      dom.profileExportBtn.addEventListener("click", () => {
        ns.settingsModule.exportProfile();
      });
      dom.profileImportBtn.addEventListener("click", () => {
        dom.profileImportFileInput.click();
      });
      dom.profileImportFileInput.addEventListener("change", async (event) => {
        const ok = await ns.settingsModule.stageProfileImport(event.target.files?.[0]);
        if (!ok) return;
        dom.importSettingsCheckbox.checked = true;
        dom.importLinksCheckbox.checked = true;
        ns.uiModal.toggle(dom.profileImportOptionsModal, true);
      });
      bindModalCloseTriggers("[data-profile-import-options-close]", () => {
        ns.settingsModule.clearStagedProfileImport();
        ns.uiModal.toggle(dom.profileImportOptionsModal, false);
      });
      dom.profileImportApplyBtn.addEventListener("click", () => {
        const applied = ns.settingsModule.applyStagedProfileImport({
          importSettings: dom.importSettingsCheckbox.checked,
          importLinks: dom.importLinksCheckbox.checked,
        });
        if (!applied) return;
        ns.uiModal.toggle(dom.profileImportOptionsModal, false);
      });

      [dom.pageTitle, dom.pageSubtitle].forEach((element) => {
        element.addEventListener("keydown", (event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          element.blur();
        });
        element.addEventListener("blur", () => ns.settingsModule.saveEditableText());
      });

      document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        if (ui.closeTopModal()) event.preventDefault();
      });

      document.addEventListener("pointerdown", (event) => {
        if (dom.folderModal.hidden) return;
        if (!dom.modal.hidden) return;
        if (dom.folderPanel && dom.folderPanel.contains(event.target)) return;
        event.preventDefault();
        event.stopPropagation();
        ui.closeFolderModal();
      });

      window.addEventListener("resize", () => requestAnimationFrame(() => ui.updateGridLayout()));
    },
  };
})();
