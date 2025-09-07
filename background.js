// Configurações padrão
const defaultSettings = {
  reload: true,
  notification: true,
  dataTypes: ["cache"],
  timePeriod: "all", // all, 15min, 1hour, 24hours, 1week
  customKey: "F9",
  currentTabOnly: false
};

// Verifica e salva configurações padrão se necessário
function checkStoredSettings(storedSettings) {
  if (
    storedSettings.notification == null ||
    storedSettings.reload == null ||
    storedSettings.dataTypes == null ||
    storedSettings.timePeriod == null ||
    storedSettings.customKey == null ||
    storedSettings.currentTabOnly == null
  ) {
    browser.storage.local.set(defaultSettings);
  }
}

const gettingStoredSettings = browser.storage.local.get();
gettingStoredSettings.then(checkStoredSettings, onError);

function clearCache(storedSettings) {
  const reload = storedSettings.reload;
  const notification = storedSettings.notification;
  const timePeriod = storedSettings.timePeriod || "all";
  const currentTabOnly = storedSettings.currentTabOnly;

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

  const dataTypes = getTypes(storedSettings.dataTypes);
  const sinceTimestamp = getSinceTimestamp(timePeriod);

  function onCleared(tabMessage = "") {
    if (reload) {
      browser.tabs.reload();
    }
    if (notification) {
      if (Object.keys(dataTypes).length === 0) {
        browser.notifications.create({
          "type": "basic",
          "title": browser.i18n.getMessage("extensionName"),
          "message": browser.i18n.getMessage("disabledTypesMessage"),
          "iconUrl": browser.runtime.getURL('/icons/broom.svg')
        }).then(function() {});
      } else {
        var dataTypesString = Object.keys(dataTypes).join(", ");
        var timeDescription = getTimeDescription(timePeriod);
        browser.notifications.create({
          "type": "basic",
          "title": browser.i18n.getMessage("extensionName"),
          "message": `${dataTypesString} ${tabMessage} ${browser.i18n.getMessage("notificationContent")} (${timeDescription})`,
          "iconUrl": browser.runtime.getURL('/icons/broom.svg')
        }).then(function() {});
      }
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

  if (currentTabOnly) {
    browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
      if (tabs.length > 0) {
        const currentTab = tabs[0];
        try {
          const url = new URL(currentTab.url);
          const origin = url.origin;
          if (origin && origin !== 'null') {
            browser.browsingData.remove({
              origins: [origin],
              since: sinceTimestamp
            }, dataTypes).then(() => onCleared("(aba atual)"), onError);
          } else {
            browser.browsingData.remove({since: sinceTimestamp}, dataTypes).then(() => onCleared(""), onError);
          }
        } catch (e) {
          browser.browsingData.remove({since: sinceTimestamp}, dataTypes).then(() => onCleared(""), onError);
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
  function getTypes(selectedTypes) {
    var dataTypes = {};
    for (var item of selectedTypes) {
      dataTypes[item] = true;
    }
    return dataTypes;
  }
  
  const dataTypes = getTypes(storedSettings.dataTypes);
  const notification = storedSettings.notification;

  function onCleared() {
    browser.tabs.reload();
    if (notification) {
      if (Object.keys(dataTypes).length === 0) {
        browser.notifications.create({
          "type": "basic",
          "title": browser.i18n.getMessage("extensionName"),
          "message": browser.i18n.getMessage("disabledTypesMessage"),
          "iconUrl": browser.runtime.getURL('/icons/broom.svg')
        }).then(function() {});
      } else {
        var dataTypesString = Object.keys(dataTypes).join(", ");
        browser.notifications.create({
          "type": "basic",
          "title": browser.i18n.getMessage("extensionName"),
          "message": `${dataTypesString} ${browser.i18n.getMessage("contextMenuClearAndReload")}`,
          "iconUrl": browser.runtime.getURL('/icons/broom.svg')
        }).then(function() {});
      }
    }
  }

  browser.browsingData.remove({since: 0}, dataTypes).then(onCleared, onError);
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
