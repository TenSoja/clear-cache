//https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/browsingData/removeCache

/*
Default settings. If there is nothing in storage, use these values.
*/
var defaultSettings = {
  reload: true,
  notification: true
};

/*
On startup, check whether we have stored settings.
If we don't, then store the default settings.
*/
function checkStoredSettings(storedSettings) {
  if (!storedSettings.reload || !storedSettings.notification) {
    browser.storage.local.set(defaultSettings);
  }
}

const gettingStoredSettings = browser.storage.local.get();
gettingStoredSettings.then(checkStoredSettings, onError);

function clearCache(storedSettings) {

  const reload = storedSettings.reload;
  const notification = storedSettings.notification;

  function onCleared() {
    //https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/reload
    if (reload) {

    browser.tabs.reload()

    }
    //https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/notifications
    if (notification) {

      browser.notifications.create({
        'type': 'basic',
        'iconUrl': browser.extension.getURL('icons/48.png'),
        'title': 'Yeah!',
        'message': 'Cache has been cleared.'
      }).then(function() {});

    }
    
  }

  browser.browsingData.removeCache({}).then(onCleared, onError);
}

function onError(error) {
  console.error(error);
}

browser.browserAction.onClicked.addListener(() => {
  const gettingStoredSettings = browser.storage.local.get();
  gettingStoredSettings.then(clearCache, onError);
});
