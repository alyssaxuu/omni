// Workaround to capture Esc key on certain sites
var isOpen = false;
document.onkeyup = (e) => {
	if (e.key == "Escape" && isOpen) {
		chrome.runtime.sendMessage({request:"close-omni"})
	}
}

$(document).ready(() => {
	var actions = [];
	var isFiltered = false;

	// Append the omni into the current page
	$.get(chrome.runtime.getURL('/content.html'), (data) => {
		$(data).appendTo('body');

		// Get checkmark image for toast
		$("#omni-extension-toast img").attr("src", chrome.runtime.getURL("assets/check.svg"));

		// Request actions from the background
		chrome.runtime.sendMessage({request:"get-actions"}, (response) => {
			actions = response.actions;
		});

		// New tab page workaround
		if (window.location.href == "chrome-extension://mpanekjjajcabgnlbabmopeenljeoggm/newtab.html") {
			isOpen = true;
			$("#omni-extension").removeClass("omni-closing");
			window.setTimeout(() => {
				$("#omni-extension input").focus();
			}, 100);
		}
	});

	function renderAction(action, index, keys, img) {
		var skip = "";
		if (action.action == "search" || action.action == "goto") {
			skip = "style='display:none'";
		}
		if (index != 0) {
			$("#omni-extension #omni-list").append("<div class='omni-item' "+skip+" data-index='"+index+"' data-type='"+action.type+"'>"+img+"<div class='omni-item-details'><div class='omni-item-name'>"+action.title+"</div><div class='omni-item-desc'>"+action.desc+"</div></div>"+keys+"<div class='omni-select'>Select <span class='omni-shortcut'>⏎</span></div></div>");
		} else {
			$("#omni-extension #omni-list").append("<div class='omni-item omni-item-active' "+skip+" data-index='"+index+"' data-type='"+action.type+"'>"+img+"<div class='omni-item-details'><div class='omni-item-name'>"+action.title+"</div><div class='omni-item-desc'>"+action.desc+"</div></div>"+keys+"<div class='omni-select'>Select <span class='omni-shortcut'>⏎</span></div></div>");
		}
		if (!action.emoji) {
			var loadimg = new Image();
			loadimg.src = action.favIconUrl;

			// Favicon doesn't load, use a fallback
			loadimg.onerror = () => {
				$(".omni-item[data-index='"+index+"'] img").attr("src", chrome.runtime.getURL("/assets/globe.svg"));
			}
		}
	}

	// Add actions to the omni
	function populateOmni() {
		$("#omni-extension #omni-list").html("");
		actions.forEach((action, index) => {
			var keys = "";
			if (action.keycheck) {
					keys = "<div class='omni-keys'>";
					action.keys.forEach(function(key){
						keys += "<span class='omni-shortcut'>"+key+"</span>";
					});
					keys += "</div>";
			}
			
			// Check if the action has an emoji or a favicon
			if (!action.emoji) {
				var onload = 'if ("naturalHeight" in this) {if (this.naturalHeight + this.naturalWidth === 0) {this.onerror();return;}} else if (this.width + this.height == 0) {this.onerror();return;}';
				var img = "<img src='"+action.favIconUrl+"' alt='favicon' onload='"+onload+"' onerror='this.src=&quot;"+chrome.runtime.getURL("/assets/globe.svg")+"&quot;' class='omni-icon'>";
				renderAction(action, index, keys, img);
			} else {
				var img = "<span class='omni-emoji-action'>"+action.emojiChar+"</span>";
				renderAction(action, index, keys, img);
			}
		})
		$(".omni-extension #omni-results").html(actions.length+" results");
	}

	// Add filtered actions to the omni
	function populateOmniFilter(actions) {
		isFiltered = true;
		$("#omni-extension #omni-list").html("");
		actions.forEach((action, index) => {
			var keys = "";
			if (action.keycheck) {
					keys = "<div class='omni-keys'>";
					action.keys.forEach(function(key){
						keys += "<span class='omni-shortcut'>"+key+"</span>";
					});
					keys += "</div>";
			}
			var img = "<img src='"+action.favIconUrl+"' alt='favicon' onerror='this.src=&quot;"+chrome.runtime.getURL("/assets/globe.svg")+"&quot;' class='omni-icon'>";
			if (action.emoji) {
				img = "<span class='omni-emoji-action'>"+action.emojiChar+"</span>"
			}
			if (index != 0) {
				$("#omni-extension #omni-list").append("<div class='omni-item' data-index='"+index+"' data-type='"+action.type+"' data-url='"+action.url+"'>"+img+"<div class='omni-item-details'><div class='omni-item-name'>"+action.title+"</div><div class='omni-item-desc'>"+action.url+"</div></div>"+keys+"<div class='omni-select'>Select <span class='omni-shortcut'>⏎</span></div></div>");
			} else {
				$("#omni-extension #omni-list").append("<div class='omni-item omni-item-active' data-index='"+index+"' data-type='"+action.type+"' data-url='"+action.url+"'>"+img+"<div class='omni-item-details'><div class='omni-item-name'>"+action.title+"</div><div class='omni-item-desc'>"+action.url+"</div></div>"+keys+"<div class='omni-select'>Select <span class='omni-shortcut'>⏎</span></div></div>");
			}
		})
		$(".omni-extension #omni-results").html(actions.length+" results");
	}

	// Open the omni
	function openOmni() {
		chrome.runtime.sendMessage({request:"get-actions"}, (response) => {
			isOpen = true;
			actions = response.actions;
			$("#omni-extension input").val("");
			populateOmni();
			$("html, body").stop();
			$("#omni-extension").removeClass("omni-closing");
			window.setTimeout(() => {
				$("#omni-extension input").focus();
				focusLock.on($("#omni-extension input").get(0));
				$("#omni-extension input").focus();
			}, 100);
		});
	}

	// Close the omni
	function closeOmni() {
		if (window.location.href == "chrome-extension://mpanekjjajcabgnlbabmopeenljeoggm/newtab.html") {
			chrome.runtime.sendMessage({request:"restore-new-tab"});
		} else {
			isOpen = false;
			$("#omni-extension").addClass("omni-closing");
		}
	}

	// Hover over an action in the omni
	function hoverItem() {
		$(".omni-item-active").removeClass("omni-item-active");
		$(this).addClass("omni-item-active");
	}

	// Show a toast when an action has been performed
	function showToast(action) {
		$("#omni-extension-toast span").html('"'+action.title+'" has been successfully performed');
		$("#omni-extension-toast").addClass("omni-show-toast");
		setTimeout(() => {
			$(".omni-show-toast").removeClass("omni-show-toast");
		}, 3000)
	}

	// Autocomplete commands. Since they all start with different letters, it can be the default behavior
	function checkShortHand(e, value) {
		var el = $(".omni-extension input");
		if (e.keyCode != 8) {
			if (value == "/t") {
				el.val("/tabs ")
			} else if (value == "/b") {
				el.val("/bookmarks ")
			} else if (value == "/h") {
				el.val("/history ");
			} else if (value == "/r") {
				el.val("/remove ");
			} else if (value == "/a") {
				el.val("/actions ");
			}
		} else {
			if (value == "/tabs" || value == "/bookmarks" || value == "/actions" || value == "/remove" || value == "/history") {
				el.val("");
			}
		}
	}

	// Add protocol
	function addhttp(url) {
			if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
					url = "http://" + url;
			}
			return url;
	}

	// Check if valid url
	function validURL(str) {
		var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
			'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
			'((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
			'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
			'(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
			'(\\#[-a-z\\d_]*)?$','i'); // fragment locator
		return !!pattern.test(str);
	}

	// Search for an action in the omni
	function search(e) {
		if (e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40 || e.keyCode == 13 || e.keyCode == 37) {
			return;
		}
		var value = $(this).val().toLowerCase();
		checkShortHand(e, value);
		value = $(this).val().toLowerCase();
		if (value.startsWith("/history")) {
			$(".omni-item[data-index='"+actions.findIndex(x => x.action == "search")+"']").hide();
			$(".omni-item[data-index='"+actions.findIndex(x => x.action == "goto")+"']").hide();
			var tempvalue = value.replace("/history ", "");
			var query = "";
			if (tempvalue != "/history") {
				query = value.replace("/history ", "");
			}
			chrome.runtime.sendMessage({request:"search-history", query:query}, (response) => {
				populateOmniFilter(response.history);
			});
		} else if (value.startsWith("/bookmarks")) {
			$(".omni-item[data-index='"+actions.findIndex(x => x.action == "search")+"']").hide();
			$(".omni-item[data-index='"+actions.findIndex(x => x.action == "goto")+"']").hide();
			var tempvalue = value.replace("/bookmarks ", "");
			if (tempvalue != "/bookmarks" && tempvalue != "") {
				var query = value.replace("/bookmarks ", "");
				chrome.runtime.sendMessage({request:"search-bookmarks", query:query}, (response) => {
					populateOmniFilter(response.bookmarks);
				});
			} else {
				populateOmniFilter(actions.filter(x => x.type == "bookmark"));
			}
		} else {
			if (isFiltered) {
				populateOmni();
				isFiltered = false;
			}
			$(".omni-extension #omni-list .omni-item").filter(function(){
				if (value.startsWith("/tabs")) {
					$(".omni-item[data-index='"+actions.findIndex(x => x.action == "search")+"']").hide();
					$(".omni-item[data-index='"+actions.findIndex(x => x.action == "goto")+"']").hide();
					var tempvalue = value.replace("/tabs ", "");
					if (tempvalue == "/tabs") {
						$(this).toggle($(this).attr("data-type") == "tab");
					} else {
						tempvalue = value.replace("/tabs ", "");
						$(this).toggle(($(this).find(".omni-item-name").text().toLowerCase().indexOf(tempvalue) > -1 || $(this).find(".omni-item-desc").text().toLowerCase().indexOf(tempvalue) > -1) && $(this).attr("data-type") == "tab");
					}
				} else if (value.startsWith("/remove")) {
					$(".omni-item[data-index='"+actions.findIndex(x => x.action == "search")+"']").hide();
					$(".omni-item[data-index='"+actions.findIndex(x => x.action == "goto")+"']").hide();
					var tempvalue = value.replace("/remove ", "")
					if (tempvalue == "/remove") {
						$(this).toggle($(this).attr("data-type") == "bookmark" || $(this).attr("data-type") == "tab");
					} else {
						tempvalue = value.replace("/remove ", "");
						$(this).toggle(($(this).find(".omni-item-name").text().toLowerCase().indexOf(tempvalue) > -1 || $(this).find(".omni-item-desc").text().toLowerCase().indexOf(tempvalue) > -1) && ($(this).attr("data-type") == "bookmark" || $(this).attr("data-type") == "tab"));
					}
				} else if (value.startsWith("/actions")) {
					$(".omni-item[data-index='"+actions.findIndex(x => x.action == "search")+"']").hide();
					$(".omni-item[data-index='"+actions.findIndex(x => x.action == "goto")+"']").hide();
					var tempvalue = value.replace("/actions ", "")
					if (tempvalue == "/actions") {
						$(this).toggle($(this).attr("data-type") == "action");
					} else {
						tempvalue = value.replace("/actions ", "");
						$(this).toggle(($(this).find(".omni-item-name").text().toLowerCase().indexOf(tempvalue) > -1 || $(this).find(".omni-item-desc").text().toLowerCase().indexOf(tempvalue) > -1) && $(this).attr("data-type") == "action");
					}
				} else {
					$(this).toggle($(this).find(".omni-item-name").text().toLowerCase().indexOf(value) > -1 || $(this).find(".omni-item-desc").text().toLowerCase().indexOf(value) > -1);
					if (value == "") {
						$(".omni-item[data-index='"+actions.findIndex(x => x.action == "search")+"']").hide();
						$(".omni-item[data-index='"+actions.findIndex(x => x.action == "goto")+"']").hide();
					} else if (!validURL(value)) {
						$(".omni-item[data-index='"+actions.findIndex(x => x.action == "search")+"']").show();
						$(".omni-item[data-index='"+actions.findIndex(x => x.action == "goto")+"']").hide();
						$(".omni-item[data-index='"+actions.findIndex(x => x.action == "search")+"'] .omni-item-name").html('\"'+value+'\"');
					} else {
						$(".omni-item[data-index='"+actions.findIndex(x => x.action == "search")+"']").hide();
						$(".omni-item[data-index='"+actions.findIndex(x => x.action == "goto")+"']").show();
						$(".omni-item[data-index='"+actions.findIndex(x => x.action == "goto")+"'] .omni-item-name").html(value);
					}
				}
			});
		}
		
		$(".omni-extension #omni-results").html($("#omni-extension #omni-list .omni-item:visible").length+" results");
		$(".omni-item-active").removeClass("omni-item-active");
		$(".omni-extension #omni-list .omni-item:visible").first().addClass("omni-item-active");
	}

	// Handle actions from the omni
	function handleAction(e) {
		var action = actions[$(".omni-item-active").attr("data-index")];
		closeOmni();
		if ($(".omni-extension input").val().toLowerCase().startsWith("/remove")) {
			chrome.runtime.sendMessage({request:"remove", type:action.type, action:action});
		} else if ($(".omni-extension input").val().toLowerCase().startsWith("/history")) {
			if (e.ctrlKey || e.metaKey) {
				window.open($(".omni-item-active").attr("data-url"));
			} else {
				window.open($(".omni-item-active").attr("data-url"), "_self");
			}
		} else if ($(".omni-extension input").val().toLowerCase().startsWith("/bookmarks")) {
			if (e.ctrlKey || e.metaKey) {
				window.open($(".omni-item-active").attr("data-url"));
			} else {
				window.open($(".omni-item-active").attr("data-url"), "_self");
			}
		} else {
			chrome.runtime.sendMessage({request:action.action, tab:action, query:$(".omni-extension input").val()});
			switch (action.action) {
				case "bookmark":
					if (e.ctrlKey || e.metaKey) {
						window.open(action.url);
					} else {
						window.open(action.url, "_self");
					}
					break;
				case "scroll-bottom":
					window.scrollTo(0,document.body.scrollHeight);
					showToast(action);
					break;
				case "scroll-top":
					window.scrollTo(0,0);
					break;
				case "navigation":
					if (e.ctrlKey || e.metaKey) {
						window.open(action.url);
					} else {
						window.open(action.url, "_self");
					}
					break;
				case "fullscreen":
					var elem = document.documentElement;
					elem.requestFullscreen();
					break;
				case "new-tab":
					window.open("");
					break;
				case "email":
					window.open("mailto:");
					break;
				case "url":
					if (e.ctrlKey || e.metaKey) {
						window.open(action.url);
					} else {
						window.open(action.url, "_self");
					}
					break;
				case "goto":
					if (e.ctrlKey || e.metaKey) {
						window.open(addhttp($(".omni-extension input").val()));
					} else {
						window.open(addhttp($(".omni-extension input").val()), "_self");
					}
					break;
				case "print":
					window.print();
					break;
				case "remove-all":
				case "remove-history":
				case "remove-cookies":
				case "remove-cache":
				case "remove-local-storage":
				case "remove-passwords":
					showToast(action);
					break;
			}
		}

		// Fetch actions again
		chrome.runtime.sendMessage({request:"get-actions"}, (response) => {
			actions = response.actions;
			populateOmni();
		});
	}

	// Customize the shortcut to open the Omni box
	function openShortcuts() {
		chrome.runtime.sendMessage({request:"extensions/shortcuts"});
	}


	// Check which keys are down
	var down = [];

	$(document).keydown((e) => {
		down[e.keyCode] = true;
		if (down[38]) {
			// Up key
			if ($(".omni-item-active").prevAll("div").not(":hidden").first().length) {
				var previous = $(".omni-item-active").prevAll("div").not(":hidden").first();
				$(".omni-item-active").removeClass("omni-item-active");
				previous.addClass("omni-item-active");
				previous[0].scrollIntoView({block:"nearest", inline:"nearest"});
			}
		} else if (down[40]) {
			// Down key
			if ($(".omni-item-active").nextAll("div").not(":hidden").first().length) {
				var next = $(".omni-item-active").nextAll("div").not(":hidden").first();
				$(".omni-item-active").removeClass("omni-item-active");
				next.addClass("omni-item-active");
				next[0].scrollIntoView({block:"nearest", inline:"nearest"});
			}
		} else if (down[27] && isOpen) {
			// Esc key
			closeOmni();
		} else if (down[13] && isOpen) {
			// Enter key
			handleAction(e);
		}
	}).keyup((e) => {
		if (down[18] && down[16] && down[80]) {
			if (actions.find(x => x.action == "pin") != undefined) {
				chrome.runtime.sendMessage({request:"pin-tab"});
			} else {
				chrome.runtime.sendMessage({request:"unpin-tab"});
			}
			chrome.runtime.sendMessage({request:"get-actions"}, (response) => {
				actions = response.actions;
				populateOmni();
			});
		} else if (down[18] && down[16] && down[77]) {
			if (actions.find(x => x.action == "mute") != undefined) {
				chrome.runtime.sendMessage({request:"mute-tab"});
			} else {
				chrome.runtime.sendMessage({request:"unmute-tab"});
			}
			chrome.runtime.sendMessage({request:"get-actions"}, (response) => {
				actions = response.actions;
				populateOmni();
			});
		} else if (down[18] && down[16] && down[67]) {
			window.open("mailto:");
		}

		down = [];
	});

	// Recieve messages from background
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.request == "open-omni") {
			if (isOpen) {
				closeOmni();
			} else {
				openOmni();
			}
		} else if (message.request == "close-omni") {
			closeOmni();
		}
	});

	$(document).on("click", "#open-page-omni-extension-thing", openShortcuts);
	$(document).on("mouseover", ".omni-extension .omni-item:not(.omni-item-active)", hoverItem);
	$(document).on("keyup", ".omni-extension input", search);
	$(document).on("click", ".omni-item-active", handleAction);
	$(document).on("click", ".omni-extension #omni-overlay", closeOmni);
});
