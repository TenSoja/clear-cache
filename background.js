// Configurações padrão
const defaultSettings = {
  reload: true,
  notification: true,
  dataTypes: ["cache"],
  timePeriod: "all", // all, 15min, 1hour, 24hours, 1week
  customKey: "F9",
  currentTabOnly: false,
  debug: false,
  lastMigrationVersion: ""
};

const HOSTNAME_SUPPORTED_TYPES = new Set([
  "cookies",
  "indexedDB",
  "localStorage",
  "serviceWorkers"
]);

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
  if (typeof correctedSettings.lastMigrationVersion !== 'string') {
    correctedSettings.lastMigrationVersion = defaultSettings.lastMigrationVersion;
    needsUpdate = true;
  }

  // Migration: avoid "site-only + cache-only" silent no-op for legacy users
  if (correctedSettings.lastMigrationVersion !== "4.9") {
    const dataTypes = Array.isArray(correctedSettings.dataTypes) ? correctedSettings.dataTypes : [];
    const onlyIncompatible =
      correctedSettings.currentTabOnly === true &&
      dataTypes.length > 0 &&
      dataTypes.every(type => !HOSTNAME_SUPPORTED_TYPES.has(type));

    if (onlyIncompatible) {
      correctedSettings.currentTabOnly = false;
      correctedSettings.lastMigrationVersion = "4.9";
      needsUpdate = true;
    }
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

function getErrorMessage(error) {
  if (!error) {
    return "";
  }
  if (typeof error === "string") {
    return error;
  }
  if (typeof error.message === "string") {
    return error.message;
  }
  return String(error);
}

function reportFailure(storedSettings, error, fallbackMessage) {
  onError(error);
  setBadgeWarning();

  if (!storedSettings || storedSettings.notification === false) {
    return Promise.resolve();
  }

  const baseMessage =
    fallbackMessage ||
    browser.i18n.getMessage("operationFailedMessage") ||
    "Clear Cache failed.";
  const errorMessage = getErrorMessage(error);
  const message = errorMessage ? `${baseMessage} ${errorMessage}` : baseMessage;

  return showNotification(storedSettings, message);
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

  function filterPermittedTypes(typesObj) {
    if (!browser.browsingData || !browser.browsingData.settings) {
      return Promise.resolve(typesObj);
    }
    return browser.browsingData.settings().then(settings => {
      const permitted = settings.dataRemovalPermitted || settings.dataToRemove || {};
      const filtered = {};
      for (const type of Object.keys(typesObj)) {
        if (permitted[type] !== false) {
          filtered[type] = true;
        }
      }
      return filtered;
    }).catch(() => typesObj);
  }

  return filterPermittedTypes(dataTypes).then(filteredTypes => {
    const effectiveTypes = filteredTypes;

    // Se nenhum tipo de dado foi selecionado, apenas notifica e retorna
    if (Object.keys(effectiveTypes).length === 0) {
      logDebug(storedSettings, "no data types selected");
      if (notification) {
        showNotification(storedSettings, browser.i18n.getMessage("disabledTypesMessage"));
      }
      setBadgeWarning();
      return;
    }

  function onCleared(tabMessage = "") {
    logDebug(storedSettings, "cleared", { tabMessage });
    clearBadge();
    if (reload) {
      browser.tabs.reload().catch(onError);
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
    setBadgeWarning();
  }

    if (currentTabOnly) {
    // Separa tipos compatíveis e incompatíveis com hostnames
      const selectedTypes = Object.keys(effectiveTypes);
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
            }, compatibleTypes).then(
              () => onCleared(browser.i18n.getMessage("currentTabLabel") || "(current tab)"),
              error => reportFailure(storedSettings, error)
            );
          } else {
            showUnsupportedUrlError();
          }
        } catch (e) {
          showUnsupportedUrlError();
        }
      } else {
        setBadgeWarning();
      }
    }).catch(error => reportFailure(storedSettings, error));
    } else {
      logDebug(storedSettings, "clearing globally");
      logDebug(storedSettings, "browsingData.remove global", {
        since: sinceTimestamp,
        types: effectiveTypes
      });
      browser.browsingData.remove({since: sinceTimestamp}, effectiveTypes).then(
        () => onCleared(""),
        error => reportFailure(storedSettings, error)
      );
    }
  }).catch(error => reportFailure(storedSettings, error));
}

function onError(error) {
  console.error("[Clear Cache]", error);
}

// Clique no ícone da extensão chama a limpeza
browser.browserAction.onClicked.addListener(() => {
  const gettingStoredSettings = browser.storage.local.get(defaultSettings);
  gettingStoredSettings.then(settings => {
    logDebug(settings, "trigger: browserAction.onClicked");
    return clearCache(settings);
  }, error => reportFailure(defaultSettings, error));
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

  function filterPermittedTypes(typesObj) {
    if (!browser.browsingData || !browser.browsingData.settings) {
      return Promise.resolve(typesObj);
    }
    return browser.browsingData.settings().then(settings => {
      const permitted = settings.dataRemovalPermitted || settings.dataToRemove || {};
      const filtered = {};
      for (const type of Object.keys(typesObj)) {
        if (permitted[type] !== false) {
          filtered[type] = true;
        }
      }
      return filtered;
    }).catch(() => typesObj);
  }

  return filterPermittedTypes(dataTypes).then(filteredTypes => {
    const effectiveTypes = filteredTypes;

    // Se nenhum tipo de dado foi selecionado, apenas notifica
    if (Object.keys(effectiveTypes).length === 0) {
      logDebug(storedSettings, "no data types selected");
      if (notification) {
        showNotification(storedSettings, browser.i18n.getMessage("disabledTypesMessage"));
      }
      setBadgeWarning();
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
    setBadgeWarning();
  }

  function onCleared(tabMessage = "") {
    logDebug(storedSettings, "clearCacheAndReload cleared", { tabMessage });
    clearBadge();
    browser.tabs.reload().catch(onError);
  }

    if (currentTabOnly) {
    // Separa tipos compatíveis e incompatíveis com hostnames
      const selectedTypes = Object.keys(effectiveTypes);
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
            }, compatibleTypes).then(
              () => onCleared(browser.i18n.getMessage("currentTabLabel") || "(current tab)"),
              error => reportFailure(storedSettings, error)
            );
          } else {
            showUnsupportedUrlError();
          }
        } catch (e) {
          showUnsupportedUrlError();
        }
      } else {
        setBadgeWarning();
      }
    }).catch(error => reportFailure(storedSettings, error));
    } else {
      logDebug(storedSettings, "clearing globally");
      logDebug(storedSettings, "browsingData.remove global", {
        since: sinceTimestamp,
        types: effectiveTypes
      });
      browser.browsingData.remove({since: sinceTimestamp}, effectiveTypes).then(
        () => onCleared(""),
        error => reportFailure(storedSettings, error)
      );
    }
  }).catch(error => reportFailure(storedSettings, error));
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
if (browser.contextMenus && browser.contextMenus.onClicked) {
  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "clear-cache-and-reload") {
      const gettingStoredSettings = browser.storage.local.get(defaultSettings);
      gettingStoredSettings.then(settings => {
        logDebug(settings, "trigger: contextMenus.onClicked");
        return clearCacheAndReload(settings);
      }, error => reportFailure(defaultSettings, error));
    }
  });
}
