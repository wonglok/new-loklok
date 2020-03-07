/**
 * @author Mugen87 / https://github.com/Mugen87
 * @author Wong Lok / https://wonglok.com
 */

let glsl = v => v[0]

let vertexShader = glsl`
  uniform mat4 textureMatrix;
  varying vec2 vUv;
  varying vec4 vUvRefraction;
  void main (void) {
    vUv = uv;
    vUvRefraction = textureMatrix * vec4( position, 1.0 );
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`
let fragmentShader = glsl`
  uniform vec3 color;
  uniform float time;
  uniform sampler2D tDiffuse;
  uniform sampler2D tDudv;
  varying vec2 vUv;
  varying vec4 vUvRefraction;

  float blendOverlay( float base, float blend ) {
    return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );
  }
  vec3 blendOverlay( vec3 base, vec3 blend ) {
    return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ),blendOverlay( base.b, blend.b ) );
  }
  vec4 blurProj5(sampler2D image, vec4 uv, vec4 resolution, vec4 direction) {
    vec4 color = vec4(0.0);
    vec4 off1 = vec4(1.3333333333333333) * direction;
    color += texture2DProj(image, uv) * 0.29411764705882354;
    color += texture2DProj(image, uv + (off1 / resolution)) * 0.35294117647058826;
    color += texture2DProj(image, uv - (off1 / resolution)) * 0.35294117647058826;
    return color;
  }
  void main (void) {
    float waveStrength = 0.5;
    float waveSpeed = 0.00;
    vec2 distortedUv = texture2D( tDudv, vec2( vUv.x + time * waveSpeed, vUv.y ) ).rg * waveStrength;
    distortedUv = vUv.xy + vec2( distortedUv.x, distortedUv.y + time * waveSpeed );
    vec2 distortion = ( texture2D( tDudv, distortedUv ).rg * 2.0 - 1.0 ) * waveStrength;

    vec4 uv = vec4(vUvRefraction);
    uv.xy += distortion;

    // vec4 base = texture2DProj(tDiffuse, uv);

    vec4 base = blurProj5(tDiffuse, uv, vec4(1024.0), vec4(200.0));

    gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );
    // gl_FragColor = vec4(base.rgb, 1.0);
  }
`

var BlurShader = {

  uniforms: {

    color: {
      value: null
    },

    time: {
      value: 0
    },

    tDiffuse: {
      value: null
    },

    tDudv: {
      value: null
    },

    textureMatrix: {
      value: null
    }

  },

  vertexShader: vertexShader,
  fragmentShader: fragmentShader
}

export { BlurShader }
