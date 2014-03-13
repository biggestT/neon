// precision mediump float; // or lowp

attribute vec2 aTextureCoord;
attribute vec3 aVertexPosition;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying highp vec2 vTexCoord;

void main(void) {
  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
  vTexCoord = aTextureCoord;
}