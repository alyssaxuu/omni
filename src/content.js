$(document).ready(() => {
	let isOpen = false;
	let actions = [];
	let isFiltered = false;

	// Append the omni into the current page
	$.get(chrome.runtime.getURL('/content.html'), (data) => {
		$(data).appendTo('body');
	});

	// Request actions from the background
	chrome.runtime.sendMessage({request:"get-actions"}, (response) => {
		actions = response.actions;
		populateOmni();
	});

	// Add actions to the omni
	const populateOmni = () => {
		$("#omni-extension #omni-list").html("");
		for (const [action, index] of actions.entries()) {
			let keys = "";
			if (action.keycheck) {
					keys = "<div class='omni-keys'>";
					for (const key of action.keys) {
						keys += "<span class='omni-shortcut'>"+key+"</span>";
					}
					keys += "</div>";
			}
			const onload = 'if ("naturalHeight" in this) {if (this.naturalHeight + this.naturalWidth === 0) {this.onerror();return;}} else if (this.width + this.height === 0) {this.onerror();return;}';
			let img = "<img src='"+action.favIconUrl+"' alt='favicon' onload='"+onload+"' onerror='this.src=&quot;"+chrome.runtime.getURL("/assets/globe.svg")+"&quot;' class='omni-icon'>";
			if (action.emoji) {
				img = "<span class='omni-emoji-action'>"+action.emojiChar+"</span>"
			}
			if (index !== 0) {
				$("#omni-extension #omni-list").append("<div class='omni-item' data-type='"+action.type+"'>"+img+"<div class='omni-item-details'><div class='omni-item-name'>"+action.title+"</div><div class='omni-item-desc'>"+action.desc+"</div></div>"+keys+"<div class='omni-select'>Select <span class='omni-shortcut'>⏎</span></div></div>");
			} else {
				$("#omni-extension #omni-list").append("<div class='omni-item omni-item-active' data-type='"+action.type+"'>"+img+"<div class='omni-item-details'><div class='omni-item-name'>"+action.title+"</div><div class='omni-item-desc'>"+action.desc+"</div></div>"+keys+"<div class='omni-select'>Select <span class='omni-shortcut'>⏎</span></div></div>");
			}
		}
		$(".omni-extension #omni-results").html(actions.length+" results");
	}

	// Add filtered actions to the omni
	const populateOmniFilter = (actions) => {
		isFiltered = true;
		$("#omni-extension #omni-list").html("");
		for (const [action, index] of actions.entries()) {
			let keys = "";
			if (action.keycheck) {
					keys = "<div class='omni-keys'>";
					for (const key of action.keys) {
						keys += "<span class='omni-shortcut'>"+key+"</span>";
					}
					keys += "</div>";
			}
			let img = "<img src='"+action.favIconUrl+"' alt='favicon' onerror='this.src=&quot;"+chrome.runtime.getURL("/assets/globe.svg")+"&quot;' class='omni-icon'>";
			if (action.emoji) {
				img = "<span class='omni-emoji-action'>"+action.emojiChar+"</span>"
			}
			if (index !== 0) {
				$("#omni-extension #omni-list").append("<div class='omni-item' data-type='"+action.type+"' data-url='"+action.url+"'>"+img+"<div class='omni-item-details'><div class='omni-item-name'>"+action.title+"</div><div class='omni-item-desc'>"+action.url+"</div></div>"+keys+"<div class='omni-select'>Select <span class='omni-shortcut'>⏎</span></div></div>");
			} else {
				$("#omni-extension #omni-list").append("<div class='omni-item omni-item-active' data-type='"+action.type+"' data-url='"+action.url+"'>"+img+"<div class='omni-item-details'><div class='omni-item-name'>"+action.title+"</div><div class='omni-item-desc'>"+action.url+"</div></div>"+keys+"<div class='omni-select'>Select <span class='omni-shortcut'>⏎</span></div></div>");
			}
		}
		$(".omni-extension #omni-results").html(actions.length+" results");
	}

	// Open the omni
	const openOmni = () => {
		chrome.runtime.sendMessage({request:"get-actions"}, (response) => {
			isOpen = true;
			actions = response.actions;
			populateOmni();
			$("#omni-extension input").val("");
			$("html, body").stop();
			$("#omni-extension").removeClass("omni-closing");
			window.setTimeout(() => {
				$("#omni-extension input").focus();
			}, 100);
		});
	}

	// Close the omni
	const closeOmni = () => {
		isOpen = false;
		$("#omni-extension").addClass("omni-closing");
	}

	// Hover over an action in the omni
	function hoverItem() {
		$(".omni-item-active").removeClass("omni-item-active");
		$(this).addClass("omni-item-active");
	}

	// Autocomplete commands. Since they all start with different letters, it can be the default behavior
	const checkShortHand = (e, value) => {
		const el = $(".omni-extension input");
		if (e.keyCode !== 8) {
			switch (value) {
				case "/t":
					el.val("/tabs ");
					break;
				case "/b":
					el.val("/bookmarks ");
					break;
				case "/h":
					el.val("/history ");
					break;
				case "/r":
					el.val("/remove ");
					break;
				case "/a":
					el.val("/actions ");
					break;
			}
		} else {
			if (value === "/tabs" || value === "/bookmarks" || value === "/actions" || value === "/remove" || value === "/history") {
				el.val("");
			}
		}
	}

	// Search for an action in the omni
	function search(e) {
		if (e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40 || e.keyCode === 13 || e.keyCode === 37) {
			return;
		}
		let value = $(this).val().toLowerCase();
		checkShortHand(e, value);
		value = $(this).val().toLowerCase();
		if (value.startsWith("/history")) {
			const tempvalue = value.replace("/history ", "");
			let query = "";
			if (tempvalue !== "/history") {
				query = value.replace("/history ", "");
			}
			chrome.runtime.sendMessage({request:"search-history", query:query}, (response) => {
				populateOmniFilter(response.history);
			});
		} else if (value.startsWith("/bookmarks")) {
			const tempvalue = value.replace("/bookmarks ", "");
			if (tempvalue !== "/bookmarks" && tempvalue !== "") {
				const query = value.replace("/bookmarks ", "");
				chrome.runtime.sendMessage({request:"search-bookmarks", query:query}, (response) =>{
					populateOmniFilter(response.bookmarks);
				});
			} else {
				populateOmniFilter(actions.filter(x => x.type === "bookmark"));
			}
		} else {
			if (isFiltered) {
				populateOmni();
				isFiltered = false;
			}
			$("#omni-extension #omni-list .omni-item").filter(function() {
				if (value.startsWith("/tabs")) {
					let tempvalue = value.replace("/tabs ", "");
					if (tempvalue === "/tabs") {
						$(this).toggle($(this).attr("data-type") === "tab");
					} else {
						tempvalue = value.replace("/tabs ", "");
						$(this).toggle(($(this).find(".omni-item-name").text().toLowerCase().indexOf(tempvalue) > -1 || $(this).find(".omni-item-desc").text().toLowerCase().indexOf(tempvalue) > -1) && $(this).attr("data-type") === "tab");
					}
				} else if (value.startsWith("/remove")) {
					let tempvalue = value.replace("/remove ", "")
					if (tempvalue === "/remove") {
						$(this).toggle($(this).attr("data-type") === "bookmark" || $(this).attr("data-type") === "tab");
					} else {
						tempvalue = value.replace("/remove ", "");
						$(this).toggle(($(this).find(".omni-item-name").text().toLowerCase().indexOf(tempvalue) > -1 || $(this).find(".omni-item-desc").text().toLowerCase().indexOf(tempvalue) > -1) && ($(this).attr("data-type") === "bookmark" || $(this).attr("data-type") === "tab"));
					}
				} else if (value.startsWith("/actions")) {
					let tempvalue = value.replace("/actions ", "")
					if (tempvalue === "/actions") {
						$(this).toggle($(this).attr("data-type") === "action");
					} else {
						tempvalue = value.replace("/actions ", "");
						$(this).toggle(($(this).find(".omni-item-name").text().toLowerCase().indexOf(tempvalue) > -1 || $(this).find(".omni-item-desc").text().toLowerCase().indexOf(tempvalue) > -1) && $(this).attr("data-type") === "action");
					}
				} else {
					$(this).toggle($(this).find(".omni-item-name").text().toLowerCase().indexOf(value) > -1 || $(this).find(".omni-item-desc").text().toLowerCase().indexOf(value) > -1);
				}
			});
		}
		$(".omni-extension #omni-results").html($("#omni-extension #omni-list .omni-item:visible").length+" results");
		$(".omni-item-active").removeClass("omni-item-active");
		$(".omni-extension #omni-list .omni-item:visible").first().addClass("omni-item-active");
	}

	// Handle actions from the omni
	const handleAction = (e) => {
		const action = actions.find(x => x.title === $(".omni-item-active .omni-item-name").text());
		closeOmni();
		if ($(".omni-extension input").val().toLowerCase().startsWith("/remove")) {
			chrome.runtime.sendMessage({request:"remove", type:action.type, action:action});
		} else if ($(".omni-extension input").val().toLowerCase().startsWith("/history")) {
			if (e.ctrlKey || e.metaKey) {
				window.open($(".omni-item-active").attr("data-url"), "_self");
			} else {
				window.open($(".omni-item-active").attr("data-url"));
			}
		} else {
			chrome.runtime.sendMessage({request:action.action, tab:action});
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
					break;
				case "scroll-top":
					window.scrollTo(0,0);
					break;
				case "navigation":
					if (e.ctrlKey) {
						window.open(action.url);
					} else {
						window.open(action.url, "_self");
					}
					break;
				case "fullscreen":
					const elem = document.documentElement;
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
			}
		}

		// Fetch actions again
		chrome.runtime.sendMessage({request:"get-actions"}, (response) => {
			actions = response.actions;
			populateOmni();
		});
	}

	// Customize the shortcut to open the Omni box
	const openShortcuts = () => {
		chrome.runtime.sendMessage({request:"extensions/shortcuts"});
	}


	// Check which keys are down
	let down = [];

	$(document).keydown((e) => {
		down[e.keyCode] = true;
		if (down[38]) {
			// Up key
			if ($(".omni-item-active").prevAll("div").not(":hidden").first().length) {
				const previous = $(".omni-item-active").prevAll("div").not(":hidden").first();
				$(".omni-item-active").removeClass("omni-item-active");
				previous.addClass("omni-item-active");
				previous[0].scrollIntoView({block:"nearest", inline:"nearest"});
			}
		} else if (down[40]) {
			// Down key
			if ($(".omni-item-active").nextAll("div").not(":hidden").first().length) {
				const next = $(".omni-item-active").nextAll("div").not(":hidden").first();
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
			if (actions.find(x => x.action === "pin") !== undefined) {
				chrome.runtime.sendMessage({request:"pin-tab"});
			} else {
				chrome.runtime.sendMessage({request:"unpin-tab"});
			}
			chrome.runtime.sendMessage({request:"get-actions"}, (response) => {
				actions = response.actions;
				populateOmni();
			});
		} else if (down[18] && down[16] && down[77]) {
			if (actions.find(x => x.action === "mute") !== undefined) {
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

	// Receive messages from background
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.request === "open-omni") {
			if (isOpen) {
				closeOmni();
			} else {
				openOmni();
			}
		}
	});


	// Events
	$(document).on("click", "#open-page-omni-extension-thing", openShortcuts);
	$(document).on("mouseover", ".omni-extension .omni-item:not(.omni-item-active)", hoverItem);
	$(document).on("keyup", ".omni-extension input", search);
	$(document).on("click", ".omni-item-active", handleAction);
	$(document).on("click", ".omni-extension #omni-overlay", closeOmni);
});
