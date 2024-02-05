//https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/browsingData/removeCache

/*
Default settings. If there is nothing in storage, use these values.
*/
var defaultSettings = {
  reload: true,
  notification: true,
  dataTypes: ["cache"]
};

/*
On startup, check whether we have stored settings.
If we don't, then store the default settings.
*/
function checkStoredSettings(storedSettings) {

  if (storedSettings.notification == null 
    || storedSettings.reload == null
    || storedSettings.dataTypes == null) {

    browser.storage.local.set(defaultSettings);

  }
}

const gettingStoredSettings = browser.storage.local.get();
gettingStoredSettings.then(checkStoredSettings, onError);

function clearCache(storedSettings) {

  const reload = storedSettings.reload;
  const notification = storedSettings.notification;

   /*
  Convert from an array of strings, representing data types,
  to an object suitable for passing into browsingData.remove().
  */
  function getTypes(selectedTypes) {
    var dataTypes = {};
    for (var item of selectedTypes) {
      dataTypes[item] = true;
    }
    return dataTypes;
  }
  
  const dataTypes = getTypes(storedSettings.dataTypes);

  function onCleared() {
    //https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/reload
    if (reload) {

    browser.tabs.reload()

    }
    //https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/notifications
    if (notification) {

      if(Object.keys(dataTypes).length === 0) {

        browser.notifications.create({
          "type": "basic",
          "title": "Clear Cache",
          "message": "All data types have been disabled. Enable at least one data type in options",
          "iconUrl": browser.extension.getURL('/icons/broom.svg')
        }).then(function() {});
      } else {

        var dataTypesString = Object.keys(dataTypes).join(", ");
     
        browser.notifications.create({
          "type": "basic",
          "title": "Clear Cache",
          "message": `Cleared ${dataTypesString}\n`,
          "iconUrl": browser.extension.getURL('/icons/broom.svg')
        }).then(function() {});
      }

    }
    
  }

  browser.browsingData.remove({}, dataTypes).then(onCleared, onError);
}

function onError(error) {
  console.error(error);
}

browser.browserAction.onClicked.addListener(() => {
  const gettingStoredSettings = browser.storage.local.get();
  gettingStoredSettings.then(clearCache, onError);
});
