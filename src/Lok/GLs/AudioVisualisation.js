export const getID = () => {
  return `_${(Math.random() * 10000000000).toFixed(0)}`
}

let THREE = {
  ...require('three'),
  ...require('three/examples/jsm/controls/OrbitControls.js'),
  ...require('three/examples/jsm/loaders/SVGLoader.js')
}
let glsl = require('glslify')
let mp3History = require('../GLService/mp3-history.js').setup

export const setupAudioVisualisation = async ({ api, vm, scene, mounter, renderer, camera, parent }) => {
  let rID = getID()

  let audio = false
  let uniforms = {
    tex: { value: null }
  }
  let mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: glsl`
    uniform sampler2D tex;
    varying float taller;
    void main (void) {
      vec2 uvv = uv;
      uvv.x *= 0.75;
      vec4 displacement = texture2D(tex, uvv);
      vec3 nPos = position;
      nPos.z += displacement.x * 8.0;
      taller = displacement.x;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(nPos, 1.0);
      gl_PointSize = 4.0;
    }
  `,
    fragmentShader: glsl`
      varying float taller;
      void main (void) {
        vec2 ps = gl_PointCoord.xy;
        if (length(ps - 0.5) < 0.5) {
          float rtaller = 1.0 - taller;
          gl_FragColor = vec4(1.0 * (rtaller), 1.0 * (rtaller), 1.0, taller + 0.5);
        } else {
          discard;
        }
      }
    `
  })
  scene.background = new THREE.Color('#bababa')

  var controls = new THREE.OrbitControls(camera, renderer.domElement)

  let geo = new THREE.PlaneBufferGeometry(15, 35, 128, 60 * 5)

  let points = new THREE.Points(geo, mat)
  points.rotation.z = Math.PI * 1.5
  points.rotation.x = Math.PI * -0.25
  parent.add(points)
  // eslint-disable-next-line

  vm.init = () => {
    if (!audio) {
      // eslint-disable-next-line
      audio = mp3History({ url: require('file-loader!../Audio/XiaoQiao/huan-mei-lu-120.m4a') })
      audio.play()
      setTimeout(() => {
        audio.play()
      })
    }
  }

  // mounter.addEventListener('click', () => {
  //   if (!audio) {
  //     // eslint-disable-next-line
  //     audio = mp3History({ url: require('file-loader!../Audio/XiaoQiao/huan-mei-lu-120.m4a') })
  //     audio.play()
  //   }
  // })
  // mounter.addEventListener('touchstart', () => {
  //   if (!audio) {
  //     // eslint-disable-next-line
  //     audio = mp3History({ url: require('file-loader!../Audio/XiaoQiao/huan-mei-lu-120.m4a') })
  //     audio.play()
  //   }
  // })
  api.tasks[rID] = () => {
    if (controls) {
      controls.update()
    }
    if (audio) {
      let { texture } = audio.update()
      uniforms.tex.value = texture
    }
  }
  api.teardown[rID] = () => {
    audio.pause()
  }
}

export const setupBase = async ({ api, mounter, vm }) => {
  let rID = getID()
  let exited = false
  let rect = mounter.getBoundingClientRect()

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

  setupAudioVisualisation({ ...env })
  camera.position.z = 20

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
