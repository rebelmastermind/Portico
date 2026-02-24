(() => {
  const ns = (window.portico = window.portico || {});
  const { storage, stateStore } = ns;

  ns.app = {
    init() {
      const persisted = storage.read();
      stateStore.setState(
        {
          widgets: persisted.widgets,
          settings: persisted.settings,
        },
        { persist: false }
      );

      if (ns.state.widgets.length === 0) {
        stateStore.setState({
          widgets: ns.DEFAULT_WIDGETS.map((widget) => ({ ...widget, id: crypto.randomUUID() })),
        });
      }

      ns.settingsModule.populateFontOptions();
      ns.settingsModule.populateSearchEngineOptions();
      ns.settingsModule.ensureFontsLoaded([
        ns.state.settings.titleFontFamily || ns.state.settings.fontFamily,
        ns.state.settings.subtitleFontFamily || ns.state.settings.fontFamily,
        ns.state.settings.tileTitleFontFamily || ns.state.settings.fontFamily,
      ]);
      ns.settingsModule.applyToCss();
      ns.settingsModule.hydrateForm();
      if (ns.ambientWidget) ns.ambientWidget.init();

      ns.ui.bindEvents();
      ns.ui.render();
    },
  };
})();
