console.log("content loaded");

let images = document.getElementsByTagName('img');
// for(elt of images) {
//
// }

chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(message, sender, sendResponse) {
   console.log(message.txt);
}
