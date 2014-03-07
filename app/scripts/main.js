/*global require*/
'use strict';

require.config({
  shim: {
    glMatrix: {
      exports: 'glMatrix'
    }
  },
  paths: {
    glMatrix: '../bower_components/gl-matrix/dist/gl-matrix-min'
  },
});

require([
  'distanceTextDrawer', 
  'fontDetectNoJquery', // returns single instance of global object 
  'webGl'
], function (DistanceTextDrawer, FontDetect, WebGl) {

  var fontName = 'Text Me One';
  // var fontName = 'Audiowide';
  
  fontdetect.onFontLoaded(fontName, createDistanceTexture);

  var distanceImage;

  function createDistanceTexture () {
    distanceImage = DistanceTextDrawer.drawText('neon', fontName, 'texture-canvas');
    var WebGlCanvas = document.getElementById('neon-canvas');
    WebGl.init(WebGlCanvas);
    WebGl.initTexture(distanceImage);
  };
  
});
