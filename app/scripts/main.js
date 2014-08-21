/*global require*/
'use strict';

require.config({
  paths: {
    glMatrix: '../bower_components/gl-matrix/dist/gl-matrix-min'
  }
});

require([
  'distanceTextDrawer', 
  'fontDetectNoJquery', // returns single instance of global object 
  'webGl'
], function (DistanceTextDrawer, FontDetect, WebGl) {

  var fontName = 'Text Me One';
  var fontName = 'Audiowide';
  
  fontdetect.onFontLoaded(fontName, createDistanceTexture);

  var distanceImgData;

  function createDistanceTexture () {
    var textToDraw = window.location.hash.substr(1) || 'neon';
    distanceImgData = DistanceTextDrawer.drawText(textToDraw, fontName, 'texture-canvas');
    var WebGlCanvas = document.getElementById('neon-canvas');
    WebGl.init(WebGlCanvas);
    WebGl.initTexture(distanceImgData);
    WebGl.drawScene();
    document.getElementById('loading-text').style.visibility = 'hidden';
  };
  
});
