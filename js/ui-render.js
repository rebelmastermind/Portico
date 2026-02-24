(() => {
  const ns = (window.portico = window.portico || {});
  const { dom, state, utils } = ns;

  const getLinkConfig = (widget) => widget.config || {};
  const getFolderConfig = (widget) => widget.config || {};

  const setFolderCellIcon = (cell, item) => {
    const img = cell?.querySelector(".folder-icon-cell-img");
    if (!cell || !img) return;
    if (!item) {
      cell.dataset.src = "";
      cell.dataset.iconKey = "";
      cell.classList.add("empty");
      img.removeAttribute("src");
      return;
    }
    const candidates = utils.buildIconCandidates({ ...item, defaultIcon: ns.DEFAULT_ICON });
    const key = candidates.join("|");
    if (cell.dataset.iconKey === key) return;
    cell.dataset.iconKey = key;
    cell.classList.remove("empty");
    utils.loadImageWithFallback(img, candidates, {
      onResolve: (resolvedSrc) => {
        cell.dataset.src = resolvedSrc || "";
      },
    });
  };

  const createWidgetRenderers = () => ({
    link: {
      create(widget) {
        const card = document.createElement("article");
        card.className = "card widget-link";
        card.dataset.id = widget.id;

        const tileBody = document.createElement("div");
        tileBody.className = "tile-body";

        const anchor = document.createElement("a");
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";

        const icon = document.createElement("img");
        icon.className = "icon";
        icon.loading = "lazy";

        const title = document.createElement("span");
        title.className = "title";

        anchor.append(icon, title);
        tileBody.append(anchor);

        const actions = document.createElement("div");
        actions.className = "actions";

        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "icon-btn-sm";
        editBtn.setAttribute("aria-label", "Edit");
        editBtn.innerHTML = "<svg viewBox=\"0 0 24 24\"><path d=\"M12 20h9\" /><path d=\"M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z\" /></svg>";
        editBtn.addEventListener("click", () => {
          const current = ns.widgetsModule.getById(widget.id);
          if (current) ns.ui.openLinkModal(current);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "icon-btn-sm delete";
        deleteBtn.setAttribute("aria-label", "Delete");
        deleteBtn.innerHTML = "<svg viewBox=\"0 0 24 24\"><path d=\"M3 6h18\" /><path d=\"M8 6V4h8v2\" /><path d=\"M6 6l1 14h10l1-14\" /><path d=\"M10 11v6\" /><path d=\"M14 11v6\" /></svg>";
        deleteBtn.addEventListener("click", () => ns.widgetsModule.removeWidget(widget.id));

        actions.append(editBtn, deleteBtn);
        card.append(tileBody, actions);

        const refs = { card, tileBody, anchor, icon, title };
        this.update(widget, refs);
        return { element: card, refs };
      },

      update(widget, refs) {
        const config = getLinkConfig(widget);
        refs.card.title = config.url || "";
        refs.anchor.href = config.url || "#";
        refs.anchor.title = config.url || "";
        refs.icon.alt = `${config.title || "Link"} icon`;
        refs.title.textContent = config.title || "";
        utils.setImageFromLinkConfig(refs.icon, {
          url: config.url || "",
          iconUrl: config.iconUrl || "",
          defaultIcon: ns.DEFAULT_ICON,
        }, {
          onCustomIconError: () => {
            const current = ns.widgetsModule.getById(widget.id);
            if (current?.config?.iconUrl) ns.widgetsModule.clearCustomIcon(widget.id);
          },
        });
      },

      destroy(entry) {
        if (entry?.element?.parentNode) entry.element.parentNode.removeChild(entry.element);
      },
    },
    folder: {
      create(widget) {
        const card = document.createElement("article");
        card.className = "card widget-folder";
        card.dataset.id = widget.id;

        const tileBody = document.createElement("div");
        tileBody.className = "tile-body";

        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "folder-trigger";
        trigger.setAttribute("aria-label", "Open folder");

        const iconGrid = document.createElement("div");
        iconGrid.className = "icon folder-icon-grid";
        const iconCells = [0, 1, 2, 3].map(() => {
          const cell = document.createElement("div");
          cell.className = "folder-icon-cell";
          cell.dataset.src = "";
          cell.dataset.iconKey = "";
          const img = document.createElement("img");
          img.className = "folder-icon-cell-img";
          img.alt = "";
          img.loading = "lazy";
          img.draggable = false;
          cell.append(img);
          iconGrid.append(cell);
          return cell;
        });

        const title = document.createElement("span");
        title.className = "title";

        trigger.append(iconGrid, title);
        trigger.addEventListener("click", () => {
          const current = ns.widgetsModule.getById(widget.id);
          if (current) ns.ui.openFolderModal(current, card.querySelector(".tile-body"));
        });

        tileBody.append(trigger);

        const actions = document.createElement("div");
        actions.className = "actions";

        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "icon-btn-sm";
        editBtn.setAttribute("aria-label", "Rename folder");
        editBtn.innerHTML = "<svg viewBox=\"0 0 24 24\"><path d=\"M12 20h9\" /><path d=\"M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z\" /></svg>";
        editBtn.addEventListener("click", () => {
          const current = ns.widgetsModule.getById(widget.id);
          if (current) ns.ui.openFolderModal(current);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "icon-btn-sm delete";
        deleteBtn.setAttribute("aria-label", "Delete folder");
        deleteBtn.innerHTML = "<svg viewBox=\"0 0 24 24\"><path d=\"M3 6h18\" /><path d=\"M8 6V4h8v2\" /><path d=\"M6 6l1 14h10l1-14\" /><path d=\"M10 11v6\" /><path d=\"M14 11v6\" /></svg>";
        deleteBtn.addEventListener("click", () => ns.widgetsModule.removeWidget(widget.id));

        actions.append(editBtn, deleteBtn);
        card.append(tileBody, actions);

        const refs = { card, trigger, iconGrid, iconCells, title };
        this.update(widget, refs);
        return { element: card, refs };
      },

      update(widget, refs) {
        const config = getFolderConfig(widget);
        const items = Array.isArray(config.items) ? config.items : [];
        const folderColor = ns.uiFolder.resolveColor(config);
        refs.card.title = `${items.length} item${items.length === 1 ? "" : "s"}`;
        refs.title.textContent = String(config.title || "Folder");
        refs.iconGrid.style.setProperty("--folder-color", folderColor);
        refs.iconCells.forEach((cell, index) => {
          setFolderCellIcon(cell, items[index] || null);
        });
      },

      destroy(entry) {
        if (entry?.element?.parentNode) entry.element.parentNode.removeChild(entry.element);
      },
    },
  });

  ns.uiRender = {
    ensureRenderers() {
      if (!ns.widgetRenderers) ns.widgetRenderers = createWidgetRenderers();
      return ns.widgetRenderers;
    },

    updateGridLayout() {
      const isOverflowing = dom.grid.scrollHeight > dom.gridWrap.clientHeight + 1;
      dom.gridWrap.classList.toggle("overflowing", isOverflowing);
    },

    renderAddTile(ui) {
      const addTile = document.createElement("article");
      addTile.className = "card add-tile";

      const addBody = document.createElement("div");
      addBody.className = "tile-body";

      const addButton = document.createElement("button");
      addButton.type = "button";
      addButton.setAttribute("aria-label", "Add link");
      addButton.textContent = "+";
      addButton.addEventListener("click", () => ui.openLinkModal());

      addBody.append(addButton);
      addTile.append(addBody);
      return addTile;
    },

    reconcileWidgets(widgets) {
      this.ensureRenderers();
      const cache = state.ui.renderedWidgets;
      const activeIds = new Set();

      widgets.forEach((widget) => {
        const renderer = ns.widgetRenderers[widget.type];
        if (!renderer) return;
        activeIds.add(widget.id);

        if (!cache[widget.id]) {
          const created = renderer.create(widget);
          cache[widget.id] = {
            ...created,
            renderer,
            widgetType: widget.type,
          };
        } else if (cache[widget.id].widgetType !== widget.type) {
          const existing = cache[widget.id];
          if (existing?.renderer?.destroy) existing.renderer.destroy(existing);
          const recreated = renderer.create(widget);
          cache[widget.id] = {
            ...recreated,
            renderer,
            widgetType: widget.type,
          };
        } else {
          cache[widget.id].renderer.update(widget, cache[widget.id].refs);
        }

        dom.grid.append(cache[widget.id].element);
      });

      Object.keys(cache).forEach((id) => {
        if (activeIds.has(id)) return;
        const entry = cache[id];
        if (entry?.renderer?.destroy) entry.renderer.destroy(entry);
        delete cache[id];
      });
    },

    render(ui) {
      const visibleWidgets = ns.widgetsModule.getVisible();
      dom.grid.innerHTML = "";
      dom.empty.hidden = visibleWidgets.length > 0;

      this.reconcileWidgets(visibleWidgets);
      dom.grid.append(this.renderAddTile(ui));
      ns.dragModule.init();
      requestAnimationFrame(() => this.updateGridLayout());
    },
  };
})();
