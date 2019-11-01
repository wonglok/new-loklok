let THREE = {
  ...require('three'),
  ...require('three/examples/jsm/controls/OrbitControls.js')
}

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

export const getID = () => {
  return `_${(Math.random() * 10000000000).toFixed(0)}`
}

export const makeCubeCam = async () => {

}

export const woozy = async ({ scene, parent, api }) => {
  let rID = getID()
  // var geometry = new THREE.SphereBufferGeometry(5.5, 128, 128)
  var geometry = new THREE.SphereBufferGeometry(5.5, 128, 128)
  // var geometry = new THREE.TorusKnotGeometry(9 / 2, 1.2 / 2, 293, 20, 3, 4)

  let cubeTexutre = await makeCubeTexture([
    require('../Textures/cubemap/happy-mint/px.png'), require('../Textures/cubemap/happy-mint/nx.png'),
    require('../Textures/cubemap/happy-mint/py.png'), require('../Textures/cubemap/happy-mint/ny.png'),
    require('../Textures/cubemap/happy-mint/pz.png'), require('../Textures/cubemap/happy-mint/nz.png')
  ])

  scene.background = cubeTexutre

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
  uniforms.tCube.value = cubeTexutre

  let material = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    uniforms,
    // npm i raw-loader -S
    // eslint-disable-next-line
    vertexShader: require('raw-loader!../Shaders/SolidPerlin.vert').default,
    // eslint-disable-next-line
    fragmentShader: require('raw-loader!../Shaders/SolidPerlin.frag').default
  })

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
    cubeTexutre.dispose()
    api.tasks[rID] = () => {}
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
    uniforms.time.value = time

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

  api.teardown[rID] = () => {
    api.tasks[rID] = () => {}
  }

  api.tasks[rID] = () => {
    control.update()
  }
}

export const setupBase = async ({ api, mounter, vm }) => {
  let rID = getID()
  let exited = false

  let rect = mounter.getBoundingClientRect()
  var scene = new THREE.Scene()
  var camera = new THREE.PerspectiveCamera(75, rect.width / rect.height, 0.1, 1000)
  var renderer = new THREE.WebGLRenderer({
    alpha: true
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

  setupControls({ camera, api, mounter })
  camera.position.z = 20

  let parent = new THREE.Object3D()
  woozy({ scene, parent, api })
  parent.scale.x = -1
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
    for (let kn in api.teardown) {
      api.teardown[kn]()
    }
  }

  setupBase({ api, mounter, vm })

  return api
}
