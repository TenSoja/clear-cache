// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/browsingData/removeCache

/*
Default settings. If there is nothing in storage, use these values.
*/
const defaultSettings = {
  reload: true,
  notification: true,
  dataTypes: ["cache"],
  customKey: "F9",
  currentTabOnly: false
};

/*
On startup, check whether we have stored settings.
If we don't, then store the default settings.
*/
function checkStoredSettings(storedSettings) {
  if (
    storedSettings.notification == null ||
    storedSettings.reload == null ||
    storedSettings.dataTypes == null ||
    storedSettings.customKey == null ||
    storedSettings.currentTabOnly == null
  ) {
    browser.storage.local.set(defaultSettings);
  }
}

// Fetch stored settings to check and set defaults if necessary
const gettingStoredSettings = browser.storage.local.get();
gettingStoredSettings.then(checkStoredSettings, onError);

/*
Function to clear cache based on stored settings.
*/
function clearCache(storedSettings) {
  const reload = storedSettings.reload;
  const notification = storedSettings.notification;
  const currentTabOnly = storedSettings.currentTabOnly;

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
    // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/reload
    if (reload) {
      browser.tabs.reload();
    }
    // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/notifications
    if (notification) {
      if (Object.keys(dataTypes).length === 0) {
        browser.notifications.create({
          "type": "basic",
          "title": "Clear Cache",
          "message": "All data types have been disabled. Enable at least one data type in options.",
          "iconUrl": browser.runtime.getURL('/icons/broom.svg')
        }).then(function() {});
      } else {
        var dataTypesString = Object.keys(dataTypes).join(", ");
        var tabMessage = currentTabOnly ? " for current tab" : "";
        browser.notifications.create({
          "type": "basic",
          "title": "Clear Cache",
          "message": `Cleared ${dataTypesString}${tabMessage}.`,
          "iconUrl": browser.runtime.getURL('/icons/broom.svg')
        }).then(function() {});
      }
    }
  }

  // Clear browsing data
  if (currentTabOnly) {
    // Get current active tab and clear data only for its origin
    browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
      if (tabs.length > 0) {
        const currentTab = tabs[0];
        try {
          const url = new URL(currentTab.url);
          const origin = url.origin;
          
          // Only proceed if we have a valid origin (not null)
          if (origin && origin !== 'null') {
            // Clear data only for the current tab's origin
            browser.browsingData.remove({
              origins: [origin]
            }, dataTypes).then(onCleared, onError);
          } else {
            // For special URLs (about:, chrome:, etc.), fall back to clearing all data
            browser.browsingData.remove({since: 0}, dataTypes).then(onCleared, onError);
          }
        } catch (e) {
          // If URL parsing fails, fall back to clearing all data
          browser.browsingData.remove({since: 0}, dataTypes).then(onCleared, onError);
        }
      }
    }).catch(onError);
  } else {
    // Clear all browsing data
    browser.browsingData.remove({since: 0}, dataTypes).then(onCleared, onError);
  }
}

// Error handling function
function onError(error) {
  console.error(error);
}

// Handle the browser action click
browser.browserAction.onClicked.addListener(() => {
  const gettingStoredSettings = browser.storage.local.get();
  gettingStoredSettings.then(clearCache, onError);
});

// Keyboard shortcuts are handled via manifest.json commands section
// The F9 key is configured to trigger _execute_browser_action which calls the browserAction.onClicked handler above