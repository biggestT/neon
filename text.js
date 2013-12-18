document.body.onload = function () {
	fontdetect.onFontLoaded ('Text Me One', drawText);

	function drawText () {
		var txt = 'YOLO';

		var cnv = document.getElementById('neon-canvas');
		var ctx = cnv.getContext("2d");

		var w = cnv.width;
		var h = cnv.height;
		var th = h;
		ctx.font = th + 'px "Text Me One"';
		ctx.textAlign = 'center';
		ctx.fillStyle = '#fff';

		var tw = ctx.measureText(txt).width;

		ctx.fillText(txt, tw, th);

		var imgData = ctx.getImageData((w-tw)/2, 0, tw, th)
		ctx.putImageData(imgData,(w-tw)/2, 0)
		
		console.log(imgData);
	}
}