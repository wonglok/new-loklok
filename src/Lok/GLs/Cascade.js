import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'

export const getID = () => {
  return `_${(Math.random() * 10000000000).toFixed(0)}`
}

let THREE = {
  ...require('three'),
  ...require('three/examples/jsm/controls/OrbitControls.js'),
  ...require('three/examples/jsm/loaders/SVGLoader.js'),

  ...require('three/examples/jsm/controls/OrbitControls.js'),
  ...require('three/examples/jsm/postprocessing/EffectComposer.js'),
  ...require('three/examples/jsm/postprocessing/RenderPass.js'),
  ...require('three/examples/jsm/postprocessing/ShaderPass.js'),
  ...require('three/examples/jsm/postprocessing/UnrealBloomPass.js')
}

export const glsl = require('glslify')

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

export const setupControls = async ({ camera, mounter, api }) => {
  let rID = getID()
  let control = new THREE.OrbitControls(camera, mounter)

  api.tasks[rID] = () => {
    control.update()
  }
  api.teardown[rID] = () => {
  }
}

export const makeFontGeo = ({ text, width }) => {
  return new Promise((resolve) => {
    // var loader = new THREE.FontLoader()
    // loader.load(, function (font) {
    // eslint-disable-next-line
    var font = require('../Fonts/helvetiker_regilar.typeface.json');
    font = new THREE.Font(font)
    var geometry = new THREE.TextGeometry(text, {
      font: font,
      size: width * 0.15,
      height: 2,
      curveSegments: 16,
      bevelEnabled: true,
      bevelThickness: 0.2,
      bevelSize: 0.11,
      bevelOffset: 0,
      bevelSegments: 2
    })
    resolve(geometry)
    // })
  })
}

export const loadTexture = (img) => {
  let items = img
  let texture = new THREE.TextureLoader()

  return new Promise((resolve) => {
    texture.load(items, (texture) => {
      resolve(texture)
    })
  })
}

export const makeLogo = async ({ cubeTexture, parent, idx = 0 }) => {
  let geo = new THREE.CircleBufferGeometry(5, 64, 64)
  // let loader = new THREE.TextureLoader()
  // let logo = loader.load(require('../Textures/demos/face1.svg'), () => {
  // })

  let logos = [
    await loadTexture(require('../Textures/demos/lok.png'))
    // await loadTexture(require('../Textures/demos/doggo.png'))
    // await loadTexture(require('../Textures/demos/cat.png'))
  ]

  var mat = new THREE.MeshBasicMaterial({ color: 0xffffff, map: logos[idx % logos.length], transparent: false, opacity: 1.0 })
  mat.color = new THREE.Color(0xffffff)
  mat.refractionRatio = 0.9
  mat.reflectionRatio = 0.9

  mat.envMap = cubeTexture
  // mat.envMap.mapping = THREE.CubeReflectionMapping
  mat.envMap.mapping = THREE.CubeRefractionMapping
  mat.needsUpdate = true

  var mesh = new THREE.Mesh(geo, mat)
  // mesh.scale.x = 0.5
  // mesh.scale.y = 0.5
  // mesh.scale.z = 0.5
  mesh.position.x = -8

  // parent.add(mesh)
  parent.add(mesh)

  return mesh
}

export const visibleHeightAtZDepth = (depth, camera) => {
  // compensate for cameras not positioned at z=0
  const cameraOffset = camera.position.z
  if (depth < cameraOffset) depth -= cameraOffset
  else depth += cameraOffset

  // vertical fov in radians
  const vFOV = camera.fov * Math.PI / 180

  // Math.abs to ensure the result is always positive
  return 2 * Math.tan(vFOV / 2) * Math.abs(depth)
}

export const visibleWidthAtZDepth = (depth, camera) => {
  const height = visibleHeightAtZDepth(depth, camera)
  return height * camera.aspect
}

export const makeCenterPiece = async ({ cubeTexture, parent, scene, camera }) => {
  // var geo = new THREE.TorusKnotGeometry(9 / 2, 1.2 / 1.5, 293, 20, 4, 5)
  // var geo = new THREE.TorusBufferGeometry(10, 3, 16, 100)
  // var geo = new THREE.TorusBufferGeometry(10, 1.5, 16, 100)
  // var geo = new THREE.SphereBufferGeometry(10, 128, 128)
  // var geo = new THREE.BoxBufferGeometry(10, 10, 10, 128, 128, 128)
  // var geo = new THREE.OctahedronGeometry(5, 2)
  let width = visibleWidthAtZDepth(camera.position.z, camera)

  let geo = await makeFontGeo({ text: 'Lok Lok', width })
  let light = new THREE.PointLight(0xda2865, 1, 100)
  light.position.z = 10
  scene.add(light)
  var mat = new THREE.MeshBasicMaterial({ color: 0xbababa, envMap: cubeTexture, opacity: 0.9, transparent: true })
  // mat.map = await loadTexture(require('../Textures/demos/cat.png'))
  mat.color = new THREE.Color(`#fff`)
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

  geo.computeBoundingSphere()

  console.log(mesh)

  mesh.position.x = geo.boundingSphere.radius * -0.5

  // parent.add(mesh)
  parent.add(mesh)

  return mesh
}

export const setupBloomComposer = ({ renderer, scene, camera, api }) => {
  var rID = getID()
  var params = {
    exposure: 1,
    bloomThreshold: 0.56,
    bloomStrength: 1.1,
    bloomRadius: 0.95
  }
  var gui = new GUI()
  var folder = gui.addFolder('Bloom Parameters')
  folder.add(params, 'exposure', 0.1, 2).onChange(function (value) {
    renderer.toneMappingExposure = Math.pow(value, 4.0)
  })
  folder.add(params, 'bloomThreshold', 0.0, 1.0).onChange(function (value) {
    bloomPass.threshold = Number(value)
  })
  folder.add(params, 'bloomStrength', 0.0, 10.0).onChange(function (value) {
    bloomPass.strength = Number(value)
  })
  folder.add(params, 'bloomRadius', 0.0, 1.0).step(0.01).onChange(function (value) {
    bloomPass.radius = Number(value)
  })
  folder.open()
  // var ENTIRE_SCENE = 0
  var BLOOM_SCENE = 1

  var bloomLayer = new THREE.Layers()
  bloomLayer.set(BLOOM_SCENE)

  var renderScene = new THREE.RenderPass(scene, camera)
  var bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth * 2, window.innerHeight * 2), 1.5, 0.4, 0.85)
  bloomPass.threshold = params.bloomThreshold
  bloomPass.strength = params.bloomStrength
  bloomPass.radius = params.bloomRadius

  //   let flipPass = new THREE.ShaderPass({
  //     uniforms: {
  //       flip: { value: 1.0 },
  //       tDiffuse: { value: null },
  //       opacity: { value: 1.0 }
  //     },
  //     vertexShader: `
  // varying vec2 vUv;
  // void main() {
  // vUv = uv;
  // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  // }
  //     `,
  //     fragmentShader: `
  // uniform float opacity;
  // uniform float flip;
  // uniform sampler2D tDiffuse;
  // varying vec2 vUv;
  // void main() {
  // vec4 texel = texture2D( tDiffuse, vUv );

  // if (flip >= 0.0) {
  // gl_FragColor = vec4(flip - texel.rgb, opacity);
  // } else {
  // gl_FragColor = vec4(texel.rgb - 1.0 - flip, opacity);
  // }
  // }
  //     `
  //   })
  //   flipPass.renderToScreen = true
  //   flipPass.uniforms.flip = {
  //     get value () {
  //       return self.postProcessSettings.flipColor
  //     }
  //   }

  var bloomComposer = new THREE.EffectComposer(renderer)
  bloomComposer.renderToScreen = true
  bloomComposer.addPass(renderScene)
  bloomComposer.addPass(bloomPass)
  // bloomComposer.addPass(flipPass)

  api.teardown[rID] = () => {
    gui.destroy()
  }

  return bloomComposer
}

export const waitForFont = async ({ name }) => {
  let FontFaceObserver = require('fontfaceobserver')
  var font = new FontFaceObserver(name)
  return new Promise((resolve) => {
    font.load(null, 3000).then(() => {
      resolve()
    }, () => {
    })
  })
}

export const FSCalc = ({ zPos, camera }) => {
  var cameraZ = camera.position.z
  var distance = cameraZ - zPos
  var aspect = window.innerWidth / window.innerHeight
  var vFov = camera.fov * Math.PI / 180
  var planeHeightAtDistance = 2 * Math.tan(vFov / 2) * distance
  var planeWidthAtDistance = planeHeightAtDistance * aspect

  /*
  let dist = camera.position.z - mesh.position.z
  let height = ... // desired height to fit
  camera.fov = 2 * Math.atan(height / (2 * dist)) * (180 / Math.PI)
  camera.updateProjectionMatrix()
  */

  return {
    aspect: planeWidthAtDistance / planeHeightAtDistance,
    vmin: Math.min(planeWidthAtDistance, planeHeightAtDistance),
    vmax: Math.max(planeWidthAtDistance, planeHeightAtDistance),
    width: planeWidthAtDistance,
    height: planeHeightAtDistance
  }
}

export const mobileAndTabletcheck = () => {
  var check = false
  let a = navigator.userAgent || navigator.vendor || window.opera
  // eslint-disable-next-line
  if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
    check = true
  }

  return check
}

export const makeWords = async ({ api, mounter, vm, parent, camera, scene, texture }) => {
  let rID = getID()
  // require('../Fonts/cwTeXKai/font.css')
  // await waitForFont({ name: 'cwTeXKai' })
  let TextCanvas = require('text-canvas')
  // font: cwTeXKai
  // words emoji

  function setupWord ({ priWord = '黃', secWord = '樂' }) {
    let primaryWord2D = new TextCanvas(priWord, { fontFamily: 'cwTeXKai', wordWrap: 300, textColor: 'black', textAlign: 'center' }, 32)
    let secondaryWord2D = new TextCanvas(secWord, { fontFamily: 'cwTeXKai', wordWrap: 300, textColor: 'black', textAlign: 'center' }, 32)
    let primaryWord = new THREE.CanvasTexture(primaryWord2D.render())
    let secondaryWord = new THREE.CanvasTexture(secondaryWord2D.render())
    primaryWord.needsUpdate = true
    secondaryWord.needsUpdate = true
    return {
      primaryWord,
      secondaryWord
    }
  }
  let { primaryWord, secondaryWord } = setupWord({ priWord: '💎', secWord: '⚡️' })

  // let maxVideoSize = 1280
  // async function setupCamera ({ mounter }) {
  //   let video = document.createElement('video')
  //   // const video = document.getElementById('video')
  //   video.width = maxVideoSize
  //   video.height = maxVideoSize

  //   mounter.appendChild(video)
  //   video.style.position = 'fixed'
  //   video.style.top = '20px'
  //   video.style.right = '20px'

  //   video.style.zIndex = '100'
  //   video.style.opacity = 1.0
  //   video.style.width = '150px'
  //   video.style.height = '150px'
  //   // video.style.transform = 'scaleX(-1)'

  //   if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  //     const mobile = mobileAndTabletcheck()
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       'audio': false,
  //       'video': {
  //         facingMode: 'user',
  //         width: mobile ? undefined : maxVideoSize,
  //         height: mobile ? undefined : maxVideoSize
  //       }
  //     })
  //     video.srcObject = stream

  //     // let enableInlineVideo = require('iphone-inline-video').default
  //     // enableInlineVideo(video)
  //     video.setAttribute('playsinline', 'playsinline')
  //     video.setAttribute('webkit-playsinline', 'webkit-playsinline')
  //     video.addEventListener('touchstart', () => {
  //       video.play()
  //     })
  //     video.addEventListener('click', () => {
  //       video.play()
  //     })

  //     return new Promise(resolve => {
  //       video.onloadedmetadata = () => {
  //         video.play()
  //         resolve(video)
  //       }
  //     })
  //   } else {
  //     const errorMessage = 'This browser does not support video capture, or this device does not have a camera'
  //     alert(errorMessage)
  //     return Promise.reject(errorMessage)
  //   }
  // }

  // let video = await setupCamera({ mounter })

  // let videoTexture = new THREE.VideoTexture(video)
  // videoTexture.format = THREE.RGBFormat
  // videoTexture.minFilter = THREE.LinearFilter
  // videoTexture.magFilter = THREE.LinearFilter
  let canvas = texture.image

  let video = {
    videoWidth: canvas.width,
    videoHeight: canvas.height,
    width: canvas.width,
    height: canvas.height
  }

  let fs = FSCalc({ camera: camera, zPos: 0 })
  window.addEventListener('resize', () => {
    fs = FSCalc({ camera: camera, zPos: 0 })
  }, false)

  let dpi = {
    get value () {
      // return 1.5
      return window.devicePixelRatio > 1.5 ? 1.5 : window.devicePixelRatio
    }
  }

  let w = dpi.value * 640
  let h = dpi.value * 640 * video.videoHeight / video.videoWidth

  w = fs.height / (video.videoHeight / video.videoWidth)
  h = fs.height
  let settings = {
    get pointSize () {
      return 1.5 * dpi.value
    },
    density: 2
  }

  let nx = video.videoWidth * 0.2
  nx = w * settings.density
  let ny = video.videoHeight * 0.2
  ny = h * settings.density

  let geometry = new THREE.PlaneBufferGeometry(w, h, nx, ny)
  let res = new THREE.Vector2()
  let screen = new THREE.Vector2()

  let uniforms = {
    dpi: {
      get value () {
        return dpi.value || 1.0
      }
    },
    resolution: {
      get value () {
        res.x = window.innerWidth
        res.y = window.innerHeight
        return res
      }
    },
    screen: {
      get value () {
        screen.x = fs.width
        screen.y = fs.height
        return screen
      }
    },
    video: {
      value: texture
    },
    primaryWord: {
      value: primaryWord
    },
    secondaryWord: {
      value: secondaryWord
    },
    time: {
      value: 0
    },
    pointSize: {
      get value () {
        return Math.min(w * settings.pointSize / nx, h * settings.pointSize / ny)
      }
    }
  }

  let dom = vm.$refs['change-name']
  if (dom) {
    dom.addEventListener('click', () => {
      let priWord = window.prompt('Family name?') || '黃'
      let secWord = window.prompt('Given name?') || '樂'
      let { primaryWord, secondaryWord } = setupWord({ priWord, secWord })
      uniforms.primaryWord.value = primaryWord
      uniforms.secondaryWord.value = secondaryWord
    })
  }

  let material = new THREE.ShaderMaterial({
    vertexShader: glsl`
#include <common>

precision lowp float;
uniform vec2 resolution;
uniform float pointSize;
uniform vec2 screen;

varying vec3 vPos;
varying vec2 vUv;
uniform float time;
uniform lowp sampler2D video;
uniform lowp float dpi;

mat3 rotateX(float rad) {
float c = cos(rad);
float s = sin(rad);
return mat3(
    1.0, 0.0, 0.0,
    0.0, c, s,
    0.0, -s, c
);
}

mat3 rotateY(float rad) {
float c = cos(rad);
float s = sin(rad);
return mat3(
    c, 0.0, -s,
    0.0, 1.0, 0.0,
    s, 0.0, c
);
}

mat3 rotateZ(float rad) {
float c = cos(rad);
float s = sin(rad);
return mat3(
    c, s, 0.0,
    -s, c, 0.0,
    0.0, 0.0, 1.0
);
}


void main (void) {
vec3 newPos = position;
// newPos.z += tan(newPos.x * 0.01 + time * -0.0005);
// newPos.y += tan(newPos.y * 10.0 + time);
// newPos = rotateZ(time) * newPos;

vPos = position;
vUv = uv;

vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
vec4 outputPos = projectionMatrix * mvPosition;

vec4 vidColor = texture2D(video, uv);
vidColor.rgb = 1.0 - vidColor.rgb;

float vidAvg = (vidColor.r + vidColor.g + vidColor.b) / 3.0;

float finalAvg = (vidAvg);
// finalAvg = finalAvg * finalAvg;
// finalAvg = 1.0;
// outputPos.z = -finalAvg * 20.0;

gl_Position = outputPos;

float aspect = resolution.y / resolution.x;
float sy = resolution.y / screen.y;
float sa = 242.0 / -mvPosition.z;

if (aspect > 1.0) {
  gl_PointSize = finalAvg * pointSize * dpi / 10.0 * sy * sa;
} else {
  gl_PointSize = finalAvg * pointSize * dpi / 10.0 * sy * sa;
}

// gl_PointSize = (1.0 / -mvPosition.z);
// if (aspect > 1.0) {
//   gl_PointSize = screen.y / 10.0 / aspect;
// } else {
//   gl_PointSize = screen.y / 10.0 * aspect;
// }
}`,
    fragmentShader: glsl`
vec4 Desaturate(vec3 color, float Desaturation)
{
  vec3 grayXfer = vec3(0.3, 0.59, 0.11);
  vec3 gray = vec3(dot(grayXfer, color));
  return vec4(mix(color, gray, Desaturation), 1.0);
}

precision lowp float;
uniform lowp sampler2D video;

uniform lowp sampler2D primaryWord;
uniform lowp sampler2D secondaryWord;
varying vec3 vPos;
varying vec2 vUv;
void main () {
  vec2 glpc = gl_PointCoord.xy;
  glpc.y = 1.0 - glpc.y;
  glpc.y *= 1.23;
  // vec2 offset = vec2(0.35, 0.35);
  vec4 vidColor = texture2D(video, vUv);

  // 灰階
  // vidColor.rgb = vec3((vidColor.r + vidColor.g + vidColor.b) / 3.0);

  // 黑白
  // vidColor.rgb = vec3(0.0);

  // 淡彩
  // vidColor.rgb = Desaturate(vidColor.rgb, 0.75).rgb;

  vec3 vidAvg = vec3((vidColor.r + vidColor.g + vidColor.b) / 3.0);

  vec4 finalColor = vec4(vec3(vidAvg), 1.0);

  float avg = (vidColor.x + vidColor.y + vidColor.z) / 3.0;

  if (avg > 0.5) {
    vec4 fColor = texture2D(primaryWord, glpc);
    gl_FragColor = vec4((1.0 - fColor.rgb) * finalColor.rgb, finalColor.a * fColor.a);
    gl_FragColor = fColor.rgba;
  } else {
    vec4 wColor = texture2D(secondaryWord, glpc);
    gl_FragColor = vec4((1.0 - wColor.rgb) * finalColor.rgb, finalColor.a * wColor.a);
    gl_FragColor = wColor.rgba;
  }

}
    `,
    uniforms,
    transparent: true
  })

  let points = new THREE.Points(geometry, material)
  parent.add(points)

  // let simpleMat = new THREE.MeshBasicMaterial({
  //   map: texture,
  //   opacity: 1,
  //   transparent: true
  // })
  // let plane = new THREE.Mesh(geometry, simpleMat)
  // plane.position.z = -0.1
  // parent.add(plane)

  api.teardown[rID] = () => {
    api.tasks[rID] = () => {
    }
  }
  api.tasks[rID] = () => {
    uniforms.time.value = window.performance.now()
    // videoTexture.needsUpdate = true
  }

  // scene.background = videoTexture
  scene.background = new THREE.Color('#fff')
}

export const setupBase = async ({ api, mounter, vm }) => {
  let rID = getID()
  let exited = false
  let rect = mounter.getBoundingClientRect()
  let poserAPI = false

  try {
    let poserModule = await import('../GLService/cam-pose.js')
    poserAPI = await poserModule.setup({ showPreview: true, mounter })
  } catch (e) {
  }

  let scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(75, rect.width / rect.height, 0.1, 1000)
  let renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  })
  let parent = new THREE.Object3D()

  // eslint-disable-next-line
  let env = {
    api,
    mounter,
    vm,
    get rect () {
      return rect
    },
    set rect (v) {
      rect = v
    },
    parent,
    camera,
    scene,
    renderer
  }

  renderer.setSize(rect.width, rect.height)
  renderer.setPixelRatio(window.devicePixelRatio > 1.5 ? window.devicePixelRatio : 1.5)
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

  // let camVideo = require('../GLService/cam-video.js').setup()
  // console.log(camVideo)

  let texture = await makeCanvasGradientTexture({ ...env, poserAPI, api, mounter })
  makeWords({ ...env, texture })

  scene.add(parent)

  // let composer = setupBloomComposer({ renderer, scene, camera, api })
  var rAFID = 0
  var animate = function () {
    rAFID = requestAnimationFrame(animate)
    for (let kn in api.tasks) {
      api.tasks[kn]()
    }

    // camVideo.update()

    renderer.render(scene, camera)

    // if (composer) {
    //   composer.render()
    // } else {
    // }
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

export const makeCanvasGradientTexture = async ({ poserAPI, api, mounter }) => {
  var rID = getID()

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

      this.maxAge = 350
      this.radius = 0.1 * this.size
      // this.radius = 0.15 * 1000

      this.speed = 1.33 / this.maxAge
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

      // var gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height)
      // var gradient = this.ctx.createRadialGradient(this.width / 2, this.height / 2, 0, this.width / 2, this.height / 2, this.width / 2)

      // Add three color stops
      // gradient.addColorStop(0, 'rgba(255,255,255,1.0)')
      // gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)')
      // gradient.addColorStop(1, 'rgba(255,255,255,1.0)')
      // this.gradient = gradient
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
      // this.ctx.fillStyle = 'hsl(61, 100%, 100%)'
      // this.ctx.fillStyle = 'white'

      this.ctx.fillStyle = 'white'

      // this.ctx.fillStyle = this.gradient
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

      // color = `${(intensity * 255).toFixed(0)}, 65%, 55%`
      color = `${(intensity * 255).toFixed(0)}, 65%, 5%`

      let offset = this.size * 5
      ctx.shadowOffsetX = offset // (default 0)
      ctx.shadowOffsetY = offset // (default 0)
      ctx.shadowBlur = radius // (default 0)
      ctx.shadowColor = `hsla(${color},${0.35 * intensity})` // (default transparent black)

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
      // t.addTouch(mouse)
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

  let t = new TouchTexture()
  var touchTextures = [
    t
  ]

  let rAFID = 0
  function runAI () {
    let touchAdder = ({ pose, info, name }) => {
      let pointer = pose.keypoints.find(k => k.part === name)
      if (pointer && pointer.score > 0.15) {
        for (var i = 0; i < 1; i++) {
          t.addTouch({
            x: (info.video.width - pointer.position.x) / info.video.width,
            y: 1 - (pointer.position.y / info.video.height)
          })
        }
      }
    }
    let loop = async () => {
      // t.addTouch({
      //   x: Math.random(),
      //   y: Math.random()
      // })

      if (poserAPI) {
        let info = await poserAPI.update()
        if (info.poses) {
          let poses = info.poses
          if (poses[0]) {
            touchAdder({ pose: poses[0], info, name: 'leftWrist' })
            touchAdder({ pose: poses[0], info, name: 'nose' })
            touchAdder({ pose: poses[0], info, name: 'rightWrist' })
          }
        }
      }
      rAFID = requestAnimationFrame(loop)
    }
    rAFID = requestAnimationFrame(loop)
  }
  runAI()

  // function runDiff () {
  //   let loop = () => {
  //     if (poserAPI) {
  //       let info = poserAPI.update()
  //       t.addTouch({
  //         x: info.output.x,
  //         y: info.output.y
  //       })
  //       rAFID = requestAnimationFrame(loop)
  //     }
  //   }
  //   rAFID = requestAnimationFrame(loop)
  // }
  // runDiff()

  api.teardown[rID] = () => {
    cancelAnimationFrame(rAFID)
  }
  api.tasks[rID] = async () => {
    // touchTextures.forEach(e => {
    //   e.update()
    // })
    t.update()
    canvasTexture.needsUpdate = true
  }

  window.addEventListener('mousemove', on.onMouseMove, { passive: false })
  window.addEventListener('touchmove', on.onTouchMove, { passive: false })

  let canvasTexture = new THREE.CanvasTexture(t.canvas)
  return canvasTexture
}
