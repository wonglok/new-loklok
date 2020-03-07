precision highp float;

varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vViewPosition;

uniform vec3 baseColor;
uniform float time;
uniform float animateRadius;
uniform float animateStrength;

void main (void) {
  vec3 normal = vNormal;

  // float diffuse = normal.y * 0.5 + 0.5;
  // gl_FragColor = vec4(vec3(diffuse), 1.0);

  vec3 color = baseColor;
  // float animateRadius = 0.1;
  // float animateStrength = 0.1;

  // Z-normal "fake" shading
  float diffuse = normal.z * 0.5 + 0.5;

  // add some "rim lighting"
  vec3 V = normalize(vViewPosition);
  float vDotN = 1.0 - max(dot(V, normal), 0.0);
  float rim = smoothstep(0.5, 1.0, vDotN);
  diffuse += rim * 2.0;

  // we'll animate in the new color from the center point
  float distFromCenter = clamp(length(vViewPosition) / 100.0, 0.0, 1.0);
  float edge = 0.05;
  float t = animateRadius;
  vec3 curColor = mix(color, vec3(0.5), smoothstep(t - edge, t + edge, vUv.y) * animateStrength);

  // final color
  gl_FragColor = vec4(diffuse * curColor, 1.0);
}