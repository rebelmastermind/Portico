(() => {
  const ns = (window.portico = window.portico || {});
  const { state, dom } = ns;

  const CENTER_HIT_RATIO = 0.8;

  let pendingMerge = null;
  let previewCard = null;
  let folderItemDrag = null;
  let folderDropBound = false;
  let dragSourceId = null;
  let suppressLinkClicksUntil = 0;
  let pointerToCenterDx = 0;
  let pointerToCenterDy = 0;

  const getCardPreviewSources = (card) => {
    if (!card) return [];
    const folderCells = Array.from(card.querySelectorAll(".folder-icon-cell"))
      .filter((el) => !el.classList.contains("empty"))
      .map((el) => el.dataset.src || "")
      .filter(Boolean);
    if (folderCells.length > 0) return folderCells.slice(0, 4);

    const icon = card.querySelector("img.icon");
    if (icon) {
      const src = icon.getAttribute("src") || "";
      if (src) return [src];
    }
    return [];
  };

  const getPreviewBackground = (targetCard) => {
    const folderGrid = targetCard?.querySelector(".folder-icon-grid");
    if (folderGrid) {
      const bg = window.getComputedStyle(folderGrid).backgroundColor;
      if (bg) return bg;
    }
    return "rgba(15, 20, 31, 0.85)";
  };

  const createDropPreview = (icons, background) => {
    const preview = document.createElement("div");
    preview.className = "folder-drop-preview";
    preview.style.background = background || "rgba(15, 20, 31, 0.85)";

    icons.slice(0, 4).forEach((src) => {
      const cell = document.createElement("div");
      cell.className = "folder-drop-preview-cell";
      cell.classList.toggle("empty", !src);
      cell.style.backgroundImage = src ? `url("${src}")` : "none";
      preview.append(cell);
    });

    while (preview.childElementCount < 4) {
      const cell = document.createElement("div");
      cell.className = "folder-drop-preview-cell empty";
      preview.append(cell);
    }

    return preview;
  };

  const updateDropPreview = (preview, icons) => {
    if (!preview) return;
    const nextIcons = icons.slice(0, 4);
    while (nextIcons.length < 4) nextIcons.push("");
    const cells = Array.from(preview.querySelectorAll(".folder-drop-preview-cell"));
    cells.forEach((cell, index) => {
      const nextSrc = nextIcons[index] || "";
      cell.classList.toggle("empty", !nextSrc);
      const nextBg = nextSrc ? `url("${nextSrc}")` : "none";
      if (cell.style.backgroundImage !== nextBg) cell.style.backgroundImage = nextBg;
    });
  };

  const clearPreview = () => {
    if (!previewCard) return;
    previewCard.classList.remove("folder-preview-target");
    previewCard.querySelector(".folder-drop-preview")?.remove();
    previewCard = null;
  };

  const setPreview = (targetCard, sourceId, targetId) => {
    if (!targetCard || !sourceId || !targetId) return;
    if (previewCard !== targetCard) clearPreview();

    const sourceCard = dom.grid.querySelector(`.card[data-id="${sourceId}"]`);
    const targetIcons = getCardPreviewSources(targetCard);
    const sourceIcons = getCardPreviewSources(sourceCard);
    const combined = [...targetIcons, ...sourceIcons].slice(0, 4);
    if (combined.length === 0) return;

    const tileBody = targetCard.querySelector(".tile-body");
    if (!tileBody) return;

    const existing = tileBody.querySelector(".folder-drop-preview");
    const previewBackground = getPreviewBackground(targetCard);
    if (previewCard === targetCard && existing) {
      existing.style.background = previewBackground;
      updateDropPreview(existing, combined);
      return;
    }

    previewCard = targetCard;
    previewCard.classList.add("folder-preview-target");
    tileBody.querySelector(".folder-drop-preview")?.remove();
    tileBody.append(createDropPreview(combined, previewBackground));
  };

  const isCenterHit = (tileRect, x, y) => {
    if (!tileRect || !Number.isFinite(x) || !Number.isFinite(y)) return false;

    const dx = Math.abs(x - (tileRect.left + tileRect.width / 2));
    const dy = Math.abs(y - (tileRect.top + tileRect.height / 2));
    const hitX = tileRect.width * CENTER_HIT_RATIO * 0.5;
    const hitY = tileRect.height * CENTER_HIT_RATIO * 0.5;
    return dx <= hitX && dy <= hitY;
  };

  const resolveCenterTargetFromPoint = (sourceId, clientX, clientY) => {
    if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return null;

    const probeX = clientX + pointerToCenterDx;
    const probeY = clientY + pointerToCenterDy;

    const cards = Array.from(dom.grid.querySelectorAll(".card[data-id]"))
      .filter((card) => !card.classList.contains("add-tile") && card.dataset.id !== sourceId);

    let best = null;
    let bestDist = Infinity;

    cards.forEach((card) => {
      const tile = card.querySelector(".tile-body");
      if (!tile) return;

      const rect = tile.getBoundingClientRect();
      if (!isCenterHit(rect, probeX, probeY)) return;

      const dx = probeX - (rect.left + rect.width / 2);
      const dy = probeY - (rect.top + rect.height / 2);
      const dist = (dx * dx) + (dy * dy);
      if (dist < bestDist) {
        bestDist = dist;
        best = { card, targetId: card.dataset.id || null };
      }
    });

    return best;
  };

  const bindFolderDrop = () => {
    if (folderDropBound) return;
    folderDropBound = true;

    document.addEventListener(
      "click",
      (event) => {
        if (Date.now() > suppressLinkClicksUntil) return;
        const anchor = event.target instanceof Element ? event.target.closest(".grid .card a") : null;
        if (!anchor) return;
        event.preventDefault();
        event.stopPropagation();
      },
      true
    );

    dom.grid.addEventListener("dragover", (event) => {
      if (dragSourceId && !folderItemDrag) {
        event.preventDefault();

        const resolved = resolveCenterTargetFromPoint(dragSourceId, event.clientX, event.clientY);
        if (resolved?.targetId) {
          pendingMerge = { sourceId: dragSourceId, targetId: resolved.targetId };
          setPreview(resolved.card, dragSourceId, resolved.targetId);
        } else if (pendingMerge) {
          pendingMerge = null;
          clearPreview();
        }
      }

      if (!folderItemDrag) return;
      event.preventDefault();
      dom.grid.classList.add("folder-drop-ready");
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    });

    dom.grid.addEventListener("dragleave", (event) => {
      if (!folderItemDrag) return;
      if (event.relatedTarget && dom.grid.contains(event.relatedTarget)) return;
      dom.grid.classList.remove("folder-drop-ready");
    });

    dom.grid.addEventListener("drop", (event) => {
      if (!folderItemDrag) return;
      event.preventDefault();
      dom.grid.classList.remove("folder-drop-ready");
      const payload = folderItemDrag;
      folderItemDrag = null;
      if (!payload) return;
      const moved = ns.widgetsModule.moveFolderItemToGrid(payload.folderId, payload.itemId);
      if (moved) ns.ui.refreshOpenFolderModal();
    });
  };

  ns.dragModule = {
    setFolderItemDrag(payload) {
      folderItemDrag = payload || null;
    },

    getFolderItemDrag() {
      return folderItemDrag;
    },

    clearFolderItemDrag() {
      folderItemDrag = null;
      dom.grid.classList.remove("folder-drop-ready");
    },

    init() {
      bindFolderDrop();
      if (state.ui.sortableInstance || !window.Sortable) return;

      const sortableInstance = new Sortable(dom.grid, {
        animation: 520,
        ghostClass: "dragging",
        chosenClass: "dragging",
        dragClass: "dragging",
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        swapThreshold: 0.6,
        invertSwap: true,
        filter: ".add-tile",
        onStart: (event) => {
          dragSourceId = event?.item?.dataset?.id || null;
          pointerToCenterDx = 0;
          pointerToCenterDy = 0;

          const tile = event?.item?.querySelector?.(".tile-body");
          const p = event?.originalEvent;
          if (
            tile &&
            p &&
            typeof p.clientX === "number" &&
            typeof p.clientY === "number"
          ) {
            const rect = tile.getBoundingClientRect();
            pointerToCenterDx = (rect.left + rect.width / 2) - p.clientX;
            pointerToCenterDy = (rect.top + rect.height / 2) - p.clientY;
          }

          pendingMerge = null;
          clearPreview();
        },
        onMove: () => {
          const sourceId = dragSourceId;
          if (!sourceId) return true;
          return !(pendingMerge && pendingMerge.sourceId === sourceId);
        },
        onEnd: () => {
          const sourceId = dragSourceId;
          const mergeTargetId =
            sourceId && pendingMerge && pendingMerge.sourceId === sourceId
              ? pendingMerge.targetId
              : null;

          suppressLinkClicksUntil = Date.now() + 220;

          if (sourceId && mergeTargetId) {
            ns.widgetsModule.combineWidgetsIntoFolder(sourceId, mergeTargetId);
          } else {
            const ids = Array.from(dom.grid.querySelectorAll(".card[data-id]")).map((el) => el.dataset.id);
            ns.widgetsModule.reorderByIds(ids);
          }

          dragSourceId = null;
          pendingMerge = null;
          clearPreview();
          ns.ui.updateGridLayout();
        },
      });

      ns.stateStore.updateState((current) => ({
        ui: { ...current.ui, sortableInstance },
      }), { persist: false });
    },
  };
})();
