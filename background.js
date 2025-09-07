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
          "title": "Clear Cache",
          "message": "Todos os tipos de dados foram desabilitados. Ative pelo menos um nas opções.",
          "iconUrl": browser.runtime.getURL('/icons/broom.svg')
        }).then(function() {});
      } else {
        var dataTypesString = Object.keys(dataTypes).join(", ");
        var timeDescription = getTimeDescription(timePeriod);
        browser.notifications.create({
          "type": "basic",
          "title": "Clear Cache",
          "message": `Limpo ${dataTypesString} ${tabMessage} de ${timeDescription}.`,
          "iconUrl": browser.runtime.getURL('/icons/broom.svg')
        }).then(function() {});
      }
    }
  }

  // Retorna descrição legível do período
  function getTimeDescription(period) {
    switch (period) {
      case "15min":
        return "últimos 15 minutos";
      case "1hour":
        return "última hora";
      case "24hours":
        return "últimas 24 horas";
      case "1week":
        return "última semana";
      case "all":
      default:
        return "todo o tempo";
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