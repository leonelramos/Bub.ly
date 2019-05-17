/** 
 * Code from: http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
 * Read more about color conversion math here: http://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
 *  
 * Converts hsl pixel values to rgb pixel values
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

/** 
 * Code from: http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
 * Read more about color conversion math here: http://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
 *  
 * Converts rgb pixel values to hsl pixel values
 */
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

/** 
 * Code from: http://stackoverflow.com/a/13587077/1204332
 * 
 * Finds the distance between two hsl pixels (how similar they are)
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

/**
 * Converts a pixel [h, s, l] array to a string in the format "h-s-l"
 * @param {number Array} pixel_data array of three values: h, s and l 
 */
function pixel_data_to_key(pixel_data) 
{
	return pixel_data[0].toString() + '-' + pixel_data[1].toString() + '-' + pixel_data[2].toString();
}

/**
 * converts a pixel key, "h-s-l" or "r-g-b", to a three-array holding the three values
 * @param {string} key pixel data key in the format "h-s-l" or "r-g-b"
 */
function pixel_key_to_data(key)
{
	let [r,g,b] = key.split('-').map(Number);
	return [r, g, b];
}

/* Holds total number of pixels */
let total_pixels = 0;
/**
 * Gets the array where every four items represent the rgba values a pixel
 * in the source image element
 * @param {string} url source of image element
 */
function get_img_data(url) 
{
	let img = document.createElement("img");
	img.src = url;
	let canvas = document.createElement('canvas');
	let context = canvas.getContext('2d');
	context.drawImage(img, 0, 0);
	/* Due to browser security measures, some images will always cause errors, no fix */
	try
	{
		let img_data = context.getImageData(0, 0, canvas.width, canvas.height).data;
		total_pixels += img_data.length;
		return img_data;
	}
	catch(e)
	{
		console.log(e.message);
	}
}

let group_threshold = .3;
/**
 * Sets the threshold from .1 to 1 that indicates how similar two hsl
 * pixels must be in order to be placed under the same color group
 * .1 (very similar) - 1 (similar)
 * Example: with a .1 threshold reds and dark reds would be seprated into
 * two groups but in a 1 threshold they'd be in the same group
 * @param {number} threshold .1 (very similar) - 1 (similar)
 */
function set_group_threshold(threshold)
{
	group_threshold = threshold;
}

let group_headers = [];  /* --> [h, s, l] type: number[]    */
let hpixel_color_count = {};
/**
 * Function derived from: https://jsfiddle.net/ivanchaer/z0ohzghs/
 * Creates a 
 * @param {*} url 
 */
function get_color_distribution(url) 
{
	let data = get_img_data(url);
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
				if (header_pixel_key in hpixel_color_count) hpixel_color_count[header_pixel_key].count++;
				else hpixel_color_count[header_pixel_key] = {count: 1, hsl: group_headers[j]};
				//else hpixel_color_count[header_pixel_key] = {count: 1, rgb: hsl_to_rgb(...group_headers[j])};
			}
			if (group_found) break;
		
		}
		/* if no similar header found */
		if (!group_found) 
		{
			if (original_pixel_key in hpixel_color_count) hpixel_color_count[original_pixel_key].count++;
			else hpixel_color_count[original_pixel_key] = {count: 1, hsl: original_pixel};
			//else hpixel_color_count[original_pixel_key] = {count: 1, rgb: hsl_to_rgb(...original_pixel)};
			/* if the current pixel has no similar colors in the headers and 
			   is not itself in the headers, add it to the headers */
			if (group_headers.indexOf(original_pixel) == -1) group_headers.push(original_pixel);
		}
	}
	return hpixel_color_count;
}

//export {set_color_distribution, set_group_threshold, group_threshold};