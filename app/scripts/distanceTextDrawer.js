// Object that creates a 2D distance texuture image of a given text with any font 
define(['distanceTransformer'], function (DistanceTransformer) {

	var textDrawer = {};

	// Generates a distance map texture with the given text using the given font
	// @param {String} txt
	// @param {String} font
	// @param {String} id
	// @return {Image} image object to use as texture

	textDrawer.drawText = function (txt, font, id) {

		// Clock the execution of the DT
		var time = new Date();
		var start = new Date().getTime();

		var margin = 40;

		// each side should be a power of 2 if the resulting image is to be used as a texture
		var textHeight = 256;
		var textFont = 'bold ' + textHeight + 'px ' + font;

		// DT of text or surroundings?
		var inverted = true;

		// use dummy canvas for creation of Distance map Texture
		var cnv = document.getElementById(id);
		var ctx = cnv.getContext("2d");

		// test how wide the text will be with the current settings
		ctx.font = textFont;
		var tw = ctx.measureText(txt).width + margin; // add some arbitrary margin, not sure why its needed
		var th = textHeight;
		
		// rescale the canvas to have width and height 
		// both to a power of two since this is optimal for use in textures
		var h = textHeight;
		var w = Math.pow(2, Math.ceil(Math.log(tw)/Math.log(2)));
		cnv.height = h;
		cnv.width = w;

		// Update the context before drawing on it
		var ctx = cnv.getContext("2d");

		ctx.font = textFont;
		ctx.textBaseline = 'middle';
		ctx.fillStyle = '#fff';

		// center-align the text
		var wOffset = (w-tw)/2;
		
		ctx.fillText(txt, wOffset, h/2);
		
		// get the 4 channel pixel values of the region with text in it 
		var imgData = ctx.getImageData(0, 0, w, h); 

		var n = imgData.data.length/4;
		
		// initialize the output image object
		// get normalized alpha values 
		var n = imgData.data.length/4;
		var alphaData = new Float64Array(n);
		var alphaInvertedData = new Float64Array(n);

		// Fastest javascript loop version according to 
		// https://blogs.oracle.com/greimer/entry/best_way_to_code_a
		var x = 1.0/255.0; // just to avoid division in loop
		while (n--) {
			var alpha = imgData.data[n*4+3]*x;
			alphaData[n] = alpha;
			alphaInvertedData[n] = 1-alpha;
		}

		console.log('creating inside distance texture ...')
		var insideDistance = DistanceTransformer.getDistance(alphaInvertedData, h, w);
		// console.log('creating outside distance texture ...')
		// var outsideDistance = DistanceTransformer.getDistance(alphaData, h, w);

		// Outputobject creation
		var outputData = {};
		outputData.data = insideDistance;
		outputData.width = w;
		outputData.height = h;

		// DURATION DEBUGGING

		var duration = new Date().getTime() - start;
		console.log('creating the distance image took: ' + duration + ' ms');

		// VISUAL DEBUGGING
		
		// return a power-of-two sized distance texture with inside and outside distance in separate channels 
		var distanceImageData = ctx.createImageData(w, h);
		n = distanceImageData.data.length/4;

		while (n--) {
			distanceImageData.data[n*4] = insideDistance[n];
			// distanceImageData.data[n*4+1] = outsideDistance[n];
			distanceImageData.data[n*4+2] = 0;
			distanceImageData.data[n*4+3] = 255.0;
		}


		ctx.putImageData(distanceImageData, 0, 0);



		return outputData;


	}

	return textDrawer;

})

