export const getID = () => {
  return `_${(Math.random() * 10000000000).toFixed(0)}`
}

let THREE = {
  ...require('three'),
  ...require('three/examples/jsm/controls/OrbitControls.js')
}

let glsl = require('glslify')

// let webcam = require('../GLService/cam-video.js')

export const makeCubeTexture = (images) => {
  let items = images || [
    require('../Textures/cubemap/walk/px.png'), require('../Textures/cubemap/walk/nx.png'),
    require('../Textures/cubemap/walk/py.png'), require('../Textures/cubemap/walk/ny.png'),
    require('../Textures/cubemap/walk/pz.png'), require('../Textures/cubemap/walk/nz.png')
  ]

  let cubeTexture = new THREE.CubeTextureLoader()

  return new Promise((resolve) => {
    cubeTexture.load(items, (cubeTexture) => {
      resolve(cubeTexture)
    })
  })
}

export const makeCubeCam = ({ api, parent, renderer, scene }) => {
  let rID = getID()
  var cubeCamera = new THREE.CubeCamera(0.1, 100000000000000, 1024)
  scene.add(cubeCamera)

  // var cam = webcam.setup()

  var sphereGeo = new THREE.SphereBufferGeometry(5000, 64, 64)
  var chromeMaterial = new THREE.MeshLambertMaterial({ color: 0xeeeeee, side: THREE.BackSide })
  var sphere = new THREE.Mesh(sphereGeo, chromeMaterial)
  scene.add(sphere)

  let texture = cubeCamera.renderTarget.texture
  sphere.material.envMap = texture
  sphere.material.side = THREE.BackSide
  sphere.material.needsUpdate = true

  api.tasks[rID] = () => {
    parent.visible = false
    sphere.visible = false
    cubeCamera.update(renderer, scene)
    sphere.visible = true
    parent.visible = true
  }

  api.teardown[rID] = () => {
  }

  return cubeCamera
}

export const makeWoozyMat = async ({ cubeTexture, api }) => {
  let rID = getID()

  var uniforms = {
    'mRefractionRatio': { value: 1.02 },
    'mFresnelBias': { value: 0.1 },
    'mFresnelPower': { value: 2.0 },
    'mFresnelScale': { value: 1.0 },
    'tCube': { value: null },
    'time': { value: 0 },
    'tDudv': { value: null },
    'useDudv': { value: true }
  }
  let tDudvTexture = new THREE.TextureLoader().load(require('../Textures/maps/waterdudv.jpg'))
  uniforms.tDudv.value = tDudvTexture
  uniforms.tCube.value = cubeTexture

  let material = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    uniforms,
    // npm i raw-loader -S
    // // eslint-disable-next-line
    // vertexShader: require('raw-loader!../Shaders/BallyGLSL.vert').default,
    // // eslint-disable-next-line
    // fragmentShader: require('raw-loader!../Shaders/BallyGLSL.frag').default
    vertexShader: BallyGLSL.vert,
    fragmentShader: BallyGLSL.frag
  })

  api.tasks[rID] = () => {
    let time = window.performance.now() * 0.001
    uniforms.time.value = time
  }

  api.teardown[rID] = () => {
  }

  return material
}

export const makeFloatingBalls = async ({ scene, parent, api, cubeTexture }) => {
  let rID = getID()

  // var geometry = new THREE.SphereBufferGeometry(5.5, 128, 128)
  var geometry = new THREE.SphereBufferGeometry(5.5, 128, 128)

  let material = await makeWoozyMat({ cubeTexture, api })

  let cubes = []
  // eslint-disable-next-line
  for (var i = 0; i < 20; i++) {
    let cube = new THREE.Mesh(geometry, material)
    cube.userData.rx = Math.random() - 0.5
    cube.userData.ry = Math.random() - 0.5
    cube.userData.rz = Math.random() - 0.5

    cube.position.x = cube.userData.rx * 70
    cube.position.y = cube.userData.ry * 70
    cube.position.z = cube.userData.rz * 70

    cubes.push(cube)
    parent.add(cube)
  }

  api.teardown[rID] = () => {
    geometry.dispose()
    // cubeTexture.dispose()
  }

  let mixer = (v) => {
    if (v < 0) {
      return Math.sin(v)
    } else {
      return Math.cos(v)
    }
  }

  api.tasks[rID] = () => {
    let time = window.performance.now() * 0.001

    cubes.forEach(e => {
      e.position.x += 0.05 * mixer(time * 3.14 * e.userData.rx * 3.14)
      e.position.y += 0.05 * mixer(time * 3.14 * e.userData.ry * 3.14)
      e.position.z += 0.05 * mixer(time * 3.14 * e.userData.rz * 3.14)
    })
  }
}

export const setupControls = async ({ camera, mounter, api }) => {
  let rID = getID()
  let control = new THREE.OrbitControls(camera, mounter)

  api.tasks[rID] = () => {
    control.update()
  }
  api.teardown[rID] = () => {
  }
}

export const makeCanvasCubeTexture = async ({ api }) => {
  var rID = getID()
  // let image = new Image()
  // image.src = require('../Textures/cubemap/happy-mint/px.png')
  // image.onload = () => {
  //   cubeTexture.needsUpdate = true
  // }

  // let canvas = document.createElement('canvas')
  const easeOutSine = (t, b, c, d) => {
    return c * Math.sin((t / d) * (Math.PI / 2)) + b
  }

  const easeOutQuad = (t, b, c, d) => {
    t /= d
    return -c * t * (t - 2) + b
  }

  class TouchTexture {
    constructor () {
      this.size = 128
      this.width = 128
      this.height = 128
      this.width = this.height = this.size

      this.maxAge = 64
      this.radius = 0.1 * this.size
      // this.radius = 0.15 * 1000

      this.speed = 1 / this.maxAge
      // this.speed = 0.01

      this.trail = []
      this.last = null

      this.initTexture()
    }

    initTexture () {
      this.canvas = document.createElement('canvas')

      // document.body.appendChild(this.canvas)
      this.canvas.width = this.width
      this.canvas.height = this.height
      this.ctx = this.canvas.getContext('2d')
      this.ctx.fillStyle = 'black'
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

      this.canvas.id = 'touchTexture'
      // this.canvas.style.width = this.canvas.style.height = `${
      //   this.canvas.width
      // }px`
    }
    update (delta) {
      this.clear()
      let speed = this.speed
      this.trail.forEach((point, i) => {
        let f = point.force * speed * (1 - point.age / this.maxAge)
        // let x = point.x
        // let y = point.y

        point.x += point.vx * f
        point.y += point.vy * f
        point.age++
        if (point.age > this.maxAge) {
          this.trail.splice(i, 1)
        }
      })

      this.trail.forEach((point, i) => {
        this.drawPoint(point)
      })
      // this.drawPoints()

      // this.ctx.fillStyle = "rgba(255,0,0,0.5)"
      // this.ctx.fillRect(0, 0, 200, 200)
      // this.ctx.fillStyle = "rgba(0,255,0,0.5)"
      // this.ctx.fillRect(50, 0, 200, 200)
      // this.test()
    }
    clear () {
      this.ctx.fillStyle = 'black'
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }
    addTouch (point) {
      let force = 0
      let vx = 0
      let vy = 0
      const last = this.last
      if (last) {
        const dx = point.x - last.x
        const dy = point.y - last.y
        if (dx === 0 && dy === 0) return
        const dd = dx * dx + dy * dy
        let d = Math.sqrt(dd)
        vx = dx / d
        vy = dy / d

        force = Math.min(dd * 10000, 1)
        // force = Math.sqrt(dd)* 50.
        // force = 1
      }
      this.last = {
        x: point.x,
        y: point.y
      }
      this.trail.push({ x: point.x, y: point.y, age: 0, force, vx, vy })
    }
    drawPoint (point) {
      const ctx = this.ctx
      const pos = {
        x: point.x * this.width,
        y: (1 - point.y) * this.height
      }

      let intensity = 1

      if (point.age < this.maxAge * 0.3) {
        intensity = easeOutSine(point.age / (this.maxAge * 0.3), 0, 1, 1)
      } else {
        intensity = easeOutQuad(
          1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7),
          0,
          1,
          1
        )
      }
      intensity *= point.force

      const radius = this.radius
      let color = `${((point.vx + 1) / 2) * 255}, ${((point.vy + 1) / 2) *
        255}, ${intensity * 255}`

      let offset = this.size * 5
      ctx.shadowOffsetX = offset // (default 0)
      ctx.shadowOffsetY = offset // (default 0)
      ctx.shadowBlur = radius * 1 // (default 0)
      ctx.shadowColor = `rgba(${color},${0.35 * intensity})` // (default transparent black)

      this.ctx.beginPath()
      this.ctx.fillStyle = 'rgba(255,0,0,1)'
      this.ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2)
      this.ctx.fill()
    }
  }
  let mouse = new THREE.Vector2()
  let on = {
    onTouchMove (ev) {
      ev.preventDefault()

      const touch = ev.targetTouches[0]

      mouse = {
        x: touch.clientX / window.innerWidth,
        y: 1 - touch.clientY / window.innerHeight
      }

      touchTextures.forEach(e => e.addTouch(mouse))
      // onMouseMove({ clientX: touch.clientX, clientY: touch.clientY })
    },
    onMouseMove (ev) {
      mouse = {
        x: ev.clientX / window.innerWidth,
        y: 1 - ev.clientY / window.innerHeight
      }
      touchTextures.forEach(e => e.addTouch(mouse))
    }
  }

  var touchTextures = [
    new TouchTexture(),
    new TouchTexture(),
    new TouchTexture(),
    new TouchTexture(),
    new TouchTexture(),
    new TouchTexture()
  ]

  api.tasks[rID] = () => {
    touchTextures.forEach(e => {
      e.update()
    })
    cubeTexture.needsUpdate = true
  }

  window.addEventListener('mousemove', on.onMouseMove, { passive: false })
  window.addEventListener('touchmove', on.onTouchMove, { passive: false })

  let cubeTexture = new THREE.CubeTexture([
    ...touchTextures.map(e => e.canvas)
  ])
  return cubeTexture
}

export const makeCenterPiece = ({ cubeTexture, parent, scene }) => {
  // var geo = new THREE.TorusKnotGeometry(9 / 2, 1.2 / 1.5, 293, 20, 3, 4)
  var geo = new THREE.TorusBufferGeometry(10, 3, 16, 100)

  // var geo = new THREE.OctahedronGeometry(5, 2)
  var mat = new THREE.MeshBasicMaterial({ color: 0xffffff, envMap: cubeTexture })
  mat.color = new THREE.Color(0xeeeeee)
  mat.refractionRatio = 0.98
  mat.reflectionRatio = 0.98
  mat.envMap = cubeTexture
  mat.envMap.mapping = THREE.CubeReflectionMapping
  // mat.envMap.mapping = THREE.CubeRefractionMapping
  mat.needsUpdate = true

  var mesh = new THREE.Mesh(geo, mat)
  mesh.scale.x = 0.5
  mesh.scale.y = 0.5
  mesh.scale.z = 0.5

  // parent.add(mesh)
  parent.add(mesh)
}

export const setupBase = async ({ api, mounter, vm }) => {
  let env = { api, mounter, vm }
  let rID = getID()
  let exited = false

  let rect = mounter.getBoundingClientRect()
  var scene = new THREE.Scene()
  var camera = new THREE.PerspectiveCamera(75, rect.width / rect.height, 0.1, 1000)
  var renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  })

  renderer.setSize(rect.width, rect.height)
  mounter.appendChild(renderer.domElement)
  renderer.domElement.style.marginBottom = '-6px'

  window.addEventListener('resize', () => {
    if (exited) {
      return
    }
    rect = mounter.getBoundingClientRect()
    renderer.setSize(rect.width, rect.height)
    camera.aspect = rect.width / rect.height
    camera.updateProjectionMatrix()
  })

  // setupControls({ camera, api, mounter })
  camera.position.z = 20

  let cubeBox1 = await makeCubeTexture([
    require('../Textures/cubemap/happy-mint/px.png'), require('../Textures/cubemap/happy-mint/nx.png'),
    require('../Textures/cubemap/happy-mint/py.png'), require('../Textures/cubemap/happy-mint/ny.png'),
    require('../Textures/cubemap/happy-mint/pz.png'), require('../Textures/cubemap/happy-mint/nz.png')
  ])
  // let cubeBox2 = await makeCubeTexture([
  //   require('../Textures/cubemap/green-love/px.png'), require('../Textures/cubemap/green-love/nx.png'),
  //   require('../Textures/cubemap/green-love/py.png'), requ-ire('../Textures/cubemap/green-love/ny.png'),
  //   require('../Textures/cubemap/green-love/pz.png'), require('../Textures/cubemap/green-love/nz.png')
  // ])
  // let cubeBox2 = await makeCubeTexture([
  //   require('../Textures/cubemap/grad-rainbow/nx.png'), require('../Textures/cubemap/grad-rainbow/nx.png'),
  //   require('../Textures/cubemap/grad-rainbow/nx.png'), require('../Textures/cubemap/grad-rainbow/nx.png'),
  //   require('../Textures/cubemap/grad-rainbow/nx.png'), require('../Textures/cubemap/grad-rainbow/nx.png')
  // ])

  let canvasCubeTexture = await makeCanvasCubeTexture({ api })

  cubeBox1.flipY = false
  // cubeBox2.flipY = false

  let parent = new THREE.Object3D()

  let cubeCam = makeCubeCam({ api, camera, parent: parent, renderer, scene })
  let cubeCamTexture = cubeCam.renderTarget.texture

  scene.background = canvasCubeTexture

  makeCenterPiece({ ...env, scene, parent: parent, cubeTexture: cubeCamTexture })
  makeFloatingBalls({ ...env, scene, parent: parent, renderer, camera, cubeTexture: cubeCamTexture })
  // parent.scale.x = -1
  scene.add(parent)

  var rAFID = 0
  var animate = function () {
    rAFID = requestAnimationFrame(animate)
    for (let kn in api.tasks) {
      api.tasks[kn]()
    }
    renderer.render(scene, camera)
  }

  api.teardown[rID] = () => {
    exited = true
    console.log('clean')
    cancelAnimationFrame(rAFID)
    mounter.removeChild(renderer.domElement)
    renderer.dispose()
    scene.dispose()
  }

  animate()

  return api
}

export const install = ({ mounter, vm }) => {
  let api = {
    tasks: {},
    teardown: {}
  }

  api.clean = () => {
    for (let kn in api.tasks) {
      delete api.tasks[kn]
    }
    for (let kn in api.teardown) {
      api.teardown[kn]()
    }
  }

  setupBase({ api, mounter, vm })

  return api
}

export const BallyGLSL = {
  vert: glsl`
// Classic Perlin 2D Noise
// by Stefan Gustavson
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec2 P){
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 *
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

uniform float mRefractionRatio;
uniform float mFresnelBias;
uniform float mFresnelScale;
uniform float mFresnelPower;

uniform float time;

varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 funPos = position;
  float cx = cnoise(normal.x + vec2(position.x * 0.11) + time) * 0.1;
  float cy = cnoise(normal.y + vec2(position.y * 0.12) + time) * 0.1;
  float cz = cnoise(normal.z + vec2(position.z * 0.13) + time) * 0.1;
  funPos.x += funPos.x * cx;
  funPos.y += funPos.y * cy;
  funPos.z += funPos.z * cz;

  vec4 mvPosition = modelViewMatrix * vec4( funPos, 1.0 );
  vec4 worldPosition = modelMatrix * vec4( funPos, 1.0 );

  vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );

  vec3 I = worldPosition.xyz - cameraPosition;

  vReflect = reflect( I, worldNormal );
  vRefract[0] = refract( normalize( I ), worldNormal, mRefractionRatio );
  vRefract[1] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.99 );
  vRefract[2] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.98 );
  vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower );

  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = 10.0;
}
  `,
  frag: glsl`
uniform samplerCube tCube;
uniform sampler2D tDudv;
uniform float time;

varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;
varying vec2 vUv;

uniform bool useDudv;

void main() {
  vec3 tRefract0 = vRefract[0];
  vec3 tRefract1 = vRefract[1];
  vec3 tRefract2 = vRefract[2];

  if (useDudv) {
    float waveStrength = 0.12;
    // simple distortion (ripple) via dudv map (see https://www.youtube.com/watch?v=6B7IF6GOu7s)
    vec2 distortedUv = texture2D( tDudv, vec2( vUv.x, vUv.y ) ).rg * waveStrength;
    distortedUv = vUv.xy + vec2( distortedUv.x, distortedUv.y );
    vec2 distortion = ( texture2D( tDudv, distortedUv * 0.25 ).rg * 2.0 - 1.0 ) * waveStrength;

    tRefract0.xy += distortion;
    tRefract1.xy += distortion;
    tRefract2.xy += distortion;
  }

  vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );
  // vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );
  vec4 refractedColor = vec4(1.0);

  refractedColor.r = textureCube( tCube, vec3( tRefract0.x, tRefract0.yz ) ).r;
  refractedColor.g = textureCube( tCube, vec3( tRefract1.x, tRefract1.yz ) ).g;
  refractedColor.b = textureCube( tCube, vec3( tRefract2.x, tRefract2.yz ) ).b;

  // refractedColor.r = textureCube( tCube, vec3( -tRefract0.x, tRefract0.yz ) ).r;
  // refractedColor.g = textureCube( tCube, vec3( -tRefract1.x, tRefract1.yz ) ).g;
  // refractedColor.b = textureCube( tCube, vec3( -tRefract2.x, tRefract2.yz ) ).b;

  // vec2 coord = gl_PointCoord.xy - vec2(0.5);
  // if (length(coord) > 0.5) {
  //   discard;
  // } else {
  //   gl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );
  // }
  float colorModifier = 0.1;
  gl_FragColor = mix( refractedColor, reflectedColor + colorModifier, clamp( vReflectionFactor, 0.0, 1.0 ) );
}
  `

}
