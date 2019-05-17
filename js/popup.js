let bubly_btn;
let save_btn;
let status_message;
let include_small_checkbox;
/* signal content script to start Bub.ly */
function start_bubly()
{
    status_message.innerHTML = "Status: Bub.ly starting...";
    let setting_values = 
    {
        include_small_imgs: include_small_checkbox.checked
    }
    let message = {start_bubly: true, save_data: false, settings: setting_values};
    let callback = function (response) {
        //alert(response.status);
        status_message.innerHTML = `Status: ${response.status}`;
    }
    send_message(message, callback);
}
/* signal content script to save Bub.ly data */
function save_data()
{
    status_message.innerHTML = "Status: Bub.ly saving..."
    let setting_values = 
    {
        include_small_imgs: include_small_checkbox.checked
    }
    let message = {start_bubly: false, save_data: true, settings: setting_values};
    let callback = function (response) {
        //alert(response.status);
        status_message.innerHTML = `Status: ${response.status}`;
    }
    send_message(message, callback);
}

/* send message to active tab script(s) */
function send_message(message, callback)
{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, callback);
    });
}

/* add event listeners after webpage finishes loading */
document.addEventListener("DOMContentLoaded", function() {
    bubly_btn = document.getElementById("bubly-btn");
    save_btn = document.getElementById("save-btn");
    status_message = document.getElementById("status");
    include_small_checkbox = document.getElementById("include-small-imgs");
    bubly_btn.addEventListener("click", start_bubly);
    save_btn.addEventListener("click", save_data);
});