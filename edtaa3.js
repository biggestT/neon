/*
 * edtaa3.c - compute the Euclidean distance transform of an image,
 * with more accurate handling of 1 pixel wide anti-aliased edges.
 *
 * This is a MEX-file for MATLAB.
 * MATLAB is a product of The MathWorks, Inc.
 *
 * Code in "edtaa3func.c" originally by Stefan Gustavson 1994,
 * implemented from a verbal description in the PhD dissertation
 * of Ingemar Ragnemalm, dept of EE, Linkoping University.
 *
 * Modification to handle antialiased edges and
 * this Matlab MEX wrapper by Stefan Gustavson,
 * (stefan.gustavson@gmail.com) 2009-05-15
 */

 /*
 Copyright (C) 2009 Stefan Gustavson (stefan.gustavson@gmail.com)

This program is free software; you can redistribute it and/or modify it
under the terms of the GNU General Public License as published by the
Free Software Foundation; either version 3 of the License, or (at your
option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
for more details.

The GNU General Public License is available on <http://www.gnu.org/licenses/>.
 */


 /* 
 	Ported to JavaScript by Tor Nilsson Ohrn in 2013
 */

function edtaa3 (outImg, img, mRows, nCols) {
	var xDist, yDist, gX, gY, i;

	xDist = new Int16Array(img.length);
	yDist = new Int16Array(img.length);
	gX = new Float64Array(img.length);
	gY = new Float64Array(img.length);

	computeGradient(img, nCols, mRows, gX, gY);
	// console.log(gX);
	// console.log(gY);
	// var outImg = new Uint8ClampedArray(img.length*4);
	for (var i = 0; i < img.length; i++) {
		var dX = Math.abs(gX[i]);
		var dY =  Math.abs(gY[i]);
		outImg[i*4] = dX*255;
		outImg[i*4+1] = dY*255;
		outImg[i*4+2] = 0;
		outImg[i*4+3] = Math.max(dY, dX)*200;
	};
	// console.log(outImg);
	return outImg;
}