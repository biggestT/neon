define(['glMatrix'] // Google's webGL utility for fast basic matrix operations
  , function(GlMatrix) {

  var webGlObject = {};
	var mat4 = GlMatrix.mat4;
  var shaderProgram, gl, mvMatrix, pMatrix, texture;
  var animated = false;

  webGlObject.init = function (canvas) {

    try {
      gl = canvas.getContext('webgl');
      gl.viewportWidth = canvas.width;
      gl.viewportHeight = canvas.height;

      this._currentAngle = 0;

      mvMatrix = mat4.create();
      pMatrix = mat4.create();

      this.initShaders();
      this.initBuffers();

    } catch (e) {
      console.log(e);
    }
    if (!gl) {
      console.log('Could not initialise WebGL, sorry :-(');
    }
  };


  // utility function to get construct shader from external file
  function getShader (gl, shaderURL, shaderType) {

  // read content of shaderfile into string
  var request = new XMLHttpRequest();
  request.open('GET', shaderURL, false);
  request.send(null);
  var returnValue = request.responseText;

  if (!returnValue) {
    return null;
  }

  var str = returnValue;
  var shader;

  if (shaderType == 'shader-fs') {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderType == 'shader-vs') {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
};


webGlObject.initShaders = function() {
  var fragmentShader = getShader(gl, './shaders/fragment.glsl', 'shader-fs');
  var vertexShader = getShader(gl, './shaders/vertex.glsl', 'shader-vs');

  shaderProgram = gl.createProgram();

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.log('Could not initialise shaders');
  }

  // Connect shader with attribute and uniform variables
  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, 'aTextureCoord');
  gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

  // get location of uniform variables and store them in the shaderprogram object
  shaderProgram.uSamplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix');
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix');

}

// Creates a webGl texture out of an image data array
// @param {Image} the image data array to use as a texture

webGlObject.initTexture = function (imgData) {
  
  texture = gl.createTexture();
  console.log(imgData);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, imgData.width, imgData.height, 0, gl.ALPHA, gl.UNSIGNED_BYTE, imgData.data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null); // not sure if really necessary
}


// initBuffers

webGlObject.initBuffers = function () {
  
  // array of vertices for the plane
  var vertices = [
    1.0,  1.0,  0.0,
    -1.0, 1.0,  0.0,
    1.0,  -1.0, 0.0,
    -1.0, -1.0, 0.0
  ];
  
  planeVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, planeVerticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // array to map the vertices in order to uv texture coordinates
  var textureCoordinates = [
    1.0,  0.0,
    0.0,  0.0,
    1.0,  1.0,
    0.0,  1.0
  ];

  planeVerticesTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, planeVerticesTextureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                gl.STATIC_DRAW);
  
}

function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

webGlObject.drawScene = function() {
  
  console.log('drawing scene ...');



  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
  mat4.identity(mvMatrix);


  mat4.translate(mvMatrix, mvMatrix, [0.0, 0.0, -2.0]);
  mat4.rotateY(mvMatrix, mvMatrix, this._currentAngle);

  setMatrixUniforms();

  // Draw the cube by binding the array buffer to the cube's vertices
  // array, setting attributes, and pushing it to GL
  gl.bindBuffer(gl.ARRAY_BUFFER, planeVerticesBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  
  // Set the texture coordinates attribute for the vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, planeVerticesTextureCoordBuffer);
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
  
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(shaderProgram.uSamplerUniform, 0);
  

  // Draw the cube
  gl.bindBuffer(gl.ARRAY_BUFFER, planeVerticesBuffer);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  if (animated) { requestAnimationFrame(this.drawScene.bind(this)); }
  
  // increase rotation angle but keep it within 2PI
  this._currentAngle += Math.PI/100;
  if (this._currentAngle > 2*Math.PI) {
    this._currentAngle -= 2*Math.PI;
  }
};

return webGlObject;


})