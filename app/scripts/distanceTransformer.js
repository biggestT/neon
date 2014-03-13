/*
 * edtaa3()
 *
 * Sweep-and-update Euclidean distance transform of an
 * image. Positive pixels are treated as object pixels,
 * zero or negative pixels are treated as background.
 * An attempt is made to treat antialiased edges correctly.
 * The input image must have pixels in the range [0,1],
 * and the antialiased image should be a box-filter
 * sampling of the ideal, crisp edge.
 * If the antialias region is more than 1 pixel wide,
 * the result from this transform will be inaccurate.
 *
 * By Stefan Gustavson (stefan.gustavson@gmail.com).
 *
 * Originally written in 1994, based on a verbal
 * description of the SSED8 algorithm published in the
 * PhD dissertation of Ingemar Ragnemalm. This is his
 * algorithm, I only implemented it in C.
 *
 * Updated in 2004 to treat border pixels correctly,
 * and cleaned up the code to improve readability.
 *
 * Updated in 2009 to handle anti-aliased edges.
 *
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
 * Compute the local gradient at edge pixels using convolution filters.
 * The gradient is computed only at edge pixels. At other places in the
 * image, it is never used, and it's mostly zero anyway.
 */


 /*
	Ported to JavaScript by Tor Nilsson Ohrn in 2013
 */


 /*
 * Compute the local gradient at edge pixels using convolution filters.
 * The gradient is computed only at edge pixels. At other places in the
 * image, it is never used, and it's mostly zero anyway.
 */

// require.js style modularisation
define(function () {

  // Initializ the object to be exported
  var DistanceTransformer = {
    normalize: true
  };

  // Currently the only public function of the DistanceTransformer object
  // To be called by clients when in need for distance data array of some image data
  // @param {Float64Array} img
  // @param {Number} h
  // @param {Number} w
  DistanceTransformer.getDistance = function (img, h, w) {

    var xDist, yDist, gX, gY, n;

    n = img.length;

    xDist = new Int16Array(n);
    yDist = new Int16Array(n);
    gX = new Float64Array(n);
    gY = new Float64Array(n);

    distData = new Float64Array(n);  

    computeGradient(img, w, h, gX, gY);
    edtaa3(img, gX, gY, w, h, xDist, yDist, distData);

    var output = new Uint8Array(n);

    if (this.normalize) {
      var i = n;
      while(i--) {
        output[i] = (distData[i] > 0) ? distData[i]/distData.maxDist*255.0 : 0; 
      }
    }

    return output;
    
  }

  // "Private" functions used by the public function createDistanceImage:
  // @param {Float64Array} img
  // @param {Number} w
  // @param {Number} h
  // @param {Number} gx
  // @param {Number} gy
  function computeGradient (img, w, h, gx, gy) {
    var i,j,k,p,q;
    var glength, phi, phiscaled, ascaled, errsign, pfrac, qfrac, err0, err1, err;
    var SQRT2 = 1.4142136;
    var ul, u, ur, l, r, dl, d, dl;

    // set offsets for current width
    ul = -w-1;
    u = -w;
    ur = -w+1;
    l = -1;
    r = 1;
    dr = w+1;
    d = w;
    dl = w-1;

    // Avoid edges where the kernels would spill over
    i = h-2;
    j = w-2;
    while(i--) { 
      while(j--) {
        k = (i+1)*w + (j+1);
        if((img[k]>0.0) && (img[k]<1.0)) { // Compute gradient for edge pixels only
          gx[k] = -img[k+ul] - SQRT2*img[k+l] - img[k+dl] + img[k+ur] + SQRT2*img[k+r] + img[k+dr];
          gy[k] = -img[k+ul] - SQRT2*img[k+u] - img[k+ur] + img[k+dl] + SQRT2*img[k+d] + img[k+dr];
          glength = gx[k]*gx[k] + gy[k]*gy[k];
          if(glength > 0.0) { // Avoid division by zero
            glength = Math.sqrt(glength);
            gx[k]=gx[k]/glength;
            gy[k]=gy[k]/glength;
          }
        }
      }
      j = w-2;
    }
    // TODO: Compute for the 1 pixel wide image border edge

  }

  /*
   * A somewhat tricky function to approximate the distance to an edge in a
   * certain pixel, with consideration to either the local gradient (gx,gy)
   * or the direction to the pixel (dx,dy) and the pixel greyscale value a.
   * The latter alternative, using (dx,dy), is the metric used by edtaa2().
   * Using a local estimate of the edge gradient (gx,gy) yields much better
   * accuracy at and near edges, and reduces the error even at distant pixels
   * provided that the gradient direction is accurately estimated.
   */
  function edgedf(gx, gy, a) {
      var df, glength, temp, a1;

      if ((gx == 0) || (gy == 0)) { // Either A) gu or gv are zero, or B) both
          df = 0.5-a;  // Linear approximation is A) correct or B) a fair guess
      } else {
          glength = Math.sqrt(gx*gx + gy*gy);
          if(glength>0) {
              gx = gx/glength;
              gy = gy/glength;
          }
          /* Everything is symmetric wrt sign and transposition,
           * so move to first octant (gx>=0, gy>=0, gx>=gy) to
           * avoid handling all possible edge directions.
           */
          gx = Math.abs(gx);
          gy = Math.abs(gy);
          if(gx<gy) {
              temp = gx;
              gx = gy;
              gy = temp;
          }
          a1 = 0.5*gy/gx;
          if (a < a1) { // 0 <= a < a1
              df = 0.5*(gx + gy) - Math.sqrt(2.0*gx*gy*a);
          } else if (a < (1.0-a1)) { // a1 <= a <= 1-a1
              df = (0.5-a)*gx;
          } else { // 1-a1 < a <= 1
              df = -0.5*(gx + gy) + Math.sqrt(2.0*gx*gy*(1.0-a));
          }
      }    
      return df;
  }

  function distaa3(img, gximg, gyimg, w, c, xc, yc, xi, yi) {
    var di, df, dx, dy, gx, gy, a, closest;
    
    closest = c-xc-yc*w; // Index to the edge pixel pointed to from c
    
    a = img[closest];    // Grayscale value at the edge pixel
    gx = gximg[closest]; // X gradient component at the edge pixel
    gy = gyimg[closest]; // Y gradient component at the edge pixel
    
    if(a > 1.0) a = 1.0;
    if(a < 0.0) a = 0.0; // Clip grayscale values outside the range [0,1]
    if(a == 0.0) return 1000000.0; // Not an object pixel, return "very far" ("don't know yet")
    

    dx = xi;
    dy = yi;
    di = Math.sqrt(dx*dx + dy*dy); // Length of integer vector, like a traditional EDT
    if(di==0) { // Use local gradient only at edges
        // Estimate based on local gradient only
        df = edgedf(gx, gy, a);
    } else {
        // Estimate gradient based on direction to edge (accurate for large di)
        df = edgedf(dx, dy, a);
    }
    return di + df; // Same metric as edtaa2, except at edges (where di=0)
  }

  function edtaa3(img, gX, gY, w, h, distX, distY, dist) {
    var x, y, i, c;
    var oldDist, newDist;
    var cDistX, cDistY, newDistX, newDistY;
    var changed;
    var directions;
    
    dist.maxDist = 0;

    // test count variables
    var passes = 0;
    var numChecked = 0;

    var UL, U, UR, L, C, R, DL, D, DR;
    UL=0; U=1; UR=2; L=3; C=4; R=5; DL=6; D=7; DR=8;


    /* 
      -- DIRECTIONS ARRAY --

        | 0 | 1 | 2 |
        | 3 | 4 | 5 |
        | 6 | 7 | 8 | 

    */

    directions = new Array(9);
    for (var i = directions.length - 1; i >= 0; i--) {
      var dir = directions;
      dir[i] = [];
      switch(i) {
        case 0: // up left
          dir[i].offset = -w-1; dir[i].x = 1; dir[i].y = 1;
          break;
        case 1: // up 
          dir[i].offset = -w; dir[i].x = 0; dir[i].y = 1;
          break;
        case 2: // up right
          dir[i].offset = -w+1; dir[i].x = -1; dir[i].y = 1;
          break;
        case 3: // left
          dir[i].offset = -1; dir[i].x = 1; dir[i].y = 0;
          break;
        case 4: // center
          dir[i].offset = 0; dir[i].x = 1; dir[i].y = 0;
          break;
        case 5: // right
          dir[i].offset = 1; dir[i].x = -1; dir[i].y = 0;
          break;
        case 6: // down left
          dir[i].offset = w-1; dir[i].x = 1; dir[i].y = -1;
          break;
        case 7: // down
          dir[i].offset = w; dir[i].x = 0; dir[i].y = -1;
          break;
        case 8: // down right
          dir[i].offset = w+1; dir[i].x = -1; dir[i].y = -1;
          break;
      }
    };
    function updateDist(i) {
      distX[i]=newDistX;
      distY[i]=newDistY;
      dist[i]=newDist;
      olddist=newDist;
      changed = 1;
    }
    function checkDistance(d) {
      numChecked++;
      c = i + directions[d].offset;
      cDistX = distX[c];
      cDistY = distY[c];
      newDistX = cDistX+directions[d].x;
      newDistY = cDistY+directions[d].y;
      newDist = distaa3(img, gX, gY, w, c, cDistX, cDistY, newDistX, newDistY);

      // Update if new distance is shorter
      if(newDist < olddist) { updateDist(i); }
      // Check if new maximum value, can later be used for normalisation
      // of the distance map
      if (newDist > dist.maxDist && newDist < w) { dist.maxDist = newDist; }
    }

    /* Initialize the distance images */
    i = w*h;
    while(i--) {
      distX[i] = 0; // At first, all pixels point to
      distY[i] = 0; // themselves as the closest known.
      if(img[i] <= 0.0) {
        dist[i]= 1000000.0; // Big value, means "not set yet"
      }
      else if (img[i]<1.0) {
        dist[i] = edgedf(gX[i], gY[i], img[i]); // Gradient-assisted estimate
      }
      else {
        dist[i]= 0.0; // Inside the object
      }
    }

    
    /* Perform the transformation */

    do {
      passes++;
      changed = 0;
      /* Scan rows, except first row */
      for(y=1; y<h; y++) {
        /* move index to leftmost pixel of current row */
        i = y*w;

        /* scan right, propagate distances from above & left */

        /* Start with the Leftmost pixel which is special - has no left neighbors */
        olddist = dist[i];
        // If non-zero distance or not set yet
        if(olddist > 0) { 
          checkDistance(U);
          checkDistance(UR);
        }
        i++;

        /* Continue with Middle pixels that have all neighbors */
        for(x=1; x<w-1; x++) {
          i++;
          olddist = dist[i];
          if(olddist <= 0) continue; // No need to update further
          checkDistance(L);
          checkDistance(UL);
          checkDistance(U);
          checkDistance(UR);
        }

        /* Finally the Rightmost pixel of row which is special, has no right neighbors */
        olddist = dist[i];
        if(olddist > 0) { // If not already zero distance  
          checkDistance(L);
          checkDistance(UL);
          checkDistance(U);
        }

        /* Move index to second rightmost pixel of current row. */
        /* Rightmost pixel is skipped, it has no right neighbor. */
        i = y*w + w-2;

        /* Go back the same way to "check your tracks" 
           i.e scan left, propagate distance from right */
        for(x=w-2; x>=0; x--) {
          i--;
          olddist = dist[i];

          if (olddist <= 0) continue; // Already zero distance
          checkDistance(R);
        }
      }


      /* Scan rows in REVERSE order, except last row */
      for(y=h-2; y>=0; y--) {
        /* move index to rightmost pixel of current row */
        i = y*w + w-1;

        /* Scan left, propagate distances from below & right */

        /* Rightmost pixel is special, has no right neighbors */
        olddist = dist[i];
        if(olddist > 0) { // If not already zero distance
          checkDistance(D);
          checkDistance(DL);
        }
        i--;

        /* Middle pixels have all neighbors */
        for(x=w-2; x>0; x--) {
          i--;
          olddist = dist[i];
          if(olddist <= 0) continue; // Already zero distance
          checkDistance(R);
          checkDistance(DR);
          checkDistance(D);
          checkDistance(DL);
        }

        /* Leftmost pixel is special, has no left neighbors */
        olddist = dist[i];

        if(olddist > 0) { // If not already zero distance
          checkDistance(R);
          checkDistance(DR);
          checkDistance(D);
        }

        /* Move index to second leftmost pixel of current row. */
        /* Leftmost pixel is skipped, it has no left neighbor. */
        i = y*w + 1;

        for(x=1; x<w; x++) {
          i++;
          /* scan right, propagate distance from left */
          olddist = dist[i];
          if(olddist <= 0) continue; // Already zero distance
          checkDistance(L);
        }
      }
    }
    while(changed && passes < 10); // Sweep until no more updates are made
    /* The transformation is completed. */
    console.log('check function run: '+numChecked +' number of times in ' + passes + ' passes');
  }

  return DistanceTransformer;

});