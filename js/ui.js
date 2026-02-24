(() => {
  const ns = (window.portico = window.portico || {});
  const { dom } = ns;

  ns.ui = {
    showToast(message, type = "error") {
      if (!dom.toastStack || !message) return;
      const toast = document.createElement("div");
      toast.className = `toast ${type}`;
      toast.textContent = message;
      dom.toastStack.append(toast);

      requestAnimationFrame(() => toast.classList.add("show"));

      const hide = () => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 200);
      };

      const isAmbientDebug = typeof message === "string" && message.startsWith("[Ambient]");
      const durationMs = isAmbientDebug ? 7000 : 3400;
      setTimeout(hide, durationMs);
    },

    flushQueuedNotifications() {
      if (!Array.isArray(ns.notificationQueue) || ns.notificationQueue.length === 0) return;
      const pending = [...ns.notificationQueue];
      ns.notificationQueue = [];
      pending.forEach((item) => this.showToast(item.message, item.type));
    },

    closeTopModal() {
      if (!dom.profileImportOptionsModal.hidden) {
        ns.settingsModule.clearStagedProfileImport();
        ns.uiModal.toggle(dom.profileImportOptionsModal, false);
        return true;
      }
      if (!dom.settingsModal.hidden) {
        this.closeSettingsModal();
        return true;
      }
      if (!dom.modal.hidden) {
        this.closeLinkModal();
        return true;
      }
      if (!dom.folderModal.hidden) {
        this.closeFolderModal();
        return true;
      }
      return false;
    },

    openLinkModal(widget = null, folderItemContext = null) {
      ns.uiModal.openLink(this, widget, folderItemContext);
    },

    closeLinkModal() {
      ns.uiModal.closeLink();
    },

    openFolderModal(widget, originElement = null) {
      ns.uiFolder.openModal(this, widget, originElement);
    },

    closeFolderModal() {
      ns.uiFolder.closeModal(this);
    },

    refreshOpenFolderModal() {
      ns.uiFolder.refreshOpenModal(this);
    },

    openSettingsModal() {
      ns.uiModal.openSettings();
    },

    closeSettingsModal() {
      ns.uiModal.closeSettings();
    },

    updateGridLayout() {
      ns.uiRender.updateGridLayout();
    },

    render() {
      ns.uiRender.render(this);
    },

    bindEvents() {
      if (!ns.uiEvents || typeof ns.uiEvents.bind !== "function") {
        throw new Error("uiEvents module is not available");
      }
      ns.uiEvents.bind(this);
    },
  };
})();
