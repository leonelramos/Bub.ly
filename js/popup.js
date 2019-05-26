let bubly_btn, img_url, status_message, threshold, render_limit;
/* signal content script to start Bub.ly */
function start_bubly() {
	config = {
		url: img_url.value,
		threshold: Number(threshold.value),
		render_limit: Number(render_limit.value)
	}
	console.log(config);
	let message = { stop_bubly: false, config: config };
	status_message.innerHTML = "Status: Bub.ly starting...";
	let callback = function (response) {

	}
	send_message(message, callback);
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
	img_url = document.getElementById("img-url");
	status_message = document.getElementById("status");
	threshold = document.getElementById("threshold");
	render_limit = document.getElementById("render-limit");
	bubly_btn.addEventListener("click", start_bubly);
});