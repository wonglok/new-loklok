
varying vec2 vUv;
uniform sampler2D textTexture;
// uniform sampler2D patternTexture;

void main (void) {
  // vec4 patternColor = texture2D(patternTexture, vUv);
  vec4 textColor = texture2D(textTexture, vUv);
  gl_FragColor = vec4(textColor.rgb, textColor.a);
}
