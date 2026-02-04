// Configurações padrão
const defaultSettings = {
  reload: true,
  notification: true,
  dataTypes: ["cache"],
  timePeriod: "all", // all, 15min, 1hour, 24hours, 1week
  customKey: "F9",
  currentTabOnly: false,
  debug: false
};

const NOTIFICATION_ICON_URL = browser.runtime.getURL("icons/broom-32.png");

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
  if (typeof correctedSettings.debug !== 'boolean') {
    correctedSettings.debug = defaultSettings.debug;
    needsUpdate = true;
  }

  if (needsUpdate) {
    browser.storage.local.set(correctedSettings).catch(onError);
  }
}

const gettingStoredSettings = browser.storage.local.get(defaultSettings);
gettingStoredSettings.then(checkStoredSettings, onError);

function logDebug(storedSettings, ...args) {
  if (storedSettings && storedSettings.debug) {
    console.info("[Clear Cache]", ...args);
  }
}

function showNotification(storedSettings, message) {
  logDebug(storedSettings, "notify", message);
  if (!browser.notifications || !browser.notifications.create) {
    return Promise.resolve();
  }
  return browser.notifications.create({
    type: "basic",
    title: browser.i18n.getMessage("extensionName"),
    message,
    iconUrl: NOTIFICATION_ICON_URL
  }).then(
    id => {
      logDebug(storedSettings, "notify created", id);
      return id;
    },
    error => {
      logDebug(storedSettings, "notify error", error);
      onError(error);
    }
  );
}

function setBadgeWarning() {
  if (browser.browserAction && browser.browserAction.setBadgeText) {
    browser.browserAction.setBadgeText({ text: "!" }).catch(onError);
    browser.browserAction.setBadgeBackgroundColor({ color: "#d9534f" }).catch(onError);
    setTimeout(() => {
      browser.browserAction.setBadgeText({ text: "" }).catch(onError);
    }, 6000);
  }
}

function clearBadge() {
  if (browser.browserAction && browser.browserAction.setBadgeText) {
    browser.browserAction.setBadgeText({ text: "" }).catch(onError);
  }
}

function clearCache(storedSettings) {
  const reload = storedSettings.reload;
  const notification = storedSettings.notification;
  const timePeriod = storedSettings.timePeriod || "all";
  const currentTabOnly = storedSettings.currentTabOnly;
  logDebug(storedSettings, "clearCache start", {
    reload,
    notification,
    timePeriod,
    currentTabOnly,
    dataTypes: storedSettings.dataTypes
  });

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
    logDebug(storedSettings, "no data types selected");
    if (notification) {
      showNotification(storedSettings, browser.i18n.getMessage("disabledTypesMessage"));
    }
    return;
  }

  function onCleared(tabMessage = "") {
    logDebug(storedSettings, "cleared", { tabMessage });
    clearBadge();
    if (reload) {
      browser.tabs.reload();
    }
    if (notification) {
      var dataTypesString = Object.keys(dataTypes).join(", ");
      var timeDescription = getTimeDescription(timePeriod);
      var message = tabMessage
        ? `${dataTypesString} ${tabMessage} ${browser.i18n.getMessage("notificationContent")} (${timeDescription})`
        : `${dataTypesString} ${browser.i18n.getMessage("notificationContent")} (${timeDescription})`;
      showNotification(storedSettings, message);
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
      showNotification(
        storedSettings,
        browser.i18n.getMessage("unsupportedUrlMessage") ||
          "Cannot clear cache for this page type. Try disabling 'Current tab only' option."
      );
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
    logDebug(storedSettings, "currentTabOnly split", {
      compatibleTypes,
      incompatibleTypes
    });

    // Se só tem tipos incompatíveis, avisa e não executa
    if (hasIncompatibleTypes && !hasCompatibleTypes) {
      logDebug(storedSettings, "blocked: only incompatible types with currentTabOnly");
      setBadgeWarning();
      if (notification) {
        showNotification(
          storedSettings,
          browser.i18n.getMessage("incompatibleTypesMessage") ||
            "The selected data types (cache, history, etc.) cannot be cleared for a single site. Disable 'Current tab only' or select cookies/localStorage."
        );
      }
      return;
    }

    // Se tem tipos incompatíveis misturados com compatíveis, avisa quais serão ignorados
    if (hasIncompatibleTypes && hasCompatibleTypes && notification) {
      const ignoredTypes = Object.keys(incompatibleTypes).join(", ");
      showNotification(
        storedSettings,
        (browser.i18n.getMessage("partialClearMessage") || "Note: {types} will be skipped (not supported for single site).")
          .replace("{types}", ignoredTypes)
      );
    }

    browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
      if (tabs.length > 0) {
        const currentTab = tabs[0];

        // Verifica se URL existe e é suportada
        if (!currentTab.url || isUnsupportedUrl(currentTab.url)) {
          logDebug(storedSettings, "unsupported url", currentTab.url);
          showUnsupportedUrlError();
          return;
        }

        try {
          const url = new URL(currentTab.url);
          const hostname = url.hostname;
          logDebug(storedSettings, "current tab hostname", hostname);

          if (hostname && hostname !== '') {
            // Usa apenas os tipos compatíveis com hostnames
            logDebug(storedSettings, "browsingData.remove hostnames", {
              hostnames: [hostname],
              since: sinceTimestamp,
              types: compatibleTypes
            });
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
    logDebug(storedSettings, "clearing globally");
    logDebug(storedSettings, "browsingData.remove global", {
      since: sinceTimestamp,
      types: dataTypes
    });
    browser.browsingData.remove({since: sinceTimestamp}, dataTypes).then(() => onCleared(""), onError);
  }
}

function onError(error) {
  console.error("[Clear Cache]", error);
}

// Clique no ícone da extensão chama a limpeza
browser.browserAction.onClicked.addListener(() => {
  const gettingStoredSettings = browser.storage.local.get(defaultSettings);
  gettingStoredSettings.then(clearCache, onError);
});

// Atalhos de teclado são configurados via manifest.json

// Função para limpar cache e sempre recarregar página (usado pelo menu de contexto)
function clearCacheAndReload(storedSettings) {
  // Tipos de dados que suportam a opção 'hostnames' (limpeza por site)
  const hostnamesSupportedTypes = ['cookies', 'indexedDB', 'localStorage', 'serviceWorkers'];
  logDebug(storedSettings, "clearCacheAndReload start", {
    notification: storedSettings.notification,
    timePeriod: storedSettings.timePeriod,
    currentTabOnly: storedSettings.currentTabOnly,
    dataTypes: storedSettings.dataTypes
  });

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
    logDebug(storedSettings, "no data types selected");
    if (notification) {
      showNotification(storedSettings, browser.i18n.getMessage("disabledTypesMessage"));
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
      showNotification(
        storedSettings,
        browser.i18n.getMessage("unsupportedUrlMessage") ||
          "Cannot clear cache for this page type. Try disabling 'Current tab only' option."
      );
    }
  }

  function onCleared(tabMessage = "") {
    logDebug(storedSettings, "clearCacheAndReload cleared", { tabMessage });
    clearBadge();
    browser.tabs.reload();
    if (notification) {
      var dataTypesString = Object.keys(dataTypes).join(", ");
      var message = tabMessage
        ? `${dataTypesString} ${tabMessage} ${browser.i18n.getMessage("contextMenuClearAndReload")}`
        : `${dataTypesString} ${browser.i18n.getMessage("contextMenuClearAndReload")}`;
      showNotification(storedSettings, message);
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
    logDebug(storedSettings, "currentTabOnly split", {
      compatibleTypes,
      incompatibleTypes
    });

    // Se só tem tipos incompatíveis, avisa e não executa
    if (hasIncompatibleTypes && !hasCompatibleTypes) {
      logDebug(storedSettings, "blocked: only incompatible types with currentTabOnly");
      setBadgeWarning();
      if (notification) {
        showNotification(
          storedSettings,
          browser.i18n.getMessage("incompatibleTypesMessage") ||
            "The selected data types (cache, history, etc.) cannot be cleared for a single site. Disable 'Current tab only' or select cookies/localStorage."
        );
      }
      return;
    }

    // Se tem tipos incompatíveis misturados com compatíveis, avisa quais serão ignorados
    if (hasIncompatibleTypes && hasCompatibleTypes && notification) {
      const ignoredTypes = Object.keys(incompatibleTypes).join(", ");
      showNotification(
        storedSettings,
        (browser.i18n.getMessage("partialClearMessage") || "Note: {types} will be skipped (not supported for single site).")
          .replace("{types}", ignoredTypes)
      );
    }

    browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
      if (tabs.length > 0) {
        const currentTab = tabs[0];

        // Verifica se URL existe e é suportada
        if (!currentTab.url || isUnsupportedUrl(currentTab.url)) {
          logDebug(storedSettings, "unsupported url", currentTab.url);
          showUnsupportedUrlError();
          return;
        }

        try {
          const url = new URL(currentTab.url);
          const hostname = url.hostname;
          logDebug(storedSettings, "current tab hostname", hostname);

          if (hostname && hostname !== '') {
            // Usa apenas os tipos compatíveis com hostnames
            logDebug(storedSettings, "browsingData.remove hostnames", {
              hostnames: [hostname],
              since: sinceTimestamp,
              types: compatibleTypes
            });
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
    logDebug(storedSettings, "clearing globally");
    logDebug(storedSettings, "browsingData.remove global", {
      since: sinceTimestamp,
      types: dataTypes
    });
    browser.browsingData.remove({since: sinceTimestamp}, dataTypes).then(() => onCleared(""), onError);
  }
}

// Cria item de menu de contexto ao iniciar
if (browser.contextMenus && browser.contextMenus.create) {
  try {
    browser.contextMenus.create({
      id: "clear-cache-and-reload",
      title: browser.i18n.getMessage("contextMenuClearAndReload"),
      contexts: ["browser_action"]
    });
  } catch (error) {
    onError(error);
  }
}

// Lida com clique no menu de contexto
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "clear-cache-and-reload") {
    const gettingStoredSettings = browser.storage.local.get(defaultSettings);
    gettingStoredSettings.then(clearCacheAndReload, onError);
  }
});
