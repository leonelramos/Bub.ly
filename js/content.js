var color_distribution = new Map();
var images = document.getElementsByTagName('img');

chrome.runtime.onMessage.addListener(gotStatus);

function gotStatus(status, sender, sendResponse) {
   console.log(`status recieved: isBubly -> ${status.mode}`);
   console.log(images.length);
   if(status.mode){
      for(let img of images){
         console.log(img);
         context = imgContext(img.url);
         /* skip undefined or NaN contexts */
         if(context){
            console.log(context);
         }

      }
      console.log("end of images");
   }else{
      /* Turn off bubbles */
   }
}
function processImg(img)
{

}

function storeImgData(imgContext){

}
/* Returns a context with an image from the url */
function imgContext(url) {
   var img = document.createElement("img");
   img.src = url;
   var canvas = document.createElement('canvas');
   var context = canvas.getContext('2d');
   context.drawImage(img, 0, 0);
   return context;
}
/* Given an array of 4 8bit integers, representing an r,g,b,a value respectivley
 * creates a **pseudo-unique key **not mathematically tested to make unique keys
 */
function genRgbaKey(rgba) {
    var r = rgba[0] * (1 << 24);
    var g = rgba[1] << 16;
    var b = rgba[2] << 8;
    return r + g + b + rgba[3];
}
