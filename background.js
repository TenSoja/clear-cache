// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/browsingData/removeCache

/*
Default settings. If there is nothing in storage, use these values.
*/
const defaultSettings = {
  reload: true,
  notification: true,
  dataTypes: ["cache"]
};

/*
On startup, check whether we have stored settings.
If we don't, then store the default settings.
*/
function checkStoredSettings(storedSettings) {
  if (
    storedSettings.notification == null ||
    storedSettings.reload == null ||
    storedSettings.dataTypes == null
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
        browser.notifications.create({
          "type": "basic",
          "title": "Clear Cache",
          "message": `Cleared ${dataTypesString}.`,
          "iconUrl": browser.runtime.getURL('/icons/broom.svg')
        }).then(function() {});
      }
    }
  }

  // Clear browsing data
  browser.browsingData.remove({since: 0}, dataTypes).then(onCleared, onError);
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

/*
Function to clear cache and always reload page (used by context menu).
This ignores the user's reload preference and always reloads.
*/
function clearCacheAndReload(storedSettings) {
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
  const notification = storedSettings.notification;

  function onCleared() {
    // Always reload the page for this context menu action
    browser.tabs.reload();
    
    // Show notification if enabled
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
        browser.notifications.create({
          "type": "basic",
          "title": "Clear Cache",
          "message": `Cleared ${dataTypesString} and reloaded page.`,
          "iconUrl": browser.runtime.getURL('/icons/broom.svg')
        }).then(function() {});
      }
    }
  }

  // Clear browsing data
  browser.browsingData.remove({since: 0}, dataTypes).then(onCleared, onError);
}

// Create context menu item on startup
browser.contextMenus.create({
  id: "clear-cache-and-reload",
  title: browser.i18n.getMessage("contextMenuClearAndReload"),
  contexts: ["browser_action"]
});

// Handle context menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "clear-cache-and-reload") {
    const gettingStoredSettings = browser.storage.local.get();
    gettingStoredSettings.then(clearCacheAndReload, onError);
  }
});