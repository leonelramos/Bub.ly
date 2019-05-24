/**
 * @author Leonel Ramos
 * NOTICE: Until chrome supports modules in content scripts, this content script will hold all functionality.
 * I have divided the functionality into three sections for clarity and documentation purposes. 
 * 1. Extension Communications: This section interacts with the user interface to start the extension with user inputs.
 * 2. Color Grouping Functions: This section is the main functionality of the extension. It performs all the 
 *    essential computaions and stores the data that is needed for the extension
 * 3. Animation Functions: This section handles creating the animations the user will see based on the 
 *    results of the color grouping section
 */

/************************************** Extension Communication **************************************
 *                                                                                                   *
 *     This section handles communication between the popup interface and all the functionality      *
 *                                                                                                   *
 *****************************************************************************************************/

function got_request(request, sender, sendResponse) {
	console.log(sender.tab ?
		"from a content script:" + sender.tab.url :
		"from the extension");
	if (request.start_bubly) {
		start_bubly(request.config);
		sendResponse({ status: "Bub.ly complete" });
	}
	else if (request.stop_bubly) {
		stop_bubly();
	}
}

function make_test_config(url, threshold, render_limit) {
	return {
		url: url,
		threshold: threshold,
		render_limit: render_limit
	}
}

function start_bubly(config) {
	let [color_distribution, total_pixels] = get_color_distribution(config.url, config.threshold);
	create_floating_bubbles(color_distribution, total_pixels, config.render_limit);
}

function stop_bubly() {
	document.getElementsByClassName('bubble floatUp wobble').forEach(function (node) {
		node.parentNode.removeChild(node);
	});
}

/* Function Author: Stijn de Witt
 * GitHub: https://github.com/Download/for-async
 * Perform loop tasks asynchronously
 * Could be useful when I implement multi-image
 */
function forAsync(arr, work) {
	function loop(arr, i) {
		return new Promise((resolve, reject) => {
			if (i >= arr.length) { resolve() }
			else try {
				Promise.resolve(work(arr[i], i))
					.then(() => resolve(loop(arr, i + 1)))
					.catch(reject);
			} catch (error) { reject(error) }
		})
	}
	return loop(arr, 0);
}

/************************************* Colour Grouping Functions *************************************
 *                                                                                                   *
 *     This section handles the main functionality of the extension. It creates a count of how       *
 *     often certain colors appear in an image                                                       *
 *                                                                                                   *
 *****************************************************************************************************/

/** 
 * Code from: http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
 * Read more about color conversion math here: http://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
 *  
 * Converts hsl pixel values to rgb pixel values
 */
function hsl_to_rgb(h, s, l) {
	let r, g, b;
	if (s == 0) r = g = b = l; // achromatic
	else {
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
function rgb_to_hsl(r, g, b) {
	r /= 255, g /= 255, b /= 255;
	let max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	let h, s, l = (max + min) / 2;

	if (max == min) h = s = 0; // achromatic
	else {
		let d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
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
function color_distance(v1, v2) {
	let i, d = 0;
	for (i = 0; i < v1.length; i++) {
		d += (v1[i] - v2[i]) * (v1[i] - v2[i]);
	}
	return Math.sqrt(d);
};

/**
 * Converts a pixel [h, s, l] array to a string in the format "h-s-l"
 * @param {number Array} pixel_data array of three values: h, s and l 
 */
function pixel_data_to_key(pixel_data) {
	return pixel_data[0].toString() + '-' + pixel_data[1].toString() + '-' + pixel_data[2].toString();
}

/**
 * converts a pixel key, "h-s-l" or "r-g-b", to a three-array holding the three values
 * @param {string} key pixel data key in the format "h-s-l" or "r-g-b"
 */
function pixel_key_to_data(key) {
	let [r, g, b] = key.split('-').map(Number);
	return [r, g, b];
}
/**
 * Gets the array where every four items represent the rgba values a pixel
 * in the source image element
 * @param {string} url source of image element
 */
function get_img_data(url) {
	let img = document.createElement("img");
	img.src = url;
	let canvas = document.createElement('canvas');
	canvas.width = img.width;
	canvas.height = img.height;
	let context = canvas.getContext('2d');
	context.drawImage(img, 0, 0);
	/* Due to browser security measures, some images will always cause errors, no fix */
	try {
		console.log(`width: ${img.width}, height: ${img.height}`)
		let img_data = context.getImageData(0, 0, canvas.width, canvas.height).data;
		let total_pixels = img_data.length;
		console.log(`total pixels: ${total_pixels}`);
		return [img_data, total_pixels];
	}
	catch (e) {
		console.log(e.message);
	}
}

/**
 * Function derived from: https://jsfiddle.net/ivanchaer/z0ohzghs/
 * Creates a mapping where every pixel color is mapped to a "group" where a group 
 * is a color where all other similar colors are mapped to. Color similarity is determined
 * by the group threshold. For example if the group color is Red then the following could 
 * be mapped to it depending on the threshold, dark red, light red and every red shade in between.
 * (the lower the threshold the stricter the similarities must be in order for colors to be placed 
 * in the same group).
 * 
 * The purpose of this mapping is to lessen the sheer amount of colors in an image by
 * grouping colors that are very similar and sometimes indistinguishable. 
 * @param {string} url source of an image DOM element
 * @param {number} threshold .1 (very similar) - 1 (similar)
 */
function get_color_distribution(url, threshold) {
	let group_headers = [];  /* [h, s, l] type: number[] */
	let color_distribution = {}; /* "h-s-l" string : {count number, rgb number array} object */
	let [data, total_pixels] = get_img_data(url);
	console.log(data.length);
	console.log(data);
	/* convert every rgb pixel to hsl and store it */
	let original_pixels = []; /* --> Array of [h, s, l] type: number[]    */
	for (i = 0; i < data.length; i += 4) {
		let rgb = data.slice(i, i + 3);
		let hsl = rgb_to_hsl(rgb[0], rgb[1], rgb[2]);
		original_pixels.push(hsl);
	}

	let number_of_pixels = original_pixels.length;
	let original_pixel_key;
	let original_pixel;
	/* iterate through every original pixel in image */
	for (i = 0; i < number_of_pixels; i++) {
		original_pixel = original_pixels[i]; /* --> [h, s, l] type: number[] */
		if (group_headers.length == 0) group_headers.push(original_pixel);
		group_found = false;
		original_pixel_key = pixel_data_to_key(original_pixel);
		/* compare the current pixel to each pixel in group_headers 
		 * if they are similar, map the current pixel to the group_header pixel	
		 */
		for (j = 0; j < group_headers.length; j += 1) {
			header_pixel_key = pixel_data_to_key(group_headers[j]);
			// if a similar color was already observed
			if (color_distance(original_pixel, group_headers[j]) < threshold) {
				group_found = true;
				if (header_pixel_key in color_distribution) color_distribution[header_pixel_key].count++;
				else color_distribution[header_pixel_key] = { count: 1, rgb: hsl_to_rgb(...group_headers[j]) };
			}
			if (group_found) break;
		}
		/* if no similar header found */
		if (!group_found) {
			if (original_pixel_key in color_distribution) {
				color_distribution[original_pixel_key].count++;
				//if (group_headers.indexOf(original_pixel) == -1) group_headers.push(original_pixel);
			}
			else if (!is_dark_pixel(...original_pixel)) {
				color_distribution[original_pixel_key] = {
					count: 1,
					rgb: hsl_to_rgb(...original_pixel)
				};
				/* if the current pixel has no similar colors in the headers and 
			   is not itself in the headers, add it to the headers */
				if (group_headers.indexOf(original_pixel) == -1) group_headers.push(original_pixel);
			}
		}
	}
	return [color_distribution, total_pixels];
}

function is_dark_pixel(h, s, l) {
	return l < .15 || s < .15;
}

/************************************* Bub.ly Animation Generator ************************************
 *                                                                                                   *
 *     This section handles generating the animations that the user will see using the color         *
 *     groups made by the color grouping section                                                     *
 *                                                                                                   *
 *****************************************************************************************************/

/**
 * Creates a round div for each color in color_distribution and
 * applies the floating animation class to trigger css animation
 * @param {*} color_distribution Mapping where every pixel color is mapped to a similar color "group"
 */
function create_floating_bubbles(color_distribution, total_pixels, render_limit) {
	let new_divs = [];
	let max_bubble_size = 10000;
	let width = window.innerWidth
		|| document.documentElement.clientWidth
		|| document.body.clientWidth;
	let height = window.innerHeight
		|| document.documentElement.clientHeight
		|| document.body.clientHeight;

	Object.keys(color_distribution).forEach(function (key, index) {
		if (index < render_limit) {
			console.log(key);
			let [r, g, b] = color_distribution[key].rgb;
			console.log(`r : ${r}, g : ${g}, b : ${b}`)
			let new_div = document.createElement("div");
			let size = (color_distribution[key].count / total_pixels) * max_bubble_size;
			let css = `position: absolute;
						  	 left: ${getRandomInt(0, width)}px;
						  	 top: ${getRandomInt(0, height)}px;
						  	 width: ${size}px;
						  	 height: ${size}px;
						  	 background-color: rgb(${r},${g},${b});`;
			console.log(css);
			new_div.style.cssText = css;
			new_div.className = "bubble floatUp";
			new_divs[index] = new_div;
			document.body.appendChild(new_div);
			wobble_bubble(new_div);
		}
	});
}

/**
 * Applies a wobble animation to each bubble after the floating animation ends. 
 * @param {*} bubble a DOM div element with an animation applied
 */
function wobble_bubble(bubble) {
	window.addEventListener("animationend", function wobble(event) {
		console.log(`wobble time`);
		let seconds = (Math.random() * 10 + 1) % 6;
		bubble.style.cssText += `animation-delay: ${seconds}s;`;
		bubble.className += " wobble";
		window.removeEventListener("animationend", wobble, false);
	}, false);
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}