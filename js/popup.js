let start_bubly = function ()
{
    let message = {start_bubly: true, save_data: false};
    let callback = function (response) {
        alert(response.status);
    }
    send_message(message, callback);
}

let save_data = function ()
{
    let message = {start_bubly: false, save_data: true};
    let callback = function (response) {
        alert(response.status);
    }
    send_message(message, callback);
}

let send_message = function (message, callback)
{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, callback);
    });
}

/* Signal content script to start Bub.ly */
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("bubly-btn").addEventListener("click", start_bubly);
    document.getElementById("save-btn").addEventListener("click", save_data);
});