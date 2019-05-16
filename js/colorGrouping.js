/* 
 *  Code from: http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
 *	read more about color conversion math here: http://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
 */
function hsl_to_rgb(h, s, l) 
{
	let r, g, b; 
    if (s == 0) 
    {
    	r = g = b = l; // achromatic
    } 
	else 
    {
    	let hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }
        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
function rgb_to_hsl(r, g, b) 
{
    r /= 255, g /= 255, b /= 255;
    let max = Math.max(r, g, b), 
        min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max == min) h = s = 0; // achromatic
    else 
    {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) 
        {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    return [h, s, l];
  }
/* 
 *  Code from: http://stackoverflow.com/a/13587077/1204332
 */
function color_distance(v1, v2) 
{
	let i,
	d = 0;

	for (i = 0; i < v1.length; i++) 
	{
		d += (v1[i] - v2[i]) * (v1[i] - v2[i]);
	}
	return Math.sqrt(d);
};

function pixel_data_to_key(pixel_data) 
{
	return pixel_data[0].toString() + '-' + pixel_data[1].toString() + '-' + pixel_data[2].toString();
}

/***********************************************************************************************************/

function posterize(context, image_data, palette) 
{
	for (let i = 0; i < image_data.data.length; i += 4) 
	{
    	rgb = image_data.data.slice(i, i + 3);
    	hsl = rgb_to_hsl(rgb[0], rgb[1], rgb[2]);
    	key = pixel_data_to_key(hsl);
		if (key in palette) 
		{
      		new_hsl = palette[key];
			new_rgb = hsl_to_rgb(new_hsl[0], new_hsl[1], new_hsl[2]);
			rgb = hsl_to_rgb(hsl);
			image_data.data[i] = new_rgb[0];
			image_data.data[i + 1] = new_rgb[1];
			image_data.data[i + 2] = new_rgb[2];
    	}
  	}
  	context.putImageData(image_data, 0, 0);
}

function get_img_data(url) 
{
   let img = document.createElement("img");
   image.crossOrigin = "Anonymous";
   img.src = url;
   let canvas = document.createElement('canvas');
   let context = canvas.getContext('2d');
   context.drawImage(img, 0, 0);
   /* Due to browser security measures, some images will always cause errors, no fix */
   try
   {
	  let img_data = context.getImageData(0, 0, canvas.width, canvas.height);
	  return img_data.data;
   }
   catch(e)
   {
      console.log(e.message);
   }
}

let group_threshold = 1;
function set_group_threshold(threshold)
{
	group_threshold = threshold;
}
let group_headers = [];  /* --> [h, s, l] type: number[]    */
let hpixel_color_count = {};
/**
 * Function derived from: https://jsfiddle.net/ivanchaer/z0ohzghs/
 * @param {*} url 
 */
function get_color_distribution(url) 
{
	let data = get_img_data(url); //[R,B,G,A,R,B,G,A]
	console.log(data);
	/* convert every rgb pixel to hsl and store it */
	let original_pixels = []; /* --> Array of [h, s, l] type: number[]    */
	for (i = 0; i < data.length; i += 8) {
		let rgb = data.slice(i, i + 3);
		let hsl = rgb_to_hsl(rgb[0], rgb[1], rgb[2]);
		original_pixels.push(hsl);
		rgb = data.slice(i + 4, i + 7);
		hsl = rgb_to_hsl(rgb[0], rgb[1], rgb[2]);
		original_pixels.push(hsl);
  	}
	
	let number_of_pixels = original_pixels.length;
	let original_pixel_key;
	let original_pixel;
	/* iterate through every original pixel in image */
	for (i = 0; i < number_of_pixels; i += 1) 
	{
		original_pixel = original_pixels[i]; /* --> [h, s, l] type: number[] */
		if (group_headers.length == 0) 
		{
      		group_headers.push(original_pixel);
    	}
		group_found = false;
		original_pixel_key = pixel_data_to_key(original_pixel);
		/* compare the current pixel to each pixel in group_headers 
		 * if they are similar, map the current pixel to the group_header pixel	
		 */
		for (j = 0; j < group_headers.length; j += 1) 
		{
			header_pixel_key = pixel_data_to_key(group_headers[j]);
			// if a similar color was already observed
			if (color_distance(original_pixel, group_headers[j]) < group_threshold) 
			{
				group_found = true;
				if (header_pixel_key in hpixel_color_count) hpixel_color_count[header_pixel_key] += 1;
				else hpixel_color_count[header_pixel_key] = 1;
			}
			if (group_found) break;
		
		}
		/* if no similar header found */
		if (!group_found) 
		{
			if (original_pixel_key in hpixel_color_count) hpixel_color_count[original_pixel_key] += 1;
			else hpixel_color_count[original_pixel_key] = 1;
			/* if the current pixel has no similar colors in the headers and 
			   is not itself in the headers, add it to the headers */
			if (group_headers.indexOf(original_pixel) == -1) group_headers.push(original_pixel);
			
		}
  	}
}

