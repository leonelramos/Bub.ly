var isBubly = false;

chrome.browserAction.onClicked.addListener(buttonClicked);

function buttonClicked(tab) {
   console.log(tab);
   isBubly = !isBubly;
   let status = {
      mode: isBubly
   }
   console.log(status.mode);
   chrome.tabs.sendMessage(tab.id, status);
}
