// Armazena as configurações selecionadas
function storeSettings() {
  function getTypes() {
    return Array.from(document.querySelectorAll(".data-types [type=checkbox]"))
      .filter(item => item.checked)
      .map(item => item.getAttribute("data-type"));
  }

  const settings = {
    dataTypes: getTypes(),
    reload: document.querySelector("#reload").checked,
    notification: document.querySelector("#notification").checked,
    timePeriod: document.querySelector('input[name="timePeriod"]:checked')?.value || "all",
    currentTabOnly: document.querySelector("#currentTabOnly").checked
  };

  browser.storage.local.set(settings).then(() => {
    browser.notifications.create({
      "type": "basic",
      "title": browser.i18n.getMessage('extensionName'),
      "message": browser.i18n.getMessage('preferencesSavedMessage'),
      "iconUrl": browser.runtime.getURL('/icons/broom.svg')
    });
  }).catch(onError);
}

// Internacionalização da página de opções
function localizeOptions() {
  document.querySelectorAll('[data-i18n]').forEach(obj => {
    const tag = obj.getAttribute('data-i18n');
    const message = browser.i18n.getMessage(tag.replace('__MSG_', ''));
    if (message) obj.textContent = message;
  });
}

// Atualiza a interface com os valores salvos ou padrão
function updateUI(restoredSettings) {
  localizeOptions();

  document.querySelector("#reload").checked = restoredSettings.reload !== false;
  document.querySelector("#notification").checked = restoredSettings.notification !== false;
  document.querySelector("#currentTabOnly").checked = restoredSettings.currentTabOnly === true;

  const checkboxes = document.querySelectorAll(".data-types [type=checkbox]");
  checkboxes.forEach(item => {
    item.checked = restoredSettings.dataTypes?.includes(item.getAttribute("data-type")) || false;
  });

  const timePeriod = restoredSettings.timePeriod || "all";
  const timePeriodRadio = document.querySelector(`input[name="timePeriod"][value="${timePeriod}"]`);
  if (timePeriodRadio) {
    timePeriodRadio.checked = true;
  } else {
    document.querySelector('input[name="timePeriod"][value="all"]').checked = true;
  }
}

function onError(e) {
  console.error(e);
}

// Inicializa a interface ao abrir a página
browser.storage.local.get().then(updateUI, onError);

// Salva configurações ao clicar no botão
document.querySelector("#save-button").addEventListener("click", storeSettings);