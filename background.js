// Configurações padrão
const defaultSettings = {
  reload: true,
  notification: true,
  dataTypes: ["cache"],
  timePeriod: "all", // all, 15min, 1hour, 24hours, 1week
  customKey: "F9",
  currentTabOnly: true
};

// Verifica e corrige configurações inválidas
function checkStoredSettings(storedSettings) {
  let needsUpdate = false;
  const correctedSettings = { ...storedSettings };

  // Verifica cada configuração e corrige se inválida
  if (typeof correctedSettings.notification !== 'boolean') {
    correctedSettings.notification = defaultSettings.notification;
    needsUpdate = true;
  }
  if (typeof correctedSettings.reload !== 'boolean') {
    correctedSettings.reload = defaultSettings.reload;
    needsUpdate = true;
  }
  if (!Array.isArray(correctedSettings.dataTypes)) {
    correctedSettings.dataTypes = defaultSettings.dataTypes;
    needsUpdate = true;
  }
  if (typeof correctedSettings.timePeriod !== 'string' ||
      !['all', '15min', '1hour', '24hours', '1week'].includes(correctedSettings.timePeriod)) {
    correctedSettings.timePeriod = defaultSettings.timePeriod;
    needsUpdate = true;
  }
  if (typeof correctedSettings.customKey !== 'string') {
    correctedSettings.customKey = defaultSettings.customKey;
    needsUpdate = true;
  }
  if (typeof correctedSettings.currentTabOnly !== 'boolean') {
    correctedSettings.currentTabOnly = defaultSettings.currentTabOnly;
    needsUpdate = true;
  }

  if (needsUpdate) {
    browser.storage.local.set(correctedSettings).catch(onError);
  }
}

const gettingStoredSettings = browser.storage.local.get();
gettingStoredSettings.then(checkStoredSettings, onError);

function clearCache(storedSettings) {
  const reload = storedSettings.reload;
  const notification = storedSettings.notification;
  const timePeriod = storedSettings.timePeriod || "all";
  const currentTabOnly = storedSettings.currentTabOnly;

  // Tipos de dados que suportam a opção 'hostnames' (limpeza por site)
  const hostnamesSupportedTypes = ['cookies', 'indexedDB', 'localStorage', 'serviceWorkers'];

  // Calcula o timestamp 'since' baseado no período selecionado
  function getSinceTimestamp(period) {
    const now = Date.now();
    switch (period) {
      case "15min":
        return now - (15 * 60 * 1000);
      case "1hour":
        return now - (60 * 60 * 1000);
      case "24hours":
        return now - (24 * 60 * 60 * 1000);
      case "1week":
        return now - (7 * 24 * 60 * 60 * 1000);
      case "all":
      default:
        return 0;
    }
  }

  // Converte array de tipos em objeto para browsingData.remove
  function getTypes(selectedTypes) {
    var dataTypes = {};
    for (var item of selectedTypes) {
      dataTypes[item] = true;
    }
    return dataTypes;
  }

  const dataTypes = getTypes(storedSettings.dataTypes || []);
  const sinceTimestamp = getSinceTimestamp(timePeriod);

  // Se nenhum tipo de dado foi selecionado, apenas notifica e retorna
  if (Object.keys(dataTypes).length === 0) {
    if (notification) {
      browser.notifications.create({
        "type": "basic",
        "title": browser.i18n.getMessage("extensionName"),
        "message": browser.i18n.getMessage("disabledTypesMessage"),
        "iconUrl": browser.runtime.getURL('/icons/broom.svg')
      });
    }
    return;
  }

  function onCleared(tabMessage = "") {
    if (reload) {
      browser.tabs.reload();
    }
    if (notification) {
      var dataTypesString = Object.keys(dataTypes).join(", ");
      var timeDescription = getTimeDescription(timePeriod);
      var message = tabMessage
        ? `${dataTypesString} ${tabMessage} ${browser.i18n.getMessage("notificationContent")} (${timeDescription})`
        : `${dataTypesString} ${browser.i18n.getMessage("notificationContent")} (${timeDescription})`;
      browser.notifications.create({
        "type": "basic",
        "title": browser.i18n.getMessage("extensionName"),
        "message": message,
        "iconUrl": browser.runtime.getURL('/icons/broom.svg')
      });
    }
  }

  // Retorna descrição internacionalizada do período
  function getTimeDescription(period) {
    switch (period) {
      case "15min":
        return browser.i18n.getMessage("desc_15min");
      case "1hour":
        return browser.i18n.getMessage("desc_1hour");
      case "24hours":
        return browser.i18n.getMessage("desc_24hours");
      case "1week":
        return browser.i18n.getMessage("desc_1week");
      case "all":
      default:
        return browser.i18n.getMessage("desc_all");
    }
  }

  // Protocolos que não suportam limpeza por hostname
  const unsupportedProtocols = ['about:', 'file:', 'data:', 'blob:', 'moz-extension:', 'chrome:', 'javascript:'];

  // Verifica se a URL é de um protocolo não suportado
  function isUnsupportedUrl(urlString) {
    return unsupportedProtocols.some(protocol => urlString.startsWith(protocol));
  }

  // Mostra notificação de erro para URLs não suportadas
  function showUnsupportedUrlError() {
    if (notification) {
      browser.notifications.create({
        "type": "basic",
        "title": browser.i18n.getMessage("extensionName"),
        "message": browser.i18n.getMessage("unsupportedUrlMessage") || "Cannot clear cache for this page type. Try disabling 'Current tab only' option.",
        "iconUrl": browser.runtime.getURL('/icons/broom.svg')
      });
    }
  }

  if (currentTabOnly) {
    // Separa tipos compatíveis e incompatíveis com hostnames
    const selectedTypes = Object.keys(dataTypes);
    const compatibleTypes = {};
    const incompatibleTypes = {};

    selectedTypes.forEach(type => {
      if (hostnamesSupportedTypes.includes(type)) {
        compatibleTypes[type] = true;
      } else {
        incompatibleTypes[type] = true;
      }
    });

    const hasIncompatibleTypes = Object.keys(incompatibleTypes).length > 0;
    const hasCompatibleTypes = Object.keys(compatibleTypes).length > 0;

    // Se só tem tipos incompatíveis, avisa e não executa
    if (hasIncompatibleTypes && !hasCompatibleTypes) {
      if (notification) {
        browser.notifications.create({
          "type": "basic",
          "title": browser.i18n.getMessage("extensionName"),
          "message": browser.i18n.getMessage("incompatibleTypesMessage") || "The selected data types (cache, history, etc.) cannot be cleared for a single site. Disable 'Current tab only' or select cookies/localStorage.",
          "iconUrl": browser.runtime.getURL('/icons/broom.svg')
        });
      }
      return;
    }

    // Se tem tipos incompatíveis misturados com compatíveis, avisa quais serão ignorados
    if (hasIncompatibleTypes && hasCompatibleTypes && notification) {
      const ignoredTypes = Object.keys(incompatibleTypes).join(", ");
      browser.notifications.create({
        "type": "basic",
        "title": browser.i18n.getMessage("extensionName"),
        "message": (browser.i18n.getMessage("partialClearMessage") || "Note: {types} will be skipped (not supported for single site).").replace("{types}", ignoredTypes),
        "iconUrl": browser.runtime.getURL('/icons/broom.svg')
      });
    }

    browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
      if (tabs.length > 0) {
        const currentTab = tabs[0];

        // Verifica se URL existe e é suportada
        if (!currentTab.url || isUnsupportedUrl(currentTab.url)) {
          showUnsupportedUrlError();
          return;
        }

        try {
          const url = new URL(currentTab.url);
          const hostname = url.hostname;

          if (hostname && hostname !== '') {
            // Usa apenas os tipos compatíveis com hostnames
            browser.browsingData.remove({
              hostnames: [hostname],
              since: sinceTimestamp
            }, compatibleTypes).then(() => onCleared(browser.i18n.getMessage("currentTabLabel") || "(current tab)"), onError);
          } else {
            showUnsupportedUrlError();
          }
        } catch (e) {
          showUnsupportedUrlError();
        }
      }
    }).catch(onError);
  } else {
    browser.browsingData.remove({since: sinceTimestamp}, dataTypes).then(() => onCleared(""), onError);
  }
}

function onError(error) {
  console.error(error);
}

// Clique no ícone da extensão chama a limpeza
browser.browserAction.onClicked.addListener(() => {
  const gettingStoredSettings = browser.storage.local.get();
  gettingStoredSettings.then(clearCache, onError);
});

// Atalhos de teclado são configurados via manifest.json

// Função para limpar cache e sempre recarregar página (usado pelo menu de contexto)
function clearCacheAndReload(storedSettings) {
  // Tipos de dados que suportam a opção 'hostnames' (limpeza por site)
  const hostnamesSupportedTypes = ['cookies', 'indexedDB', 'localStorage', 'serviceWorkers'];

  function getTypes(selectedTypes) {
    var dataTypes = {};
    for (var item of selectedTypes || []) {
      dataTypes[item] = true;
    }
    return dataTypes;
  }

  // Calcula o timestamp 'since' baseado no período selecionado
  function getSinceTimestamp(period) {
    const now = Date.now();
    switch (period) {
      case "15min":
        return now - (15 * 60 * 1000);
      case "1hour":
        return now - (60 * 60 * 1000);
      case "24hours":
        return now - (24 * 60 * 60 * 1000);
      case "1week":
        return now - (7 * 24 * 60 * 60 * 1000);
      case "all":
      default:
        return 0;
    }
  }

  const dataTypes = getTypes(storedSettings.dataTypes);
  const notification = storedSettings.notification;
  const currentTabOnly = storedSettings.currentTabOnly;
  const timePeriod = storedSettings.timePeriod || "all";
  const sinceTimestamp = getSinceTimestamp(timePeriod);

  // Se nenhum tipo de dado foi selecionado, apenas notifica
  if (Object.keys(dataTypes).length === 0) {
    if (notification) {
      browser.notifications.create({
        "type": "basic",
        "title": browser.i18n.getMessage("extensionName"),
        "message": browser.i18n.getMessage("disabledTypesMessage"),
        "iconUrl": browser.runtime.getURL('/icons/broom.svg')
      });
    }
    return;
  }

  // Protocolos que não suportam limpeza por hostname
  const unsupportedProtocols = ['about:', 'file:', 'data:', 'blob:', 'moz-extension:', 'chrome:', 'javascript:'];

  function isUnsupportedUrl(urlString) {
    return unsupportedProtocols.some(protocol => urlString.startsWith(protocol));
  }

  function showUnsupportedUrlError() {
    if (notification) {
      browser.notifications.create({
        "type": "basic",
        "title": browser.i18n.getMessage("extensionName"),
        "message": browser.i18n.getMessage("unsupportedUrlMessage") || "Cannot clear cache for this page type. Try disabling 'Current tab only' option.",
        "iconUrl": browser.runtime.getURL('/icons/broom.svg')
      });
    }
  }

  function onCleared(tabMessage = "") {
    browser.tabs.reload();
    if (notification) {
      var dataTypesString = Object.keys(dataTypes).join(", ");
      var message = tabMessage
        ? `${dataTypesString} ${tabMessage} ${browser.i18n.getMessage("contextMenuClearAndReload")}`
        : `${dataTypesString} ${browser.i18n.getMessage("contextMenuClearAndReload")}`;
      browser.notifications.create({
        "type": "basic",
        "title": browser.i18n.getMessage("extensionName"),
        "message": message,
        "iconUrl": browser.runtime.getURL('/icons/broom.svg')
      });
    }
  }

  if (currentTabOnly) {
    // Separa tipos compatíveis e incompatíveis com hostnames
    const selectedTypes = Object.keys(dataTypes);
    const compatibleTypes = {};
    const incompatibleTypes = {};

    selectedTypes.forEach(type => {
      if (hostnamesSupportedTypes.includes(type)) {
        compatibleTypes[type] = true;
      } else {
        incompatibleTypes[type] = true;
      }
    });

    const hasIncompatibleTypes = Object.keys(incompatibleTypes).length > 0;
    const hasCompatibleTypes = Object.keys(compatibleTypes).length > 0;

    // Se só tem tipos incompatíveis, avisa e não executa
    if (hasIncompatibleTypes && !hasCompatibleTypes) {
      if (notification) {
        browser.notifications.create({
          "type": "basic",
          "title": browser.i18n.getMessage("extensionName"),
          "message": browser.i18n.getMessage("incompatibleTypesMessage") || "The selected data types (cache, history, etc.) cannot be cleared for a single site. Disable 'Current tab only' or select cookies/localStorage.",
          "iconUrl": browser.runtime.getURL('/icons/broom.svg')
        });
      }
      return;
    }

    // Se tem tipos incompatíveis misturados com compatíveis, avisa quais serão ignorados
    if (hasIncompatibleTypes && hasCompatibleTypes && notification) {
      const ignoredTypes = Object.keys(incompatibleTypes).join(", ");
      browser.notifications.create({
        "type": "basic",
        "title": browser.i18n.getMessage("extensionName"),
        "message": (browser.i18n.getMessage("partialClearMessage") || "Note: {types} will be skipped (not supported for single site).").replace("{types}", ignoredTypes),
        "iconUrl": browser.runtime.getURL('/icons/broom.svg')
      });
    }

    browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
      if (tabs.length > 0) {
        const currentTab = tabs[0];

        // Verifica se URL existe e é suportada
        if (!currentTab.url || isUnsupportedUrl(currentTab.url)) {
          showUnsupportedUrlError();
          return;
        }

        try {
          const url = new URL(currentTab.url);
          const hostname = url.hostname;

          if (hostname && hostname !== '') {
            // Usa apenas os tipos compatíveis com hostnames
            browser.browsingData.remove({
              hostnames: [hostname],
              since: sinceTimestamp
            }, compatibleTypes).then(() => onCleared(browser.i18n.getMessage("currentTabLabel") || "(current tab)"), onError);
          } else {
            showUnsupportedUrlError();
          }
        } catch (e) {
          showUnsupportedUrlError();
        }
      }
    }).catch(onError);
  } else {
    browser.browsingData.remove({since: sinceTimestamp}, dataTypes).then(() => onCleared(""), onError);
  }
}

// Cria item de menu de contexto ao iniciar
browser.contextMenus.create({
  id: "clear-cache-and-reload",
  title: browser.i18n.getMessage("contextMenuClearAndReload"),
  contexts: ["browser_action"]
});

// Lida com clique no menu de contexto
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "clear-cache-and-reload") {
    const gettingStoredSettings = browser.storage.local.get();
    gettingStoredSettings.then(clearCacheAndReload, onError);
  }
});
