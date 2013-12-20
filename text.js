
function drawText () {
		var time = new Date();
		var start = new Date().getTime();

		var txt = 'Neon';

		var cnv = document.getElementById('neon-canvas');
		var ctx = cnv.getContext("2d");

		var w = cnv.width;
		var h = cnv.height;
		var size = h;

		ctx.font = 'bold ' + size + 'px "Text Me One"';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = '#fff';

		var tw = ctx.measureText(txt).width;
		var th = size;

		var wOffset = (w-tw)/2;
		
		ctx.fillText(txt, wOffset, h/2);

		// get the 4 channel pixel values of the region with text in it and then clear it
		var imgData = ctx.getImageData(wOffset, 0, tw, th); 
		ctx.clearRect(wOffset, 0, tw, th); 
		// initialize the output image object
		var outImg = ctx.createImageData(tw, th);

		// get normalized alpha values 
		var n = imgData.data.length/4;
		var alphaData = new Float64Array(n);

		// Fastest javascript loop version according to 
		// https://blogs.oracle.com/greimer/entry/best_way_to_code_a
		while (n--) {
			alphaData[n] = imgData.data[n*4+3]/255.0;
		}

		createDistImg(outImg.data, alphaData, th, tw);

		ctx.putImageData(outImg, wOffset, 0);

		var duration = new Date().getTime() - start;
		console.log('drawtext took: ' + duration + ' ms');
	}

$( function ()  {
	// wait until font file is loaded
	fontdetect.onFontLoaded ('Text Me One', drawText);
});
