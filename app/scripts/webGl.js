define(['glMatrix'] // Google's webGL utility for fast basic matrix operations
	, function(GlMatrix) {

	var webGlObject = {};

  var gl;

  webGlObject.initGL = function (canvas) {

    try {
    	console.log(canvas);
      gl = canvas.getContext('webgl');
      gl.viewportWidth = canvas.width;
      gl.viewportHeight = canvas.height;
    } catch (e) {
      console.log(e);
    }
    if (!gl) {
      console.log('Could not initialise WebGL, sorry :-(');
    }
  };

  function initMatrices () {
  	this.mvMatrix = GlMatrix.mat4.create();
  	this.pMatrix = GlMatrix.mat4.create();
  };

  webGlObject.getShader = function (gl, shaderURL, shaderType) {

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

  if (shaderType == 'x-shader/x-fragment') {
  	shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderType == 'x-shader/x-vertex') {
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

var shaderProgram;

webGlObject.initShaders = function() {
  var fragmentShader = this.getShader(gl, './shaders/fragment.glsl', 'shader-fs');
  var vertexShader = this.getShader(gl, './shaders/vertex.glsl', 'shader-vs');

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Could not initialise shaders');
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix');
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix');
}




function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}


webGlObject.drawScene = function() {
	
	var mat4 = GlMatrix.mat4; // shorthand

  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

  mat4.identity(mvMatrix);

  // animate rotation
  currentAngle += incAngle;
  if (currentAngle > 2*Math.PI) {
    currentAngle -= 2*Math.PI;
  }

  mvMatrixTrsanslated = mat4.create();
  mat4.translate(mvMatrixTrsanslated, mvMatrix, [0.0, 0.0, -3.0]);
  mvMatrixRotated = mat4.create();
  mat4.rotateY(mvMatrixRotated, mvMatrix, currentAngle);

  mvMatrix = mat4.clone(mvMatrixRotated);

  // gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
  // gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  setMatrixUniforms();
  // gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);

  requestAnimationFrame(drawScene);
};

return webGlObject;


})