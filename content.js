console.log("content loaded");
var color_distribution = {};

let images = document.getElementsByTagName('img');
for(img of images) {

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
