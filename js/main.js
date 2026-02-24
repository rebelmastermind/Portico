(() => {
  const ns = (window.portico = window.portico || {});
  ns.app.init();

  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  if (!("serviceWorker" in navigator)) return;
  if (window.location.protocol !== "https:" && !isLocalhost) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Non-critical: app should continue if SW registration fails
    });
  });
})();
