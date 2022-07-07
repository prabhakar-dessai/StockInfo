chrome.runtime.onInstalled.addListener(function () {
	chrome.contextMenus.create({
		id: "stockInfo",
		title: "StockInfo",
		contexts: ["selection"],
	});
});

//window.selectionText = " ";

function contextClick(info, tab) {
	const { menuItemId, selectionText } = info;
	if (menuItemId === "stockInfo" && selectionText) {
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			if (message === "get-selection-data") {
				sendResponse(selectionText);
			}
		});
		chrome.tabs.create({
			url: `stockpage.html`,
		});
	}
}

chrome.contextMenus.onClicked.addListener(contextClick);
