(() => {
  const ns = (window.portico = window.portico || {});
  const { dom, state, utils, stateStore } = ns;
  let folderMotionOrigin = null;

  const getFolderConfig = (widget) => widget.config || {};
  const resolveFolderColor = (config) =>
    ns.storage.normalizeHexColor(config?.color, ns.DEFAULT_FOLDER_COLOR);

  const setOpenFolderId = (openFolderId) => {
    stateStore.updateState(
      (current) => ({
        ui: { ...current.ui, openFolderId },
      }),
      { persist: false }
    );
  };

  const destroyFolderSortable = () => {
    const sortable = state.ui.folderSortable;
    if (!sortable) return;
    sortable.destroy();
    stateStore.updateState(
      (current) => ({
        ui: { ...current.ui, folderSortable: null },
      }),
      { persist: false }
    );
  };

  const clearFolderModalBody = () => {
    dom.folderGrid.innerHTML = "";
  };

  const getViewportCenter = () => ({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const rectToCenter = (rect) => ({
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  });

  const getFolderTileOrigin = (folderId) => {
    if (!folderId || !dom.grid) return null;
    const tile = dom.grid.querySelector(`.card[data-id="${folderId}"] .tile-body`);
    if (!tile) return null;
    return tile.getBoundingClientRect();
  };

  const setFolderMotionVars = (originRect) => {
    if (!dom.folderPanel) return;
    const originCenter = originRect ? rectToCenter(originRect) : getViewportCenter();
    const viewportCenter = getViewportCenter();
    const dx = originCenter.x - viewportCenter.x;
    const dy = originCenter.y - viewportCenter.y;
    dom.folderPanel.style.setProperty("--folder-origin-x", `${Math.round(dx)}px`);
    dom.folderPanel.style.setProperty("--folder-origin-y", `${Math.round(dy)}px`);
  };

  const setFolderMotionFromRect = (originRect) => {
    setFolderMotionVars(originRect);
    dom.folderPanel.classList.add("folder-spatial");
  };

  const resolveFolderOpenOriginRect = (widget, originElement = null) =>
    originElement?.getBoundingClientRect?.() ||
    getFolderTileOrigin(widget.id) ||
    null;

  const resolveFolderCloseOriginRect = () => {
    const folderId = state.ui.openFolderId;
    return getFolderTileOrigin(folderId) || folderMotionOrigin || null;
  };

  ns.uiFolder = {
    resolveColor: resolveFolderColor,

    syncColorUi(color) {
      const next = resolveFolderColor({ color });
      dom.folderPanel.style.setProperty("--folder-color", next);
      dom.folderColorSwatch.style.setProperty("--folder-color", next);
      dom.folderColorNativeInput.value = next;
    },

    openColorPicker(ui) {
      const folderId = state.ui.openFolderId;
      if (!folderId) return;
      const folder = ns.widgetsModule.getById(folderId);
      if (!folder || folder.type !== "folder") return;
      const folderColor = resolveFolderColor(folder.config || {});
      this.syncColorUi(folderColor);
      dom.folderColorNativeInput.click();
    },

    renderItems(ui, widget) {
      const config = getFolderConfig(widget);
      const items = Array.isArray(config.items) ? config.items : [];
      destroyFolderSortable();
      clearFolderModalBody();
      const folderId = widget.id;

      items.forEach((item) => {
        const tile = document.createElement("article");
        tile.className = "folder-item";
        tile.draggable = true;
        tile.dataset.itemId = item.id;
        tile.title = item.url;

        const link = document.createElement("a");
        link.className = "folder-item-link";
        link.href = item.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.title = item.url;

        const icon = document.createElement("img");
        icon.className = "icon folder-item-icon";
        icon.alt = `${item.title} icon`;
        utils.setImageFromLinkConfig(icon, {
          url: item.url || "",
          iconUrl: item.iconUrl || "",
          defaultIcon: ns.DEFAULT_ICON,
        });

        const text = document.createElement("span");
        text.className = "folder-item-title";
        text.textContent = item.title;

        const actions = document.createElement("div");
        actions.className = "actions";

        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "icon-btn-sm";
        editBtn.setAttribute("aria-label", "Edit");
        editBtn.innerHTML = "<svg viewBox=\"0 0 24 24\"><path d=\"M12 20h9\" /><path d=\"M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z\" /></svg>";
        editBtn.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          ui.openLinkModal(null, {
            folderId,
            itemId: item.id,
            config: {
              title: item.title,
              url: item.url,
              iconUrl: item.iconUrl || "",
            },
          });
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "icon-btn-sm delete";
        deleteBtn.setAttribute("aria-label", "Delete");
        deleteBtn.innerHTML = "<svg viewBox=\"0 0 24 24\"><path d=\"M3 6h18\" /><path d=\"M8 6V4h8v2\" /><path d=\"M6 6l1 14h10l1-14\" /><path d=\"M10 11v6\" /><path d=\"M14 11v6\" /></svg>";
        deleteBtn.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          ns.widgetsModule.removeFolderItem(folderId, item.id);
          ui.refreshOpenFolderModal();
        });

        actions.append(editBtn, deleteBtn);
        link.append(icon, text);
        tile.append(link, actions);
        tile.addEventListener("dragstart", (event) => {
          if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", item.id);
          }
          tile.classList.add("dragging");
          ns.dragModule.setFolderItemDrag({
            folderId,
            itemId: item.id,
          });
          dom.folderModal.classList.add("folder-item-dragging");
        });
        tile.addEventListener("dragend", () => {
          tile.classList.remove("dragging");
          ns.dragModule.clearFolderItemDrag();
          dom.folderModal.classList.remove("folder-item-dragging");
        });
        dom.folderGrid.append(tile);
      });

      if (window.Sortable) {
        const folderSortable = new Sortable(dom.folderGrid, {
          animation: 520,
          ghostClass: "dragging",
          chosenClass: "dragging",
          dragClass: "dragging",
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          onEnd: () => {
            const orderedIds = Array.from(dom.folderGrid.querySelectorAll(".folder-item[data-item-id]"))
              .map((el) => el.dataset.itemId)
              .filter(Boolean);
            if (orderedIds.length > 0) {
              ns.widgetsModule.reorderFolderItems(folderId, orderedIds);
            }
          },
        });

        stateStore.updateState((current) => ({
          ui: { ...current.ui, folderSortable },
        }), { persist: false });
      }
    },

    openModal(ui, widget, originElement = null) {
      const config = getFolderConfig(widget);
      const folderColor = resolveFolderColor(config);
      const originRect = resolveFolderOpenOriginRect(widget, originElement);
      folderMotionOrigin = originRect;
      setFolderMotionFromRect(originRect);
      setOpenFolderId(widget.id);
      dom.folderName.textContent = String(config.title || "Folder");
      this.syncColorUi(folderColor);
      this.renderItems(ui, widget);
      ns.uiModal.toggle(dom.folderModal, true);
      requestAnimationFrame(() => requestAnimationFrame(() => dom.folderName.focus()));
    },

    closeModal(ui) {
      setFolderMotionFromRect(resolveFolderCloseOriginRect());
      destroyFolderSortable();
      ns.uiModal.toggle(dom.folderModal, false);
      clearFolderModalBody();
      setOpenFolderId(null);
      folderMotionOrigin = null;
    },

    refreshOpenModal(ui) {
      const folderId = state.ui.openFolderId;
      if (!folderId) return;
      const folder = ns.widgetsModule.getById(folderId);
      if (!folder || folder.type !== "folder") {
        this.closeModal(ui);
        return;
      }
      dom.folderName.textContent = String(folder.config?.title || "Folder");
      const folderColor = resolveFolderColor(folder.config || {});
      this.syncColorUi(folderColor);
      this.renderItems(ui, folder);
    },
  };
})();
