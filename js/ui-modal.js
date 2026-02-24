(() => {
  const ns = (window.portico = window.portico || {});
  const { dom, utils, stateStore } = ns;

  const getLinkConfig = (widget) => widget.config || {};

  const setLinkEditingContext = ({ editingId = null, editingFolderItem = null } = {}) => {
    stateStore.updateState(
      (current) => ({
        ui: { ...current.ui, editingId, editingFolderItem },
      }),
      { persist: false }
    );
  };

  const resetLinkModalFields = () => {
    dom.modalForm.reset();
    dom.iconInput.hidden = true;
    dom.iconInput.value = "";
    dom.iconPreview.src = ns.DEFAULT_ICON;
  };

  const fillLinkModalFields = ({ title = "", url = "", iconUrl = "" } = {}) => {
    dom.titleInput.value = title;
    dom.urlInput.value = url;
    dom.iconInput.value = iconUrl;
    dom.iconInput.hidden = !iconUrl;
  };

  ns.uiModal = {
    toggle(element, open) {
      if (open) {
        element.hidden = false;
        requestAnimationFrame(() => element.classList.add("open"));
        return;
      }

      element.classList.remove("open");
      const finish = (event) => {
        if (event && event.target !== element) return;
        if (event && event.propertyName && event.propertyName !== "opacity") return;
        element.hidden = true;
        element.removeEventListener("transitionend", finish);
      };
      element.addEventListener("transitionend", finish);
      setTimeout(() => finish(), 380);
    },

    updateIconPreview() {
      const custom = dom.iconInput.value.trim();
      if (custom) {
        utils.loadImageWithFallback(dom.iconPreview, [custom, ns.DEFAULT_ICON]);
        return;
      }

      const url = utils.normalizeUrl(dom.urlInput.value);
      if (!url) {
        dom.iconPreview.src = ns.DEFAULT_ICON;
        return;
      }

      utils.loadImageWithFallback(
        dom.iconPreview,
        utils.buildIconCandidates({ url, defaultIcon: ns.DEFAULT_ICON })
      );
    },

    openLink(ui, widget = null, folderItemContext = null) {
      this.toggle(dom.modal, true);
      if (folderItemContext && folderItemContext.folderId && folderItemContext.itemId) {
        const config = folderItemContext.config || {};
        setLinkEditingContext({
          editingId: null,
          editingFolderItem: {
            folderId: folderItemContext.folderId,
            itemId: folderItemContext.itemId,
          },
        });
        dom.modalTitle.textContent = "Edit Link";
        dom.modalSubmit.textContent = "Save Changes";
        fillLinkModalFields({
          title: config.title || "",
          url: config.url || "",
          iconUrl: config.iconUrl || "",
        });
      } else if (widget) {
        const config = getLinkConfig(widget);
        setLinkEditingContext({ editingId: widget.id, editingFolderItem: null });
        dom.modalTitle.textContent = "Edit Link";
        dom.modalSubmit.textContent = "Save Changes";
        fillLinkModalFields({
          title: config.title || "",
          url: config.url || "",
          iconUrl: config.iconUrl || "",
        });
      } else {
        setLinkEditingContext({ editingId: null, editingFolderItem: null });
        dom.modalTitle.textContent = "Add Link";
        dom.modalSubmit.textContent = "Add Link";
        resetLinkModalFields();
      }
      this.updateIconPreview();
      requestAnimationFrame(() => requestAnimationFrame(() => dom.titleInput.focus()));
    },

    closeLink() {
      this.toggle(dom.modal, false);
      resetLinkModalFields();
      setLinkEditingContext({ editingId: null, editingFolderItem: null });
    },

    openSettings() {
      if (dom.settingsForm) {
        dom.settingsForm.querySelectorAll("details.settings-section").forEach((section) => {
          section.open = false;
        });
      }
      this.toggle(dom.settingsModal, true);
    },

    closeSettings() {
      this.toggle(dom.settingsModal, false);
    },
  };
})();
