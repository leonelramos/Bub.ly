var isBubly = false;

chrome.browserAction.onClicked.addListener(buttonClicked);

function buttonClicked (tab) {
   isBubly = !isBubly;
   let status = {
      mode: isBubly
   }
   chrome.tabs.sendMessage(tab.id, status);
}
