import { Vector2 } from 'three'

/**
 * @author Mugen87 / https://github.com/Mugen87
 * @author Wong Lok / https://wonglok.com
 */

let glsl = v => v[0]

let vertexShader = glsl`
  uniform vec2 resolution;
  uniform mat4 textureMatrix;
  varying vec2 vUv;
  varying vec4 vUvRefraction;
  void main (void) {
    vUv = uv;
    // vUv.y = 1.0 - vUv.y;
    vUvRefraction = textureMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`
let fragmentShader = glsl`

  #include <common>

  uniform vec3 color;
  uniform float time;
  uniform float blur;
  uniform sampler2D tDiffuse;
  uniform sampler2D tDudv;

  uniform vec2 resolution;

  varying vec2 vUv;
  varying vec4 vUvRefraction;

  float blendOverlay( float base, float blend ) {
    return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );
  }

  vec3 blendOverlay( vec3 base, vec3 blend ) {
    return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ),blendOverlay( base.b, blend.b ) );
  }

  //https://github.com/Jam3/glsl-fast-gaussian-blur/blob/master/13.glsl

  // vec4 blurProj13 (sampler2D image, vec4 uv, vec4 resolution, vec4 direction) {
  //   vec4 color = vec4(0.0);
  //   vec4 off1 = vec4(1.411764705882353) * direction;
  //   vec4 off2 = vec4(3.2941176470588234) * direction;
  //   vec4 off3 = vec4(5.176470588235294) * direction;
  //   color += texture2DProj(image, uv) * 0.1964825501511404;
  //   color += texture2DProj(image, uv + (off1 / resolution)) * 0.2969069646728344;
  //   color += texture2DProj(image, uv - (off1 / resolution)) * 0.2969069646728344;
  //   color += texture2DProj(image, uv + (off2 / resolution)) * 0.09447039785044732;
  //   color += texture2DProj(image, uv - (off2 / resolution)) * 0.09447039785044732;
  //   color += texture2DProj(image, uv + (off3 / resolution)) * 0.010381362401148057;
  //   color += texture2DProj(image, uv - (off3 / resolution)) * 0.010381362401148057;
  //   return color;
  // }

  // vec4 blurProj9 (sampler2D image, vec4 uv, vec4 resolution, vec4 direction) {
  //   vec4 color = vec4(0.0);
  //   vec4 off1 = vec4(1.3846153846) * direction;
  //   vec4 off2 = vec4(3.2307692308) * direction;
  //   color += texture2DProj(image, uv) * 0.2270270270;
  //   color += texture2DProj(image, uv + (off1 / resolution)) * 0.3162162162;
  //   color += texture2DProj(image, uv - (off1 / resolution)) * 0.3162162162;
  //   color += texture2DProj(image, uv + (off2 / resolution)) * 0.0702702703;
  //   color += texture2DProj(image, uv - (off2 / resolution)) * 0.0702702703;
  //   return color;
  // }

  // vec4 blurProj5 (sampler2D image, vec4 uv, vec4 resolution, vec4 direction) {
  //   vec4 color = vec4(0.0);
  //   vec4 off1 = vec4(1.3333333333333333) * direction;
  //   color += texture2DProj(image, uv) * 0.29411764705882354;
  //   color += texture2DProj(image, uv + (off1 / resolution)) * 0.35294117647058826;
  //   color += texture2DProj(image, uv - (off1 / resolution)) * 0.35294117647058826;
  //   return color;
  // }

  void main (void) {
    float waveStrength = 0.5;
    float waveSpeed = 0.0;
    float myspeed = 0.05;
    // vec2 distortedUv = texture2D( tDudv, vec2( fract(vUv.x - time * myspeed), fract(time * myspeed - vUv.y * (resolution.x / resolution.y)) ) ).rg * waveStrength;
    // distortedUv = vUv.xy + vec2( distortedUv.x, distortedUv.y + time * waveSpeed );
    // // distortedUv.y = 1.0 - distortedUv.y;
    // vec2 distortion = ( texture2D( tDudv, distortedUv ).rg * 2.0 - 1.0 ) * waveStrength;

    vec4 uv = vec4(vUvRefraction);
    vec2 dlookup = vUv.xy - time * myspeed;
    dlookup.y *= resolution.x / resolution.y;


    vec2 distortion = ( texture2D( tDudv, vec2(fract(dlookup.x), fract(dlookup.y)) ).rg * 2.0 - 1.0 );
    uv.xy += distortion;

    float amount = resolution.x * 0.5;
    vec4 base = vec4(0.0);
    // Basic Reader
    // base += texture2DProj(tDiffuse, uv);

    // Quality of the Blur
    // higher = slower but more pretty
    float myBlur = 0.0;
    if (blur < 0.01) {
      base += texture2DProj(tDiffuse, uv);
    } else {
      myBlur = blur * 0.85;
      const float radius = 5.0;
      const float pi = 3.141592653589793;
      const int r = int(radius);
      const int nr = -r;
      float k = 0.9342/(radius*radius);
      float size = pow(radius * (1.15 - myBlur), 2.0);

      for (int y = nr; y <= r; y++) {
        for (int x = nr; x <= r; x++) {
          float xx = float(x);
          float yy = float(y);
          float d = length(vec2(xx, yy));
          if (d >= radius) {
            continue;
          }
          float weight = k * (cos(pi*d/radius) + 1.0) / 2.0;
          base += texture2DProj(tDiffuse, uv + vec4(xx, yy, 0.0, 0.0) / size) * weight;
        }
      }
    }



    // base += 0.25 * blurProj5(tDiffuse, uv, vec4(resolution.x, resolution.y, resolution.x, resolution.y), vec4(amount, -amount, amount, -amount));
    // base += 0.25 * blurProj5(tDiffuse, uv, vec4(resolution.x, resolution.y, resolution.x, resolution.y), vec4(-amount, amount, -amount, amount));
    // base += 0.25 * blurProj5(tDiffuse, uv, vec4(resolution.x, resolution.y, resolution.x, resolution.y), vec4(amount, -amount, amount, -amount));
    // base += 0.25 * blurProj5(tDiffuse, uv, vec4(resolution.x, resolution.y, resolution.x, resolution.y), vec4(-amount, amount, -amount, amount));

    gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );
    // gl_FragColor = vec4(base.rgb, 1.0);
  }
`

var FastBlurShader = {

  uniforms: {

    color: {
      value: null
    },

    time: {
      value: 0
    },

    blur: {
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
    },

    resolution: {
      value: new Vector2(1024, 1024)
    }

  },

  vertexShader: vertexShader,
  fragmentShader: fragmentShader
}

export { FastBlurShader }
