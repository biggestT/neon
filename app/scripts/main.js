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

  // var fontName = 'Text Me One';
  var fontName = 'Audiowide';
  fontdetect.onFontLoaded(fontName, createDistanceTexture);

  var distanceTexture;

  function createDistanceTexture () {
    distanceTexture = DistanceTextDrawer.drawText('stor', fontName, 'texture-canvas');
    webGLStart();
  };

  function webGLStart() {
    var WebGlCanvas = document.getElementById('neon-canvas');
    WebGl.initGL(WebGlCanvas);
    WebGl.initShaders();
  };

  
});
