let bubly_btn, img_url,
	status_message, threshold, render_limit,
	warning_message, threshold_message, render_message,
	show_warning_btn, show_threshld_help_btn, show_render_help_btn;
let running = false;

/* signal content script to start Bub.ly */
async function start_bubly() {
	config = {
		url: img_url.value.trim(),
		threshold: Number(threshold.value),
		render_limit: Number(render_limit.value)
	}

	let running_promise = new Promise((resolve, reject) => {
		chrome.storage.sync.get(['running_key'], function (result) {
			console.log(`Running key -> ${result.running_key}`);
			running = result.running_key;
			resolve(running);
		})
	});

	running_promise.then(running => {
		let message = { 
			stop_bubly: running, 
			config: config 
		};
		console.log(message);

		status_message.innerHTML = running ? "Status: Bub.ly stopping..." : "Status: Bub.ly running...";

		let callback = function (response) { }
		send_message(message, callback);
		
		chrome.storage.sync.set({ 'running_key': !(running) }, function () {
			console.log('Running set to ' + !(running));
		});
	});
}
/* send message to active tab script(s) */
function send_message(message, callback) {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, message, callback);
	});
}
/* add event listeners after webpage finishes loading */
document.addEventListener("DOMContentLoaded", function () {
	bubly_btn = document.getElementById("bubly-btn");
	[show_warning_btn, show_threshld_help_btn, show_render_help_btn] =
		[...document.getElementsByClassName("show-msg-btn")];
	[warning_message, threshold_message, render_message] =
		[...document.getElementsByClassName("opening-msg")];
	img_url = document.getElementById("img-url");
	status_message = document.getElementById("status");
	threshold = document.getElementById("threshold");
	render_limit = document.getElementById("render-limit");
	bubly_btn.addEventListener("click", start_bubly);

	show_warning_btn.onmouseover = function () {
		show_warning_btn.src = "../images/warning_icon_after.png";
		warning_message.className = "opening-msg open";
	}
	show_warning_btn.onmouseout = function () {
		show_warning_btn.src = "../images/warning_icon_before.png";
		warning_message.className = "opening-msg";
	}

	show_threshld_help_btn.onmouseover = function () {
		show_threshld_help_btn.src = "../images/question_icon_after.png";
		threshold_message.className = "opening-msg open";
	}
	show_threshld_help_btn.onmouseout = function () {
		show_threshld_help_btn.src = "../images/question_icon_before.png";
		threshold_message.className = "opening-msg";
	}

	show_render_help_btn.onmouseover = function () {
		show_render_help_btn.src = "../images/question_icon_after.png";
		render_message.className = "opening-msg open";
	}
	show_render_help_btn.onmouseout = function () {
		show_render_help_btn.src = "../images/question_icon_before.png";
		render_message.className = "opening-msg";
	}

});
