require('requestidlecallback')

export const getID = () => {
  return `_${(Math.random() * 10000000000).toFixed(0)}`
}

function isAndroid () {
  return /Android/i.test(navigator.userAgent)
}

function isiOS () {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export function isMobile () {
  return isAndroid() || isiOS()
}

let THREE = {
  ...require('three'),
  ...require('three/examples/jsm/controls/OrbitControls.js'),
  ...require('three/examples/jsm/loaders/SVGLoader.js'),

  ...require('three/examples/jsm/controls/OrbitControls.js'),

  ...require('three/examples/jsm/postprocessing/EffectComposer.js'),
  ...require('three/examples/jsm/postprocessing/RenderPass.js'),
  ...require('three/examples/jsm/postprocessing/ShaderPass.js'),
  // ...require('three/examples/jsm/postprocessing/UnrealBloomPass.js'),

  ...require('three/examples/jsm/loaders/GLTFLoader.js')
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
export const makeCubeCam = ({ api, parent, sphereBG = false, renderer, scene }) => {
  let rID = getID()
  var cubeCamera = new THREE.CubeCamera(0.1, 100000000000000, 1024)
  scene.add(cubeCamera)

  // var cam = webcam.setup()

  var sphereGeo = new THREE.SphereBufferGeometry(5000, 64, 64)
  var chromeMaterial = new THREE.MeshLambertMaterial({ color: 0xeeeeee, side: THREE.BackSide })
  var sphere = new THREE.Mesh(sphereGeo, chromeMaterial)
  scene.add(sphere)

  if (sphereBG) {
    scene.add(sphereBG)
  }

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

export const makeWoozyMat = async ({ cubeTexture, api, woozy = 1 }) => {
  let rID = getID()

  var uniforms = {
    'uWozzy': { value: woozy },
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

export const loadGLB = ({ file }) => {
  return new Promise((resolve) => {
    var loader = new THREE.GLTFLoader()
    loader.load(file, (glb) => {
      let scene = glb.scenes[0]
      resolve(scene)
    })
  })
}

export const makeOneEmoji = async ({ mapper, file, camera, api, parent, offset, rotate, width, height }) => {
  let rID = getID()
  let emojiScene = await loadGLB({ file })

  // let material = await makeWoozyMat({ cubeTexture, api, woozy: 0 })

  // let mapper = await makeCanvasCubeTexture({ api })

  var mat = new THREE.MeshBasicMaterial({ opacity: 0.9, transparent: true })
  // mat.map = await loadTexture(require('../Textures/demos/cat.png'))
  mat.color = new THREE.Color(`#fff`)
  mat.refractionRatio = 0.8
  mat.reflectionRatio = 0.8

  mat.envMap = mapper
  // mat.envMap.mapping = THREE.CubeReflectionMapping
  mat.envMap.mapping = THREE.CubeRefractionMapping
  mat.needsUpdate = true

  let first = emojiScene.children[0].children[0]
  first.geometry.computeBoundingSphere()
  let geoWidth = first.geometry.boundingSphere.radius * 2.0

  let min = Math.min(width, height)
  let sizer = min / geoWidth / 100 / 1.5
  emojiScene.scale.set(sizer, sizer, sizer)
  // emojiScene.position.y =
  emojiScene.position.add(offset)
  // console.log(sizer, geoWidth, width)

  emojiScene.children[0].children.forEach((e) => {
    e.material = mat
  })

  parent.add(emojiScene)

  api.teardown[rID] = () => {
  }
  api.tasks[rID] = () => {
    let time = window.performance.now() * 0.001
    if (emojiScene) {
      emojiScene.rotation.x = rotate.x
      emojiScene.rotation.y = rotate.y
      emojiScene.rotation.z = rotate.z

      emojiScene.rotation.x = Math.sin(time * 2.0) * 0.15
      emojiScene.rotation.z = Math.sin(time * 2.0) * 0.15
    }
    // let time = window.performance.now() * 0.001
    // console.log(time)
  }
}

export const makeEmoji = async ({ mapper, scene, parent, api, camera, cubeTexture }) => {
  let width = visibleWidthAtZDepth(camera.position.z, camera)
  let height = visibleHeightAtZDepth(camera.position.z, camera)
  let min = Math.min(height, width)
  // eslint-disable-next-line

  makeOneEmoji({
    camera,
    api,
    parent,
    mapper,
    // eslint-disable-next-line
    file: require('file-loader!../Model/emojipack-glb/hands/winwin.glb'),
    width,
    height,
    offset: new THREE.Vector3(0, min * -0.15, -5),
    rotate: new THREE.Vector3(0, 0, 0)
  })
  makeOneEmoji({
    camera,
    api,
    parent,
    mapper,
    // eslint-disable-next-line
    file: require('file-loader!../Model/emojipack-glb/hands/rock.glb'),
    width,
    height,
    offset: new THREE.Vector3(min * 0.15, min * -0.15, -5),
    rotate: new THREE.Vector3(0, 0, 0)
  })

  makeOneEmoji({
    camera,
    api,
    parent,
    mapper,
    // eslint-disable-next-line
    file: require('file-loader!../Model/emojipack-glb/hands/thumbs-up.glb'),
    width,
    height,
    offset: new THREE.Vector3(-min * 0.15, min * -0.15, -5),
    rotate: new THREE.Vector3(0, 0, 0)
  })
}

export const makeFloatingBalls = async ({ scene, parent, api, cubeTexture }) => {
  let rID = getID()

  // var geometry = new THREE.SphereBufferGeometry(5.5, 128, 128)
  var geometry = new THREE.SphereBufferGeometry(5.5, 128, 128)

  let material = await makeWoozyMat({ cubeTexture, api })

  let imgs = []
  let cubes = []
  // eslint-disable-next-line
  for (var i = 0; i < 15; i++) {
    let cube = new THREE.Mesh(geometry, material)
    cube.userData.rx = Math.random() - 0.5
    cube.userData.ry = Math.random() - 0.5
    cube.userData.rz = Math.random() - 0.5

    cube.position.x = cube.userData.rx * 70
    cube.position.y = cube.userData.ry * 70
    cube.position.z = cube.userData.rz * 70

    cubes.push(cube)
    parent.add(cube)

    // let img = await makeLogo({ cubeTexture, parent, idx: i })
    // img.userData.rx = cube.userData.rx
    // img.userData.ry = cube.userData.ry
    // img.userData.rz = cube.userData.rz

    // img.position.x = img.userData.rx * 70
    // img.position.y = img.userData.ry * 70
    // img.position.z = img.userData.rz * 140
    // img.position.copy(cube.position)
    // imgs.push(img)
    // parent.add(img)
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

    cubes.forEach((e, idx) => {
      e.position.x += 0.07 * mixer(time * 3.14 * e.userData.rx * 3.14)
      e.position.y += 0.07 * mixer(time * 3.14 * e.userData.ry * 3.14)
      e.position.z += 0.07 * mixer(time * 3.14 * e.userData.rz * 3.14)
    })
    imgs.forEach(e => {
      e.position.x += 0.07 * mixer(time * 3.14 * e.userData.rx * 3.14)
      e.position.y += 0.07 * mixer(time * 3.14 * e.userData.ry * 3.14)
      e.position.z += 0.07 * mixer(time * 3.14 * e.userData.rz * 3.14)
    })
  }
}

export const setupCameraControls = async ({ camera, mounter, api }) => {
  let rID = getID()
  let control = new THREE.OrbitControls(camera, mounter)

  api.tasks[rID] = () => {
    control.update()
  }
  api.teardown[rID] = () => {
  }
}

export const makeCanvasCubeTexture = async ({ poserAPI, api, mounter }) => {
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

      color = `${(intensity * 255).toFixed(0)}, 65%, 55%`

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
      t.addTouch({
        x: Math.random(),
        y: Math.random()
      })

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
    cubeTexture.needsUpdate = true
  }

  window.addEventListener('mousemove', on.onMouseMove, { passive: false })
  window.addEventListener('touchmove', on.onTouchMove, { passive: false })

  let cubeTexture = new THREE.CubeTexture([
    t.canvas,
    t.canvas,
    t.canvas,
    t.canvas,
    t.canvas,
    t.canvas
  ])
  return cubeTexture
}

export const makeFontGeo = ({ text, width }) => {
  return new Promise(async (resolve) => {
    // var loader = new THREE.FontLoader()
    // loader.load(, function (font) {
    // eslint-disable-next-line
    var font = await import('../Fonts/helvetiker_regilar.typeface.json');
    font = new THREE.Font(font)
    var geometry = new THREE.TextGeometry(text, {
      font: font,
      size: width,
      height: 1.75,
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

// export const makeSVG = async ({ scene }) => {
//   return new Promise((resolve) => {
//     // eslint-disable-next-line
//     var text = require('../Textures/demos/face1.svg')
//     let svgLoader = new THREE.SVGLoader()
//     console.log(text)
//     svgLoader.load(text, (data) => {
//       var paths = data.paths
//       var group = new THREE.Group()

//       for (var i = 0; i < paths.length; i++) {
//         var path = paths[ i ]

//         var material = new THREE.MeshBasicMaterial({
//           color: path.color,
//           side: THREE.DoubleSide,
//           depthWrite: false
//         })

//         var shapes = path.toShapes(true)

//         for (var j = 0; j < shapes.length; j++) {
//           var shape = shapes[ j ]
//           var geometry = new THREE.ShapeBufferGeometry(shape)
//           var mesh = new THREE.Mesh(geometry, material)
//           group.add(mesh)
//         }
//       }
//       scene.add(group)
//     })
//     // var geometry = new THREE.TextGeometry(text, {
//     //   font: font,
//     //   size: 7.2,
//     //   height: 2,
//     //   curveSegments: 16,
//     //   bevelEnabled: true,
//     //   bevelThickness: 0.2,
//     //   bevelSize: 0.11,
//     //   bevelOffset: 0,
//     //   bevelSegments: 2
//     // })
//     // resolve(geometry)
//   })
// }

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

export const makeCenterText = async ({ cubeTexture, parent, scene, camera }) => {
  // var geo = new THREE.TorusKnotGeometry(9 / 2, 1.2 / 1.5, 293, 20, 4, 5)
  // var geo = new THREE.TorusBufferGeometry(10, 3, 16, 100)
  // var geo = new THREE.TorusBufferGeometry(10, 1.5, 16, 100)
  // var geo = new THREE.SphereBufferGeometry(10, 128, 128)
  // var geo = new THREE.BoxBufferGeometry(10, 10, 10, 128, 128, 128)
  // var geo = new THREE.OctahedronGeometry(5, 2)
  let width = visibleWidthAtZDepth(camera.position.z, camera)
  let height = visibleHeightAtZDepth(camera.position.z, camera)
  let min = Math.min(width, height)

  let text = 'Creative Code Lab'
  let geo = await makeFontGeo({ text, width: min * 0.12 * 0.6 })
  // let light = new THREE.PointLight(0xda2865, 1, 100)
  // light.position.z = 10
  // scene.add(light)

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

  // if (window.innerWidth > window.innerHeight) {
  //   mesh.scale.x = mesh.geometry.boundingSphere.radius / width
  //   mesh.scale.y = mesh.geometry.boundingSphere.radius / width
  //   mesh.scale.z = mesh.geometry.boundingSphere.radius / width
  // } else {
  //   mesh.scale.x = mesh.geometry.boundingSphere.radius / width
  //   mesh.scale.y = mesh.geometry.boundingSphere.radius / width
  //   mesh.scale.z = mesh.geometry.boundingSphere.radius / width
  // }
  mesh.scale.x = 0.5
  mesh.scale.y = 0.5
  mesh.scale.z = 0.5

  geo.computeBoundingSphere()
  geo.computeBoundingBox()

  console.log(mesh)

  mesh.position.x = geo.boundingSphere.radius * -0.5
  // mesh.position.y = geo.boundingBox.max.y * -0.25

  // parent.add(mesh)
  parent.add(mesh)

  return mesh
}

// export const setupBloomComposer = ({ renderer, scene, camera, api }) => {
// let { GUI } = await import('three/examples/jsm/libs/dat.gui.module.js')
//   var rID = getID()
//   var params = {
//     exposure: 1,
//     bloomThreshold: 0.56,
//     bloomStrength: 1.1,
//     bloomRadius: 0.95
//   }
//   var gui = new GUI()
//   var folder = gui.addFolder('Bloom Parameters')
//   folder.add(params, 'exposure', 0.1, 2).onChange(function (value) {
//     renderer.toneMappingExposure = Math.pow(value, 4.0)
//   })
//   folder.add(params, 'bloomThreshold', 0.0, 1.0).onChange(function (value) {
//     bloomPass.threshold = Number(value)
//   })
//   folder.add(params, 'bloomStrength', 0.0, 10.0).onChange(function (value) {
//     bloomPass.strength = Number(value)
//   })
//   folder.add(params, 'bloomRadius', 0.0, 1.0).step(0.01).onChange(function (value) {
//     bloomPass.radius = Number(value)
//   })
//   // var ENTIRE_SCENE = 0
//   var BLOOM_SCENE = 1

//   var bloomLayer = new THREE.Layers()
//   bloomLayer.set(BLOOM_SCENE)

//   var renderScene = new THREE.RenderPass(scene, camera)
//   var bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth * 2, window.innerHeight * 2), 1.5, 0.4, 0.85)
//   bloomPass.threshold = params.bloomThreshold
//   bloomPass.strength = params.bloomStrength
//   bloomPass.radius = params.bloomRadius

//   var bloomComposer = new THREE.EffectComposer(renderer)
//   bloomComposer.renderToScreen = true
//   bloomComposer.addPass(renderScene)
//   bloomComposer.addPass(bloomPass)

//   api.teardown[rID] = () => {
//     gui.destroy()
//   }

//   return bloomComposer
// }

export const setupCanvasDistortionComposer = ({ api, scene, camera, renderer }) => {
  let glsl = v => v[0]

  const easeOutSine = (t, b, c, d) => {
    return c * Math.sin((t / d) * (Math.PI / 2)) + b
  }

  const easeOutQuad = (t, b, c, d) => {
    t /= d
    return -c * t * (t - 2) + b
  }

  class TouchTexture {
    constructor () {
      this.size = 64
      // this.width = window.innerWidth
      // this.height = window.innerHeight
      let setter = () => {
        this.aspect = window.innerWidth / window.innerHeight
        this.width = this.size
        this.height = this.size / this.aspect
      }
      window.addEventListener('resize', setter, false)
      setter()

      this.maxAge = 64
      this.radius = 0.06 * this.size

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
      window.addEventListener('resize', () => {
        setTimeout(() => {
          this.canvas.width = this.width
          this.canvas.height = this.height
        }, 10)
      }, false)

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

      this.ctx.fillStyle = 'black'

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

      let offset = this.size * 5
      ctx.shadowOffsetX = offset // (default 0)
      ctx.shadowOffsetY = offset // (default 0)
      ctx.shadowBlur = radius * 1 // (default 0)
      ctx.shadowColor = `rgba(${color},${0.2 * intensity})` // (default transparent black)

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

  let rID = getID()
  let t = new TouchTexture()
  let texture = new THREE.CanvasTexture(t.canvas)
  let touchTextures = [t]
  let rAFID = 0

  api.teardown[rID] = () => {
    cancelAnimationFrame(rAFID)
  }
  api.tasks[rID] = async () => {
    // touchTextures.forEach(e => {
    //   e.update()
    // })
    t.update()
    texture.needsUpdate = true
  }

  window.addEventListener('mousemove', on.onMouseMove, { passive: false })
  window.addEventListener('touchmove', on.onTouchMove, { passive: false })

  let material = new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: {
        value: null
      },
      tWave: {
        value: texture
      }
    },
    vertexShader: glsl`
      #include <common>

      varying vec2 vUv;

      void main (void) {
        vUv = uv;

        vec3 nPos = position;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(nPos, 1.0);
      }
    `,
    fragmentShader: glsl`
      varying vec2 vUv;
      uniform sampler2D tDiffuse;
      uniform sampler2D tWave;
      #define PI 3.14159265359

      void main (void) {
        vec2 uvv = vec2(vUv);
        vec4 tex = texture2D(tWave, vUv);
        float angle = -((tex.r) * (PI * 2.) - PI) ;
        float vx = -(tex.r *2. - 1.);
        float vy = -(tex.g *2. - 1.);
        float intensity = tex.b;
        uvv.x += vx * 0.2 * intensity * 3.0;
        uvv.y += vy * 0.2  *intensity * 3.0;

        vec4 tDiff = texture2D(tDiffuse, uvv);
        gl_FragColor = vec4(tDiff);
      }
    `

  })
  var effectComposer = new THREE.EffectComposer(renderer)

  let setter = () => {
    effectComposer.setSize(window.innerWidth, window.innerHeight)
    effectComposer.setPixelRatio(window.devicePixelRatio < 1.5 ? 1.5 : window.devicePixelRatio)
  }
  window.addEventListener('resize', setter, false)

  var renderPass = new THREE.RenderPass(scene, camera)

  let shaderPass = new THREE.ShaderPass(material, 'tDiffuse')
  shaderPass.renderToScreen = true

  effectComposer.addPass(renderPass)
  effectComposer.addPass(shaderPass)

  return effectComposer
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

export const makeBallBg = ({ api, scene, camera, canvas }) => {
  let rID = getID()
  let cbg = new THREE.CanvasTexture(canvas)

  api.tasks[rID] = () => {
    cbg.needsUpdate = true
  }
  api.teardown[rID] = () => {
    api.tasks[rID] = () => {}
  }
  let mat = new THREE.MeshBasicMaterial({ map: cbg, side: THREE.BackSide })
  let mesh = new THREE.Mesh()
  mesh.material = mat

  window.addEventListener('resize', () => {
    let width = visibleWidthAtZDepth(camera.position.z, camera)
    let height = visibleHeightAtZDepth(camera.position.z, camera)
    let max = Math.max(width, height) * 10.0
    let geo = new THREE.BoxBufferGeometry(max, max, max, 2, 2, 2)
    mesh.geometry = geo
    mesh.needsUpdate = true
  })

  window.dispatchEvent(new Event('resize'))

  mesh.scale.x = -1
  scene.add(mesh)
}

export const setupBase = async ({ api, mounter, vm }) => {
  let env = { api, mounter, vm }
  let rID = getID()
  let exited = false
  let poserAPI = false
  // if (!mobileAndTabletcheck()) {
  //   try {
  //     let poserMod = await import('../GLService/cam-pose.js')
  //     poserAPI = await poserMod.setup()
  //   } catch (e) {
  //   }
  // }

  // try {
  //   let poserModule = await import('../GLService/cam-pose.js')
  //   poserAPI = await poserModule.setup({ showPreview: true, mounter })
  // } catch (e) {
  // }

  let rect = mounter.getBoundingClientRect()
  let scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(75, rect.width / rect.height, 0.1, 100000000)
  let renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false
  })

  renderer.setSize(rect.width, rect.height)
  renderer.setPixelRatio(window.devicePixelRatio < 1.5 ? 1.5 : window.devicePixelRatio)
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

  // setupCameraControls({ camera, api, mounter })
  camera.position.z = 20

  let parent = new THREE.Object3D()

  let canvasCubeTexture = await makeCanvasCubeTexture({ poserAPI, api, ...env })

  // let makeSphereBG = ({ canvasCubeTexture }) => {
  //   let ct = new THREE.CanvasTexture(canvasCubeTexture.image[0])
  //   let mat = new THREE.MeshBasicMaterial({
  //     side: THREE.DoubleSide,
  //     map: ct,
  //     opacity: 1,
  //     transparent: false
  //   })
  //   ct.flipY = true
  //   setInterval(() => {
  //     ct.needsUpdate = true
  //   }, 0)
  //   let geo = new THREE.SphereBufferGeometry(600, 64, 64)
  //   let sphereBG = new THREE.Mesh(geo, mat)
  //   return sphereBG
  // }
  let ct = new THREE.CanvasTexture(canvasCubeTexture.image[0])
  setInterval(() => {
    ct.needsUpdate = true
  }, 0)
  let composer = setupCanvasDistortionComposer({ ...env, scene, camera, renderer, texture: ct })

  // parent.add(makeSphereBG({ canvasCubeTexture }))

  // let cubeCam = makeCubeCam({ api, camera, parent: parent, renderer, scene })
  // let cubeCamTexture = cubeCam.renderTarget.texture

  // let cubeCamTexture = canvasCubeTexture
  // makeBallBg({ ...env, api, scene, canvas: canvasCubeTexture.images[0], camera })

  // scene.background = canvasCubeTexture // new THREE.Color('#fff')
  scene.background = canvasCubeTexture

  makeCenterText({ ...env, scene, camera, parent: parent, cubeTexture: canvasCubeTexture })
  makeFloatingBalls({ ...env, scene, parent: parent, renderer, camera, cubeTexture: canvasCubeTexture })
  makeEmoji({ ...env, mapper: canvasCubeTexture, scene, parent: parent, renderer, camera, cubeTexture: canvasCubeTexture })
  // parent.scale.x = -1
  scene.add(parent)

  // let composer = setupBloomComposer({ renderer, scene, camera, api })

  var rAFID = 0
  var animate = async function () {
    rAFID = requestAnimationFrame(animate)
    for (let kn in api.tasks) {
      api.tasks[kn]()
    }
    // renderer.render(scene, camera)

    if (composer) {
      composer.render()
    } else {
    }
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

uniform float uWozzy;

uniform float time;

varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 funPos = position;
  float cx = cnoise(normal.x + vec2(position.x * 0.11) + time) * 0.1 * uWozzy;
  float cy = cnoise(normal.y + vec2(position.y * 0.12) + time) * 0.1 * uWozzy;
  float cz = cnoise(normal.z + vec2(position.z * 0.13) + time) * 0.1 * uWozzy;
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
  gl_FragColor = mix( refractedColor, refractedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );
  gl_FragColor.a = 0.5;
}
  `

}
