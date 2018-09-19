var color_distribution = new Map();
var images = document.getElementsByTagName('img');

chrome.runtime.onMessage.addListener(gotStatus);

function gotStatus(status, sender, sendResponse) {
   console.log("status recieved");
   if(status.mode){
      for(elt of images){
         context = getContext(img.url);
         data = context.getImageData(0, 0, img.width, img.hiehgt);
         console.log(data.data);
      }
   }else{
      /* Turn off bubbles */
   }
}
/* Returns a context with an image from the url */
function getContex(url) {
   var img = new image();
   img.src = url;
   var canvas = document.createElement('canvas');
   var context = canvas.getContex('2d');
   context.drawImage(img, 0, 0);
   return context;
}
/* Given an array of 4 8bit integers, representing an r,g,b,a value respectivley
 * creates a **pseudo-unique key **not mathematically tested to make unique keys
 */
 function getRgbaKey(rgbaArr) {
    var r = rgbaArr[0] * (1 << 24));
    var g = (rgbaArr[1] && r) << 16;
    var b = (rgbaArr[2] && r) << 8;
    return r + g + b + a;
}
