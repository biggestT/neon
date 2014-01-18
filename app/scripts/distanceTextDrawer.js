// Object that creates a 2D distance texuture image of a given text with any font 
define(['distanceTransformer'], function (DistanceTransformer) {

	var textDrawer = {};

	textDrawer.drawText = function (txt, font) {

		// Clock the execution of the DT
		var time = new Date();
		var start = new Date().getTime();

		// must be power of 2
		var textHeight = 256;
		var textFont = 'bold ' + textHeight + 'px ' + font;

		// DT of text or surroundings?
		var inverted = true;

		// use dummy canvas for creation of Distance map Texture
		var cnv = document.getElementById('texture');
		var ctx = cnv.getContext("2d");

		// test how wide the current text will be with the current settings
		ctx.font = textFont;
		var tw = ctx.measureText(txt).width + 20; // add some arbitrary margin, not sure why its needed
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
		
		// get the 4 channel pixel values of the region with text in it and then clear it
		var imgData = ctx.getImageData(wOffset, 0, tw, th); 
		// ctx.clearRect(wOffset, 0, tw, th); 
		// initialize the output image object
		var outImg = ctx.createImageData(tw, th);

		// get normalized alpha values 
		var n = imgData.data.length/4;
		var alphaData = new Float64Array(n);

		// Fastest javascript loop version according to 
		// https://blogs.oracle.com/greimer/entry/best_way_to_code_a
		while (n--) {
			var alpha = imgData.data[n*4+3]/255.0;
			alphaData[n] = (inverted) ? 1-alpha : alpha;
		}

		DistanceTransformer.createDistanceImage(outImg.data, alphaData, th, tw);

		ctx.putImageData(outImg, wOffset, 0);

		var duration = new Date().getTime() - start;
		console.log('creating the heightmap texture took: ' + duration + ' ms');

		// return the power-of-two sized distance texture data
		


	}

	return textDrawer;

})

