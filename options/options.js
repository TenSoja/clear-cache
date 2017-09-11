/*
This one is based on the example seen in https://github.com/mdn/webextensions-examples/tree/master/forget-it 
Store the currently selected settings using browser.storage.local.
*/
function storeSettings() {

  function getReload() {
    const reload = document.querySelector("#reload");
    return reload.checked;
  }

  function getNotification() {
    const notification = document.querySelector("#notification");
    return notification.checked;
  }

  const reload = getReload();
  const notification = getNotification();
  browser.storage.local.set({
    reload,
    notification
  });
}

/*
Update the options UI with the settings values retrieved from storage,
or the default settings if the stored settings are empty.
*/
function updateUI(restoredSettings) {

  if (restoredSettings.reload === undefined || restoredSettings.reload === true) {
    document.querySelector("#reload").checked = true;
  }

  if (restoredSettings.notification === undefined || restoredSettings.notification === true) {
    document.querySelector("#notification").checked = true;
  }

}

function onError(e) {
  console.error(e);
}

/*
On opening the options page, fetch stored settings and update the UI with them.
*/
const gettingStoredSettings = browser.storage.local.get();
gettingStoredSettings.then(updateUI, onError);

/*
On clicking the save button, save the currently selected settings.
*/
const saveButton = document.querySelector("#save-button");
saveButton.addEventListener("click", storeSettings);