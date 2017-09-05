function clearCache() {
	browser.browsingData.removeCache({}).then(onRemoved, onError);
}

function onRemoved() {
	console.log("cleared");
}

function onError(error) {
  console.error(error);
}

browser.browserAction.onClicked.addListener(clearCache);