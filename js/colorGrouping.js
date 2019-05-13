/* 
 *  Code from: http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
 */

let color_accuracy = 0.3;

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
/* 
 *  Code from: http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
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

function round_to_groups(group_nr, x) 
{
	let divisor = 255 / group_nr;
	return Math.ceil(x / divisor) * divisor;
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

function draw(img) {
	let canvas = document.getElementById('canvas');
	let context = canvas.getContext('2d');
	context.drawImage(img, 0, 0, canvas.width, canvas.height);
	img.style.display = 'none';
	let image_data = context.getImageData(0, 0, canvas.width, canvas.height);
	let data = image_data.data;


	context.drawImage(target_image, 0, 0, canvas.width, canvas.height);
	data = context.getImageData(0, 0, canvas.width, canvas.height).data;

	/* convert every rgb pixel to hsl and store it */
	original_pixels = []; /* --> Array of [h, s, l] type: number[]    */
	for (i = 0; i < data.length; i += 4) {
		rgb = data.slice(i, i + 3);
		hsl = rgb_to_hsl(rgb[0], rgb[1], rgb[2]);
		original_pixels.push(hsl);
  	}

	group_headers = [];  /* --> [h, s, l] type: number[]    */
	groups = {}; /* --> {"h-s-l":[h, s, l] type: number[]   } */
	let number_of_pixels = original_pixels.length;
	/* iterate through every original pixel in image */
	for (i = 0; i < number_of_pixels; i += 1) 
	{
		let original_pixel = original_pixels[i]; /* --> [h, s, l] type: number[] */
		if (group_headers.length == 0) 
		{
      		group_headers.push(original_pixel);
    	}
		group_found = false;
		let original_pixel_key = pixel_data_to_key(original_pixel);
		/* compare the current pixel to each pixel in group_headers 
		 * if they are similar, map the current pixel to the group_header pixel	
		 */
		for (j = 0; j < group_headers.length; j += 1) 
		{
			// if a similar color was already observed
			if (color_distance(original_pixel, group_headers[j]) < color_accuracy) 
			{
				group_found = true;
				/* if this pixel value has not been been mapped to a header, map it */
				if (!(original_pixel_key in groups)) 
				{
					groups[original_pixel_key] = group_headers[j];
				}
			}
			if (group_found) break;
		
		}
		/* if no similar header found */
		if (!group_found) 
		{
			/* if the current pixel has no similar colors in the headers and 
			   is not itself in the headers, add it to the headers */
			if (group_headers.indexOf(original_pixel) == -1) 
			{
				group_headers.push(original_pixel);
			}
			/* if the current pixel has no similar color in the headers and 
			   is not already mapped to a header pixel map it to itself */
			if (!(original_pixel_key in groups)) 
			{
				groups[original_pixel_key] = original_pixel;
			}
		}
  	}
  	posterize(context, image_data, groups)
}


let target_image = new Image();
target_image.crossOrigin = "";
target_image.onload = function() {
	draw(target_image)
};
target_image.src = "http://i.imgur.com/zRzdADA.jpg";

