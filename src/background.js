var actions = [];

// Clear actions and append default ones
function clearActions() {
	getCurrentTab().then((response) => {
		var isMac = navigator.platform.toUpperCase().indexOf('MAC')>=0;
		var muteaction = {title:"Mute tab", desc:"Mute the current tab", type:"action", action:"mute", emoji:true, emojiChar:"🔇", keycheck:true, keys:['⌥','⇧', 'M']};
		var pinaction = {title:"Pin tab", desc:"Pin the current tab", type:"action", action:"pin", emoji:true, emojiChar:"📌", keycheck:true, keys:['⌥','⇧', 'P']};
		if (response.mutedInfo.muted) {
			muteaction = {title:"Unmute tab", desc:"Unmute the current tab", type:"action", action:"unmute", emoji:true, emojiChar:"🔈", keycheck:true, keys:['⌥','⇧', 'M']};
		}
		if (response.pinned) {
			pinaction = {title:"Unpin tab", desc:"Unpin the current tab", type:"action", action:"unpin", emoji:true, emojiChar:"📌", keycheck:true, keys:['⌥','⇧', 'P']};
		}
		actions = [
			{title:"New tab", desc:"Open a new tab", type:"action", action:"new-tab", emoji:true, emojiChar:"✨", keycheck:true, keys:['⌘','T']},
			{title:"Bookmark", desc:"Create a bookmark", type:"action", action:"create-bookmark", emoji:true, emojiChar:"📕", keycheck:true, keys:['⌘','D']},
			pinaction,
			{title:"Fullscreen", desc:"Make the page fullscreen", type:"action", action:"fullscreen", emoji:true, emojiChar:"🖥", keycheck:true, keys:['⌘', 'Ctrl', 'F']},
			muteaction,
			{title:"Reload", desc:"Reload the page", type:"action", action:"reload", emoji:true, emojiChar:"♻️", keycheck:true, keys:['⌘','⇧', 'R']},
			{title:"Help", desc:"Get help with Omni on GitHub", type:"action", action:"url", url:"https://github.com/alyssaxuu/omni", emoji:true, emojiChar:"🤔", keycheck:false},
			{title:"Compose email", desc:"Compose a new email", type:"action", action:"email", emoji:true, emojiChar:"✉️", keycheck:true, keys:['⌥','⇧', 'C']},
			{title:"New Notion page", desc:"Create a new Notion page", type:"action", action:"url", url:"https://notion.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-notion.png"), keycheck:false},
			{title:"New Sheets spreadsheet", desc:"Create a new Google Sheets spreadsheet", type:"action", action:"url", url:"https://sheets.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-sheets.png"), keycheck:false},
			{title:"New Docs document", desc:"Create a new Google Docs document", type:"action", action:"url", emoji:false, url:"https://docs.new", favIconUrl:chrome.runtime.getURL("assets/logo-docs.png"), keycheck:false},
			{title:"New Slides presentation", desc:"Create a new Google Slides presentation", type:"action", action:"url", url:"https://slides.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-slides.png"), keycheck:false},
			{title:"New form", desc:"Create a new Google Forms form", type:"action", action:"url", url:"https://forms.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-forms.png"), keycheck:false},
			{title:"New Medium story", desc:"Create a new Medium story", type:"action", action:"url", url:"https://story.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-medium.png"), keycheck:false},
			{title:"New GitHub repository", desc:"Create a new GitHub repository", type:"action", action:"url", url:"https://github.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-github.png"), keycheck:false},
			{title:"New GitHub gist", desc:"Create a new GitHub gist", type:"action", action:"url", url:"https://gist.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-github.png"), keycheck:false},
			{title:"New CodePen pen", desc:"Create a new CodePen pen", type:"action", action:"url", url:"https://pen.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-codepen.png"), keycheck:false},
			{title:"New Excel spreadsheet", desc:"Create a new Excel spreadsheet", type:"action", action:"url", url:"https://excel.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-excel.png"), keycheck:false},
			{title:"New PowerPoint presentation", desc:"Create a new PowerPoint presentation", type:"action", url:"https://powerpoint.new", action:"url", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-powerpoint.png"), keycheck:false},
			{title:"New Word document", desc:"Create a new Word document", type:"action", action:"url", url:"https://word.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-word.png"), keycheck:false},
			{title:"Create a whiteboard", desc:"Create a collaborative whiteboard", type:"action", action:"url", url:"https://whiteboard.new", emoji:true, emojiChar:"🧑‍🏫", keycheck:false},
			{title:"Record a video", desc:"Record and edit a video", type:"action", action:"url", url:"https://recording.new", emoji:true, emojiChar:"📹", keycheck:false},
			{title:"Create a Figma file", desc:"Create a new Figma file", type:"action", action:"url", url:"https://figma.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-figma.png"), keycheck:false},
			{title:"Create a FigJam file", desc:"Create a new FigJam file", type:"action", action:"url", url:"https://figjam.new", emoji:true, emojiChar:"🖌", keycheck:false},
			{title:"Hunt a product", desc:"Submit a product to Product Hunt", type:"action", action:"url", url:"https://www.producthunt.com/posts/new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-producthunt.png"), keycheck:false},
			{title:"Make a tweet", desc:"Make a tweet on Twitter", type:"action", action:"url", url:"https://twitter.com/intent/tweet", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-twitter.png"), keycheck:false},
			{title:"Create a playlist", desc:"Create a Spotify playlist", type:"action", action:"url", url:"https://playlist.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-spotify.png"), keycheck:false},
			{title:"Create a Canva design", desc:"Create a new design with Canva", type:"action", action:"url", url:"https://design.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-canva.png"), keycheck:false},
			{title:"Create a new podcast episode", desc:"Create a new podcast episode with Anchor", type:"action", action:"url", url:"https://episode.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-anchor.png"), keycheck:false},
			{title:"Edit an image", desc:"Edit an image with Adobe Photoshop", type:"action", action:"url", url:"https://photo.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-photoshop.png"), keycheck:false},
			{title:"Convert to PDF", desc:"Convert a file to PDF", type:"action", action:"url", url:"https://pdf.new", emoji:true, emojiChar:"📄", keycheck:false},
			{title:"Scan a QR code", desc:"Scan a QR code with your camera", type:"action", action:"url", url:"https://scan.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-qr.png"), keycheck:false},
			{title:"Add a task to Asana", desc:"Create a new task in Asana", type:"action", action:"url", url:"https://task.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-asana.png"), keycheck:false},
			{title:"Add an issue to Linear", desc:"Create a new issue in Linear", type:"action", action:"url", url:"https://linear.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-linear.png"), keycheck:false},
			{title:"Add a task to WIP", desc:"Create a new task in WIP", type:"action", action:"url", url:"https://todo.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-wip.png"), keycheck:false},
			{title:"Create an event", desc:"Add an event to Google Calendar", type:"action", action:"url", url:"https://cal.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-calendar.png"), keycheck:false},
			{title:"Add a note", desc:"Add a note to Google Keep", type:"action", action:"url", emoji:false, url:"https://note.new", favIconUrl:chrome.runtime.getURL("assets/logo-keep.png"), keycheck:false},
			{title:"New meeting", desc:"Start a Google Meet meeting", type:"action", action:"url", emoji:false, url:"https://meet.new", favIconUrl:chrome.runtime.getURL("assets/logo-meet.png"), keycheck:false},
			{title:"Browsing history", desc:"Browse through your browsing history", type:"action", action:"history", emoji:true, emojiChar:"🗂", keycheck:true, keys:['⌘','Y']},
			{title:"Incognito mode", desc:"Open an incognito window", type:"action", action:"incognito", emoji:true, emojiChar:"🕵️", keycheck:true, keys:['⌘','⇧', 'N']},
			{title:"Downloads", desc:"Browse through your downloads", type:"action", action:"downloads", emoji:true, emojiChar:"📦", keycheck:true, keys:['⌘','⇧', 'J']},
			{title:"Extensions", desc:"Manage your Chrome Extensions", type:"action", action:"extensions", emoji:true, emojiChar:"🧩", keycheck:false, keys:['⌘','D']},
			{title:"Chrome settings", desc:"Open the Chrome settings", type:"action", action:"settings", emoji:true, emojiChar:"⚙️", keycheck:true, keys:['⌘',',']},
			{title:"Scroll to bottom", desc:"Scroll to the bottom of the page", type:"action", action:"scroll-bottom", emoji:true, emojiChar:"👇", keycheck:true, keys:['⌘','↓']},
			{title:"Scroll to top", desc:"Scroll to the top of the page", type:"action", action:"scroll-top", emoji:true, emojiChar:"👆", keycheck:true, keys:['⌘','↑']},
			{title:"Go back", desc:"Go back in history for the current tab", type:"action", action:"go-back", emoji:true, emojiChar:"👈",  keycheck:true, keys:['⌘','←']},
			{title:"Go forward", desc:"Go forward in history for the current tab", type:"action", action:"go-forward", emoji:true, emojiChar:"👉", keycheck:true, keys:['⌘','→']},
			{title:"Duplicate tab", desc:"Make a copy of the current tab", type:"action", action:"duplicate-tab", emoji:true, emojiChar:"📋", keycheck:true, keys:['⌥','⇧', 'D']},
			{title:"Close tab", desc:"Close the current tab", type:"action", action:"close-tab", emoji:true, emojiChar:"🗑", keycheck:true, keys:['⌘','W']},
			{title:"Close window", desc:"Close the current window", type:"action", action:"close-window", emoji:true, emojiChar:"💥", keycheck:true, keys:['⌘','⇧', 'W']},
			{title:"Manage browsing data", desc:"Manage your browsing data", type:"action", action:"manage-data", emoji:true, emojiChar:"🔬", keycheck:true, keys:['⌘','⇧', 'Delete']},
			{title:"Clear all browsing data", desc:"Clear all of your browsing data", type:"action", action:"remove-all", emoji:true, emojiChar:"🧹", keycheck:false, keys:['⌘','D']},
			{title:"Clear browsing history", desc:"Clear all of your browsing history", type:"action", action:"remove-history", emoji:true, emojiChar:"🗂", keycheck:false, keys:['⌘','D']},
			{title:"Clear cookies", desc:"Clear all cookies", type:"action", action:"remove-cookies", emoji:true, emojiChar:"🍪", keycheck:false, keys:['⌘','D']},
			{title:"Clear cache", desc:"Clear the cache", type:"action", action:"remove-cache", emoji:true, emojiChar:"🗄", keycheck:false, keys:['⌘','D']},
			{title:"Clear local storage", desc:"Clear the local storage", type:"action", action:"remove-local-storage", emoji:true, emojiChar:"📦", keycheck:false, keys:['⌘','D']},
			{title:"Clear passwords", desc:"Clear all saved passwords", type:"action", action:"remove-passwords", emoji:true, emojiChar:"🔑", keycheck:false, keys:['⌘','D']},
		];
		if (!isMac) {
			actions.forEach(function(action){
				if (action.action == "reload") {
					action.keys = ['F5'];
				} else if (action.action == "fullscreen") {
					action.keys = ['F11'];
				} else if (action.action == "downloads") {
					action.keys = ['Ctrl', 'J'];
				} else if (action.action == "settings") {
					action.keycheck = false;
				} else if (action.action = "history") {
					action.keys = ['Ctrl', 'H'];
				} else if (action.action == "go-back") {
					action.keys = ['Alt','←'];
				} else if (action.action == "go-forward") {
					action.keys = ['Alt','→']
				} else if (action.action == "scroll-top") {
					action.keys = ['Home'];
				} else if (action.action == "scroll-bottom") {
					action.keys = ['End'];
				}
				actions.keys.forEach(function(key){
					if (key == "⌘") {
						key = "Ctrl";
					} else if (key == "⌥") {
						key = "Alt";
					}
				});
			});
		}
	});
}

// Open on install
chrome.runtime.onInstalled.addListener(function (object) {
	// Inject Omni on install
	chrome.manifest = chrome.runtime.getManifest();
	var injectIntoTab = function (tab) {
			var scripts = chrome.manifest.content_scripts[0].js;
			var i = 0, s = scripts.length;
			for( ; i < s; i++ ) {
					chrome.scripting.executeScript({
							target: {tabId: tab.id},
							files: [scripts[i]]
					});
			}
			chrome.scripting.executeScript({
					target: {tabId: tab.id},
					files: [chrome.manifest.content_scripts[0].css[1]]
			});
	}

	// Get all windows
	chrome.windows.getAll({
			populate: true
	}, function (windows) {
			var i = 0, w = windows.length, currentWindow;
			for( ; i < w; i++ ) {
					currentWindow = windows[i];
					var j = 0, t = currentWindow.tabs.length, currentTab;
					for( ; j < t; j++ ) {
							currentTab = currentWindow.tabs[j];
							injectIntoTab(currentTab);
					}
			}
	});

	chrome.tabs.create({url: "https://alyssax.com/omni/"});
});

// Check when the extension button is clicked
chrome.action.onClicked.addListener((tab) => {
	chrome.tabs.sendMessage(tab.id, {request: "open-omni"});  
});

// Listen for the open omni shortcut
chrome.commands.onCommand.addListener((command) => {
	if (command = "open-omni") {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
			chrome.tabs.sendMessage(tabs[0].id, {request: "open-omni"});  
		});
	}
});

// Check if tabs have changed and actions need to be fetched again
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	clearActions();
	getTabs();
	getBookmarks();
});
chrome.tabs.onCreated.addListener(function(tabId, changeInfo, tab) {
	clearActions();
	getTabs();
	getBookmarks();
});
chrome.tabs.onRemoved.addListener(function(tabId, changeInfo, tab) {
	clearActions();
	getTabs();
	getBookmarks();
});

// Get the current tab
async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

// Get tabs to populate in the actions
function getTabs() {
  chrome.tabs.query({}, function(tabs) {
		tabs.forEach(function(tab){
      tab.desc = "Chrome tab";
      tab.keycheck = false;
			tab.action = "switch-tab";
			tab.type = "tab";
    })
		actions = tabs.concat(actions);
  });
}

// Get bookmarks to populate in the actions
function getBookmarks() {
	function process_bookmark(bookmarks) {
		for (var i = 0; i < bookmarks.length; i++) {
			var bookmark = bookmarks[i];
			if (bookmark.url) {
					actions.push({title:bookmark.title, desc:"Bookmark", id:bookmark.id, url:bookmark.url, type:"bookmark", action:"bookmark", emoji:true, emojiChar:"⭐️", keycheck:false})
			}
			if (bookmark.children) {
					process_bookmark(bookmark.children);
			}
		}
	}
	chrome.bookmarks.getTree(process_bookmark);
}

// Lots of different actions
function switchTab(tab) {
	chrome.tabs.highlight({
		tabs: tab.index
	})
}
function goBack(tab) {
	chrome.tabs.goBack({
		tabs: tab.index
	})
}
function goForward(tab){
	chrome.tabs.goForward({
		tabs: tab.index
	})
}
function duplicateTab(tab) {
	getCurrentTab().then((response) => {
		chrome.tabs.duplicate(response.id);
	})
}
function createBookmark(tab) {
	getCurrentTab().then((response) => {
		chrome.bookmarks.create({
			title: response.title,
			url: response.url
		});
	})
}
function muteTab(mute) {
	getCurrentTab().then((response) => {
		chrome.tabs.update(response.id, {"muted": mute})
	});
}
function reloadTab() {
	chrome.tabs.reload();
}
function pinTab(pin) {
	getCurrentTab().then((response) => {
		chrome.tabs.update(response.id, {"pinned": pin})
	});
}
function clearAllData() {
	chrome.browsingData.remove({
		"since": (new Date()).getTime()
	}, {
		"appcache": true,
		"cache": true,
		"cacheStorage": true,
		"cookies": true,
		"downloads": true,
		"fileSystems": true,
		"formData": true,
		"history": true,
		"indexedDB": true,
		"localStorage": true,
		"passwords": true,
		"serviceWorkers": true,
		"webSQL": true
	});
}
function clearBrowsingData() {
	chrome.browsingData.removeHistory({"since": 0});
}
function clearCookies() {
	chrome.browsingData.removeCookies({"since": 0});
}
function clearCache() {
	chrome.browsingData.removeCache({"since": 0});
}
function clearLocalStorage() {
	chrome.browsingData.removeLocalStorage({"since": 0});
}
function clearPasswords() {
	chrome.browsingData.removePasswords({"since": 0});
}
function openChromeUrl(url) {
	chrome.tabs.create({url: 'chrome://'+url+'/'});
}
function openIncognito() {
	chrome.windows.create({"incognito": true});
}
function closeWindow(id) {
	chrome.windows.remove(id);
}
function closeTab(tab) {
	chrome.tabs.remove(tab.id);
}
function removeBookmark(bookmark) {
	chrome.bookmarks.remove(bookmark.id);
}

// Recieve messages from any tab
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.request == "get-actions") {
		clearActions();
		getTabs();
		getBookmarks();
    sendResponse({actions:actions});
  } else if (message.request == "switch-tab") {
		switchTab(message.tab);
	} else if (message.request == "go-back") {
		goBack(message.tab);
	} else if (message.request == "go-forward") {
		goForward(message.tab);
	} else if (message.request == "duplicate-tab") {
		duplicateTab(message.tab);
	} else if (message.request == "create-bookmark") {
		createBookmark(message.tab);
	} else if (message.request == "mute") {
		muteTab(true);
	} else if (message.request == "unmute") {
		muteTab(false);
	} else if (message.request == "reload") {
		reloadTab();
	} else if (message.request == "pin") {
		pinTab(true);
	} else if (message.request == "unpin") {
		pinTab(false);
	} else if (message.request == "remove-all") {
		clearAllData();
	} else if (message.request == "remove-history") {
		clearBrowsingData();
	} else if (message.request == "remove-cookies") {
		clearCookies();
	} else if (message.request == "remove-cache") {
		clearCache();
	} else if (message.request == "remove-local-storage") {
		clearLocalStorage();
	} else if (message.request == "remove-passwords") {
		clearPasswords();
	} else if (message.request == "history" || message.request == "downloads" || message.request == "extensions" || message.request == "settings" || message.request == "extensions/shortcuts") {
		openChromeUrl(message.request);
	} else if (message.request == "manage-data") {
		openChromeUrl("settings/clearBrowserData");
	} else if (message.request == "incognito") {
		openIncognito();
	} else if (message.request == "close-window") {
		closeWindow(sender.tab.windowId);
	} else if (message.request == "search-history") {
		chrome.history.search({text:message.query, maxResults:1000, startTime:31536000000*5}).then(function(data){
			data.forEach(function(action){
				action.type = "history";
				action.emoji = true;
				action.emojiChar = "🏛";
				action.action = "history";
				action.desc = "Browsing history";
			});
			sendResponse({history:data});
		})
		return true;
	} else if (message.request == "remove") {
		if (message.type == "bookmark") {
			removeBookmark(message.action);
		} else {
			closeTab(message.action);
		}
	}
});

// Get actions
clearActions();
getTabs();
getBookmarks();
