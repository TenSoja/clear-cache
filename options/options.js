/*
Store the currently selected settings using browser.storage.local.
*/
function storeSettings() {
  // Get the selected data types
  function getTypes() {
      return Array.from(document.querySelectorAll(".data-types [type=checkbox]"))
          .filter(item => item.checked)
          .map(item => item.getAttribute("data-type"));
  }

  // Store all settings at once
  const settings = {
      dataTypes: getTypes(),
      reload: document.querySelector("#reload").checked,
      notification: document.querySelector("#notification").checked
  };

  browser.storage.local.set(settings);
}

/*
Internationalization of options page
*/
function localizeOptions() {
  document.querySelectorAll('[data-i18n]').forEach(obj => {
      const tag = obj.getAttribute('data-i18n').toString();
      const message = tag.replace(/__MSG_(\w+)__/g, (_, v1) => v1 ? browser.i18n.getMessage(v1) : '');
      if (message !== tag) obj.textContent = message;
  });
}

/*
Update the options UI with the settings values retrieved from storage,
or the default settings if the stored settings are empty.
*/
function updateUI(restoredSettings) {
  localizeOptions();

  // Default values: true for reload and notification
  document.querySelector("#reload").checked = restoredSettings.reload !== false;
  document.querySelector("#notification").checked = restoredSettings.notification !== false;

  // Update checkboxes for data types
  const checkboxes = document.querySelectorAll(".data-types [type=checkbox]");
  checkboxes.forEach(item => {
      item.checked = restoredSettings.dataTypes?.includes(item.getAttribute("data-type")) || false;
  });
}

function onError(e) {
  console.error(e);
}

/*
On opening the options page, fetch stored settings and update the UI with them.
*/
browser.storage.local.get().then(updateUI, onError);

/*
On clicking the save button, save the currently selected settings.
*/
document.querySelector("#save-button").addEventListener("click", storeSettings);