const DEFAULT_SETTINGS = {
  reload: true,
  notification: true,
  dataTypes: ["cache"],
  timePeriod: "all",
  currentTabOnly: false,
  debug: false
};

const NOTIFICATION_ICON_URL = browser.runtime.getURL("icons/broom-32.png");

function logDebugOptions(settings, ...args) {
  if (settings && settings.debug) {
    console.info("[Clear Cache][Options]", ...args);
  }
}

function showOptionsNotification(settings, message) {
  logDebugOptions(settings, "notify", message);
  if (!browser.notifications || !browser.notifications.create) {
    return Promise.resolve();
  }
  return browser.notifications.create({
    "type": "basic",
    "title": browser.i18n.getMessage('extensionName'),
    "message": message,
    "iconUrl": NOTIFICATION_ICON_URL
  }).then(
    id => {
      logDebugOptions(settings, "notify created", id);
      return id;
    },
    error => {
      logDebugOptions(settings, "notify error", error);
      onError(error);
    }
  );
}

const HOSTNAME_SUPPORTED_TYPES = new Set([
  "cookies",
  "indexedDB",
  "localStorage",
  "serviceWorkers"
]);

function enforceCurrentTabOnlySelection() {
  const currentTabOnly = document.querySelector("#currentTabOnly").checked;
  const checkboxes = document.querySelectorAll(".data-types [type=checkbox]");
  let hasCompatibleSelected = false;

  checkboxes.forEach(item => {
    const type = item.getAttribute("data-type");
    const isSupported = HOSTNAME_SUPPORTED_TYPES.has(type);
    const label = item.closest("label");

    if (currentTabOnly && !isSupported) {
      item.checked = false;
      item.disabled = true;
      if (label) label.classList.add("disabled");
    } else {
      item.disabled = false;
      if (label) label.classList.remove("disabled");
      if (currentTabOnly && isSupported && item.checked) {
        hasCompatibleSelected = true;
      }
    }
  });

  if (currentTabOnly && !hasCompatibleSelected) {
    const cookies = document.querySelector('.data-types [data-type="cookies"]');
    if (cookies) {
      cookies.checked = true;
    }
  }
}

// Armazena as configurações selecionadas
function storeSettings() {
  enforceCurrentTabOnlySelection();
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
    currentTabOnly: document.querySelector("#currentTabOnly").checked,
    debug: document.querySelector("#debug").checked
  };

  browser.storage.local.set(settings).then(() => {
    if (settings.notification) {
      showOptionsNotification(settings, browser.i18n.getMessage('preferencesSavedMessage'));
    }
  }).catch(onError);
}

// Internacionalização da página de opções
function localizeOptions() {
  document.querySelectorAll('[data-i18n]').forEach(obj => {
    const tag = obj.getAttribute('data-i18n');
    const key = tag.replace(/^__MSG_/, '').replace(/__$/, '');
    const message = browser.i18n.getMessage(key);
    if (message) obj.textContent = message;
  });
}

// Mostra/esconde aviso do currentTabOnly
function toggleCurrentTabOnlyWarning() {
  const checkbox = document.querySelector("#currentTabOnly");
  const warning = document.querySelector("#currentTabOnlyWarning");
  if (checkbox.checked) {
    warning.classList.add("visible");
  } else {
    warning.classList.remove("visible");
  }
}

// Atualiza a interface com os valores salvos ou padrão
function updateUI(restoredSettings) {
  localizeOptions();

  document.querySelector("#reload").checked = restoredSettings.reload !== false;
  document.querySelector("#notification").checked = restoredSettings.notification !== false;
  document.querySelector("#currentTabOnly").checked = restoredSettings.currentTabOnly === true;
  document.querySelector("#debug").checked = restoredSettings.debug === true;

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

  // Atualiza visibilidade do aviso
  toggleCurrentTabOnlyWarning();
  enforceCurrentTabOnlySelection();
}

function onError(e) {
  console.error("[Clear Cache]", e);
}

// Inicializa a interface ao abrir a página
browser.storage.local.get(DEFAULT_SETTINGS).then(updateUI, onError);

// Salva configurações ao clicar no botão
document.querySelector("#save-button").addEventListener("click", storeSettings);

// Atualiza aviso ao mudar checkbox
document.querySelector("#currentTabOnly").addEventListener("change", () => {
  toggleCurrentTabOnlyWarning();
  enforceCurrentTabOnlySelection();
});
