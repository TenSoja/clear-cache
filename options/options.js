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
Internationalization of options page works with
https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/i18n
*/

function localizeOptions() {

  function replace_i18n(obj, tag) {
    let message = tag.replace(/__MSG_(\w+)__/g, function(match, v1) {
        return v1 ? browser.i18n.getMessage(v1) : '';
    });

    if(message != tag) obj.innerHTML = message;
  }

    let data = document.querySelectorAll('[data-i18n]');

    for (let index in data) if (data.hasOwnProperty(index)) {
        let obj = data[index];
        let tag = obj.getAttribute('data-i18n').toString();

        replace_i18n(obj, tag);
    }

}

/*
Update the options UI with the settings values retrieved from storage,
or the default settings if the stored settings are empty.
*/
function updateUI(restoredSettings) {

  localizeOptions();

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