(() => {
  const ns = (window.portico = window.portico || {});
  const { state, stateStore } = ns;
  const normalizeFolderItem = (input) => {
    if (!input || typeof input !== "object") return null;
    const title = String(input.title || "").trim();
    const url = ns.utils.normalizeUrl(String(input.url || ""));
    if (!title || !url) return null;
    return {
      id: typeof input.id === "string" && input.id ? input.id : crypto.randomUUID(),
      title,
      url,
      iconUrl: String(input.iconUrl || "").trim(),
    };
  };

  const folderItemsFromWidget = (widget) => {
    if (!widget || typeof widget !== "object") return [];
    if (widget.type === "link") {
      const item = normalizeFolderItem(widget.config || {});
      return item ? [item] : [];
    }
    if (widget.type === "folder") {
      const items = Array.isArray(widget.config?.items) ? widget.config.items : [];
      return items.map((item) => normalizeFolderItem(item)).filter(Boolean);
    }
    return [];
  };

  const linkWidgetFromItem = (item, id = crypto.randomUUID()) => ns.storage.normalizeWidget({
    id,
    type: "link",
    visible: true,
    layout: { w: 1, h: 1 },
    config: {
      title: item.title,
      url: item.url,
      iconUrl: item.iconUrl || "",
    },
  });
  const getFolderIndex = (folderId) =>
    state.widgets.findIndex((widget) => widget.id === folderId && widget.type === "folder");
  const collapseFolderAfterItemChange = (widgets, folderIndex, folder, itemsAfter) => {
    const remaining = (itemsAfter || [])
      .map((item) => normalizeFolderItem(item))
      .filter(Boolean);

    if (remaining.length <= 1) {
      widgets.splice(folderIndex, 1);
      if (remaining.length === 1) {
        const singleLink = linkWidgetFromItem(remaining[0], folder.id);
        if (singleLink) widgets.splice(folderIndex, 0, singleLink);
      }
      return true;
    }

    const updatedFolder = ns.storage.normalizeWidget({
      ...folder,
      config: { ...folder.config, items: remaining },
    });
    if (!updatedFolder) return false;
    widgets[folderIndex] = updatedFolder;
    return true;
  };

  ns.widgetsModule = {
    commit(nextWidgets, shouldRender = true) {
      stateStore.setState(
        { widgets: nextWidgets.map((widget) => ({ ...widget })) },
        { render: shouldRender }
      );
    },

    addWidget(widgetInput) {
      const normalized = ns.storage.normalizeWidget({
        ...widgetInput,
        id: widgetInput?.id || crypto.randomUUID(),
      });
      if (!normalized) return;
      this.commit([...state.widgets, normalized]);
    },

    updateWidget(id, patch) {
      const nextWidgets = state.widgets.map((widget) => {
        if (widget.id !== id) return widget;
        const merged = {
          ...widget,
          ...patch,
          config: { ...widget.config, ...(patch?.config || {}) },
          layout: { ...widget.layout, ...(patch?.layout || {}) },
        };
        return ns.storage.normalizeWidget(merged) || widget;
      });
      this.commit(nextWidgets);
    },

    updateFolderTitle(id, title) {
      this.updateWidget(id, { config: { title } });
    },

    updateFolderColor(id, color) {
      this.updateWidget(id, { config: { color } });
    },

    clearCustomIcon(id) {
      this.updateWidget(id, { config: { iconUrl: "" } });
    },

    removeWidget(id) {
      this.commit(state.widgets.filter((widget) => widget.id !== id));
    },

    toggleVisibility(id, visible) {
      this.updateWidget(id, { visible });
    },

    reorderByIds(ids) {
      const visible = state.widgets.filter((widget) => widget.visible !== false);
      const hidden = state.widgets.filter((widget) => widget.visible === false);
      const lookup = new Map(visible.map((widget) => [widget.id, widget]));
      const orderedVisible = ids.map((id) => lookup.get(id)).filter(Boolean);
      if (orderedVisible.length === visible.length) {
        this.commit([...orderedVisible, ...hidden], false);
      }
    },

    combineWidgetsIntoFolder(sourceId, targetId) {
      if (!sourceId || !targetId || sourceId === targetId) return false;

      const source = this.getById(sourceId);
      const target = this.getById(targetId);
      if (!source || !target) return false;
      if (source.visible === false || target.visible === false) return false;

      const sourceItems = folderItemsFromWidget(source);
      const targetItems = folderItemsFromWidget(target);
      if (sourceItems.length === 0 || targetItems.length === 0) return false;

      const dedupedItems = [];
      const seen = new Set();
      [...targetItems, ...sourceItems].forEach((item) => {
        const key = `${item.title}|${item.url}`;
        if (seen.has(key)) return;
        seen.add(key);
        dedupedItems.push(item);
      });

      if (dedupedItems.length < 2) return false;

      let nextWidgets = state.widgets.filter((widget) => widget.id !== sourceId && widget.id !== targetId);
      const targetIndex = state.widgets.findIndex((widget) => widget.id === targetId);
      const insertIndex = Math.max(0, Math.min(targetIndex, nextWidgets.length));
      const folderTitle =
        target.type === "folder"
          ? (String(target.config?.title || "").trim() || "Folder")
          : source.type === "folder"
            ? (String(source.config?.title || "").trim() || "Folder")
            : "Folder";

      const folderWidget = ns.storage.normalizeWidget({
        id: target.type === "folder" ? target.id : source.type === "folder" ? source.id : crypto.randomUUID(),
        type: "folder",
        visible: true,
        layout: { w: 1, h: 1 },
        config: { title: folderTitle, items: dedupedItems },
      });

      if (!folderWidget) return false;
      nextWidgets.splice(insertIndex, 0, folderWidget);
      this.commit(nextWidgets);
      return folderWidget.id;
    },

    moveFolderItemToGrid(folderId, itemId) {
      const folderIndex = getFolderIndex(folderId);
      if (folderIndex < 0) return false;
      const folder = state.widgets[folderIndex];
      const items = Array.isArray(folder.config?.items) ? folder.config.items : [];
      const movingIndex = items.findIndex((item) => item.id === itemId);
      if (movingIndex < 0) return false;

      const moving = normalizeFolderItem(items[movingIndex]);
      if (!moving) return false;
      const remaining = items
        .filter((item) => item.id !== itemId)
        .map((item) => normalizeFolderItem(item))
        .filter(Boolean);

      const extractedLink = linkWidgetFromItem(moving);
      if (!extractedLink) return false;

      const nextWidgets = state.widgets.slice();
      if (remaining.length <= 1) {
        nextWidgets.splice(folderIndex, 1);
        if (remaining.length === 1) {
          const singleLink = linkWidgetFromItem(remaining[0], folder.id);
          if (singleLink) nextWidgets.splice(folderIndex, 0, singleLink);
        }
        const insertion = Math.min(folderIndex + 1, nextWidgets.length);
        nextWidgets.splice(insertion, 0, extractedLink);
      } else {
        const updatedFolder = ns.storage.normalizeWidget({
          ...folder,
          config: { ...folder.config, items: remaining },
        });
        if (!updatedFolder) return false;
        nextWidgets[folderIndex] = updatedFolder;
        nextWidgets.splice(folderIndex + 1, 0, extractedLink);
      }

      this.commit(nextWidgets);
      return true;
    },

    reorderFolderItems(folderId, orderedIds) {
      const folder = this.getById(folderId);
      if (!folder || folder.type !== "folder") return false;
      const items = Array.isArray(folder.config?.items) ? folder.config.items : [];
      const lookup = new Map(items.map((item) => [item.id, item]));
      const ordered = orderedIds.map((id) => lookup.get(id)).filter(Boolean);
      if (ordered.length !== items.length) return false;
      this.updateWidget(folderId, { config: { items: ordered } });
      return true;
    },

    updateFolderItem(folderId, itemId, patchConfig) {
      const folderIndex = getFolderIndex(folderId);
      if (folderIndex < 0) return false;
      const folder = state.widgets[folderIndex];
      const items = Array.isArray(folder.config?.items) ? folder.config.items : [];
      const target = items.find((item) => item.id === itemId);
      if (!target) return false;
      const normalizedUpdated = normalizeFolderItem({ ...target, ...(patchConfig || {}) });
      if (!normalizedUpdated) return false;
      const nextItems = items.map((item) => {
        if (item.id !== itemId) return item;
        return normalizedUpdated;
      });
      const nextWidgets = state.widgets.slice();
      if (!collapseFolderAfterItemChange(nextWidgets, folderIndex, folder, nextItems)) return false;
      this.commit(nextWidgets);
      return true;
    },

    removeFolderItem(folderId, itemId) {
      const folderIndex = getFolderIndex(folderId);
      if (folderIndex < 0) return false;
      const folder = state.widgets[folderIndex];
      const items = Array.isArray(folder.config?.items) ? folder.config.items : [];
      const nextItems = items.filter((item) => item.id !== itemId);
      const nextWidgets = state.widgets.slice();
      if (!collapseFolderAfterItemChange(nextWidgets, folderIndex, folder, nextItems)) return false;
      this.commit(nextWidgets);
      return true;
    },

    getById(id) {
      return state.widgets.find((widget) => widget.id === id) || null;
    },

    getVisible() {
      return state.widgets.filter((widget) => widget.visible !== false);
    },
  };
})();
