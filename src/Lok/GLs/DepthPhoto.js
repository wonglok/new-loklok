export const getID = () => {
  return `_${(Math.random() * 10000000000).toFixed(0)}`
}

let THREE = {
  ...require('three'),
  ...require('three/examples/jsm/controls/OrbitControls.js'),
  ...require('three/examples/jsm/loaders/SVGLoader.js')
}
let glsl = require('glslify')

export const setupDepthPhoto = async ({ api, mounter, parent }) => {
  let dimensions = new THREE.Vector2(1, 1)
  let loader = new THREE.TextureLoader()
  let mouse = new THREE.Vector2()
  // let depthImage64 = await loadDepth(require('../Textures/depth-images/i6.jpg'))
  // exiftool -b -MPImage2 i1.jpg > i1_depth.jpg
  let textures = [
    {
      img: loader.load(require('../Textures/depth-images/i7.jpg'), (t) => {
        dimensions.x = t.image.width
        dimensions.y = t.image.height
      }),
      depth: loader.load(require('../Textures/depth-images/i7_depth.jpg'))
    }
  ]
  let photo = textures[0]
  let geo = new THREE.PlaneBufferGeometry(10.0 * 2, 13.5 * 2, 120, 128)
  let mat = new THREE.ShaderMaterial({
    uniforms: {
      scale: { value: 0.025 },
      focus: { value: 0.5 },
      mouse: { value: mouse },
      dimensions: { value: dimensions },
      img: { value: photo.img },
      depth: { value: photo.depth }
    },
    vertexShader: glsl`
    varying vec2 vUv;
      void main (void) {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: glsl`
      uniform sampler2D img;
      uniform sampler2D depth;
      uniform float scale;
      uniform float focus;
      uniform vec2 mouse;
      uniform vec2 dimensions;
      varying vec2 vUv;
      void main (void) {
        float aspect = dimensions.x / dimensions.y;
        vec2 scale2 = vec2(scale * min(1.0, 1.0 / aspect), scale * min(1.0, aspect)) * vec2(1, -1) * vec2(1);
        vec2 mapCords = vUv;

        float height = texture2D(depth, mapCords).r;
        height = height * -1.0 + focus;
        vec2 dis = mouse;
        vec2 disCords = vUv;
        disCords += mouse * height * scale2;
        gl_FragColor = texture2D(img, disCords);
      }
    `
  })
  let mesh = new THREE.Mesh(geo, mat)
  parent.add(mesh)

  mounter.onmousemove = (e) => {
    mouse.x = e.clientX / window.innerWidth
    mouse.y = e.clientY / window.innerHeight

    mouse.x = mouse.x * 2.0 - 1.0
    mouse.y = mouse.y * 2.0 - 1.0
  }
  mounter.ontouchstart = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }
  mounter.ontouchmove = (e) => {
    e.preventDefault()
    e.stopPropagation()
    mouse.x = e.targetTouches[0].clientX / window.innerWidth
    mouse.y = e.targetTouches[0].clientY / window.innerHeight

    mouse.x = mouse.x * 2.0 - 1.0
    mouse.y = mouse.y * 2.0 - 1.0
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

  setupDepthPhoto({ ...env })
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
