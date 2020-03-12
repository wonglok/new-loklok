precision highp float;

// varying vec3 vNormal;
// varying vec2 vUv;
// varying vec3 vViewPosition;

// uniform vec3 baseColor;
// uniform float time;
// uniform float animateRadius;
// uniform float animateStrength;


// uniform vec3 baseColor;
uniform float baseOpacity;

// varying vec3 vPos;

uniform samplerCube tCube;
// uniform sampler2D tDudv;
uniform float time;

varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;
// varying vec2 vUv;

uniform bool useDudv;

varying vec3 vColor;

void main (void) {
  vec3 tRefract0 = vRefract[0];
  vec3 tRefract1 = vRefract[1];
  vec3 tRefract2 = vRefract[2];

  // if (useDudv) {
  //   float waveStrength = 0.12;

  //   // simple distortion (ripple) via dudv map (see https://www.youtube.com/watch?v=6B7IF6GOu7s)
  //   vec2 distortedUv = texture2D( tDudv, vec2( vUv.x, vUv.y ) ).rg * waveStrength;
  //   distortedUv = vUv.xy + vec2( distortedUv.x, distortedUv.y );
  //   vec2 distortion = ( texture2D( tDudv, distortedUv * 0.25 ).rg * 2.0 - 1.0 ) * waveStrength;

  //   tRefract0.xy += distortion;
  //   tRefract1.xy += distortion;
  //   tRefract2.xy += distortion;
  // }

  vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );
  // vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );
  vec4 refractedColor = vec4(1.0);

  refractedColor.r = textureCube( tCube, vec3( tRefract0.x, tRefract0.yz ) ).r;
  refractedColor.g = textureCube( tCube, vec3( tRefract1.x, tRefract1.yz ) ).g;
  refractedColor.b = textureCube( tCube, vec3( tRefract2.x, tRefract2.yz ) ).b;

  // refractedColor.r = textureCube( tCube, vec3( -tRefract0.x, tRefract0.yz ) ).r;
  // refractedColor.g = textureCube( tCube, vec3( -tRefract1.x, tRefract1.yz ) ).g;
  // refractedColor.b = textureCube( tCube, vec3( -tRefract2.x, tRefract2.yz ) ).b;

  // vec4 mixedColor = vec4(baseColor, baseOpacity);
  gl_FragColor = mix( reflectedColor , refractedColor , clamp( vReflectionFactor, 0.0, 1.0 ) );
  // gl_FragColor += 0.1 * mixedColor;
  // gl_FragColor.rgb = vColor;
  gl_FragColor.a = baseOpacity;

  //p----
  // vec3 normal = vNormal;

  // // float diffuse = normal.y * 0.5 + 0.5;
  // // gl_FragColor = vec4(vec3(diffuse), 1.0);

  // vec3 color = baseColor;
  // // float animateRadius = 0.1;
  // // float animateStrength = 0.1;

  // // Z-normal "fake" shading
  // float diffuse = normal.z * 0.5 + 0.5;

  // // add some "rim lighting"
  // vec3 V = normalize(vViewPosition);
  // float vDotN = 1.0 - max(dot(V, normal), 0.0);
  // float rim = smoothstep(0.5, 1.0, vDotN);
  // diffuse += rim * 2.0;

  // // we'll animate in the new color from the center point
  // float distFromCenter = clamp(length(vViewPosition) / 100.0, 0.0, 1.0);
  // float edge = 0.05;
  // float t = animateRadius;
  // vec3 curColor = mix(color, vec3(0.5), smoothstep(t - edge, t + edge, vUv.y) * animateStrength);

  // // final color
  // gl_FragColor = vec4(diffuse * curColor, 1.0);
}