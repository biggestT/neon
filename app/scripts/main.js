/*global require*/
'use strict';

require.config({
  shim: {
    glMatrix: {
      exports: 'glMatrix'
    }
  },
  paths: {
    glMatrix: '../bower_components/dist/gl-matrix'
  },
});

require([
  'distanceTextDrawer', 
  'fontDetectNoJquery' // returns single instance of global object 
], function (DistanceTextDrawer, FontDetect) {

  var fontName = 'Text Me One';
  fontdetect.onFontLoaded(fontName, drawText);

  function drawText () {
    DistanceTextDrawer.drawText('Neo', fontName);
  };

});
