
/* Signal content script to start Bub.ly */
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("bubly-btn").addEventListener("click", function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {start_bubly: true, save_data: false}, function(response) {
                
            });
        });
    });
});
/* Signal content script to save Bub.ly results locally */
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("save-btn").addEventListener("click", function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {start_bubly: false, save_data: true}, function(response) {
                
            });
        });
    });
});