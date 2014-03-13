precision mediump float; // or lowp

uniform sampler2D uSampler;

varying vec2 vTexCoord;

void main(void)

{
  // gl_FragColor = vec4(1.0, texture2D(uSampler, vTexCoord).a, 1.0, 1.0);
  // gl_FragColor = vec4( 1.0, 1.0);
  float alpha = texture2D(uSampler, vec2(vTexCoord.s, vTexCoord.t)).a;
  gl_FragColor = vec4(alpha, 0.0, 0.0, 1.0);
}