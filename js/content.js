let color_distribution = new Map();
let images = [...document.getElementsByTagName('img')];
start_bubly();

function start_bubly() 
{
   forAsync(images, (img, idx) => {
      return new Promise(resolve => {
         console.log(`processing image#${idx}`);
         if(img.height > 100 && img.width > 100) {
            let img_data = get_img_data(img.src);
            process_img_data(img_data);
         }
         resolve();
      })
   });
}

function process_img_data(img_data) {
   for (let i = 0; i < img_data.data.length; i += 4) {
      let rgba = [img_data.data[i + 0], img_data.data[i + 1], img_data.data[i + 2], img_data.data[i + 3]];
      let rgba_key = gen_rgba_key(rgba);
      if(color_distribution.has(rgba_key)) color_distribution.set(rgba_key, color_distribution.get(rgba_key) + 1);
      else color_distribution.set(rgba_key, 1);
    }
}

/* Returns data of input image */
function get_img_data(url) 
{
   let img = document.createElement("img");
   img.src = url;
   let canvas = document.createElement('canvas');
   let context = canvas.getContext('2d');
   context.drawImage(img, 0, 0);
   return context.getImageData(0, 0, img.width, img.height);
}
/* given an array of 4 8bit integers, representing an r,g,b,a value respectivley
 * creates a string representation in the form "r,g,b,a"
 */
function gen_rgba_key(rgba) 
{
   let r = rgba[0];
   let g = rgba[1];
   let b = rgba[2];
   let a = rgba[3];
   // let r = rgba[0] * (1 << 24);
   // let g = rgba[1] << 16;
   // let b = rgba[2] << 8;
   // return r + g + b + rgba[3];
   return `${r},${g},${b},${a}`;
}

/* Function Author: Stijn de Witt
 * GitHub: https://github.com/Download/for-async
 */
function forAsync(arr, work) {
	function loop(arr, i) {
		return new Promise((resolve, reject) => {
			if (i >= arr.length) {resolve()}
			else try {
				Promise.resolve(work(arr[i], i))
				.then(() => resolve(loop(arr, i+1)))
				.catch(reject);
			} catch(error) {reject(error)}
		})
	}
	return loop(arr, 0);
}
