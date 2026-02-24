(() => {
  const ns = (window.portico = window.portico || {});

  ns.utils = {
    normalizeUrl(raw) {
      const trimmed = raw.trim();
      if (!trimmed) return "";
      if (/^https?:\/\//i.test(trimmed)) return trimmed;
      return `https://${trimmed}`;
    },

    getFaviconUrl(url) {
      try {
        const parsed = new URL(url);
        return `${parsed.origin}/favicon.ico`;
      } catch {
        return "";
      }
    },

    getFallbackFaviconUrl(url) {
      try {
        const parsed = new URL(url);
        return `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(parsed.origin)}`;
      } catch {
        return "";
      }
    },

    buildIconCandidates({ url = "", iconUrl = "", defaultIcon = "" } = {}) {
      const custom = iconUrl ? String(iconUrl).trim() : "";
      const normalizedUrl = url ? this.normalizeUrl(String(url)) : "";
      const favicon = normalizedUrl ? this.getFaviconUrl(normalizedUrl) : "";
      const fallback = normalizedUrl ? this.getFallbackFaviconUrl(normalizedUrl) : "";
      return [custom, favicon, fallback, defaultIcon].filter(Boolean);
    },

    loadImageWithFallback(img, candidates, options = {}) {
      if (!img) return;
      const queue = Array.isArray(candidates) ? [...candidates] : [];
      if (queue.length === 0) return;

      const requestId = String((Number(img.dataset.requestId || "0") || 0) + 1);
      img.dataset.requestId = requestId;
      let index = -1;

      const next = () => {
        if (img.dataset.requestId !== requestId) return;
        index += 1;
        const src = queue[index];
        if (!src) return;
        img.src = src;
        if (typeof options.onResolve === "function") {
          options.onResolve(src, index);
        }
      };

      img.onerror = () => {
        if (img.dataset.requestId !== requestId) return;
        if (typeof options.onCandidateError === "function") {
          options.onCandidateError(img.currentSrc || img.src || "", index);
        }
        if (index >= queue.length - 1) return;
        next();
      };

      img.onload = () => {
        if (img.dataset.requestId !== requestId) return;
        if (typeof options.onResolve === "function") {
          options.onResolve(img.currentSrc || img.src || "", index);
        }
      };

      next();
    },

    setImageFromLinkConfig(img, { url = "", iconUrl = "", defaultIcon = "" } = {}, options = {}) {
      const custom = iconUrl ? String(iconUrl).trim() : "";
      const candidates = this.buildIconCandidates({ url, iconUrl: custom, defaultIcon });
      this.loadImageWithFallback(img, candidates, {
        onResolve: options.onResolve,
        onCandidateError: (_, index) => {
          if (index === 0 && custom && typeof options.onCustomIconError === "function") {
            options.onCustomIconError();
          }
          if (typeof options.onCandidateError === "function") {
            options.onCandidateError(index);
          }
        },
      });
    },
  };
})();
