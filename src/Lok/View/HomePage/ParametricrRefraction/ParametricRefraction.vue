<template>
  <div></div>
</template>

<script>
import { CylinderGeometry, Vector2, InstancedBufferGeometry, BufferAttribute, InstancedBufferAttribute, RawShaderMaterial, Mesh, Object3D } from 'three'

/* eslint-disable */
export const tubeV = require('raw-loader!./tubeV.glsl').default
export const tubeF = require('raw-loader!./tubeF.glsl').default
/* eslint-enable */

export const createLineGeo = async ({ count = 100, numSides = 8, subdivisions = 50, openEnded = false }) => {
  // create a base CylinderGeometry which handles UVs, end caps and faces
  const radius = 1
  const length = 1
  const baseGeometry = new CylinderGeometry(radius, radius, length, numSides, subdivisions, openEnded)

  // fix the orientation so X can act as arc length
  baseGeometry.rotateZ(Math.PI / 2)

  // compute the radial angle for each position for later extrusion
  const tmpVec = new Vector2()
  const xPositions = []
  const angles = []
  const uvs = []
  const vertices = baseGeometry.vertices
  const faceVertexUvs = baseGeometry.faceVertexUvs[0]

  // Now go through each face and un-index the geometry.
  baseGeometry.faces.forEach((face, i) => {
    const { a, b, c } = face
    const v0 = vertices[a]
    const v1 = vertices[b]
    const v2 = vertices[c]
    const verts = [ v0, v1, v2 ]
    const faceUvs = faceVertexUvs[i]

    // For each vertex in this face...
    verts.forEach((v, j) => {
      tmpVec.set(v.y, v.z).normalize()

      // the radial angle around the tube
      const angle = Math.atan2(tmpVec.y, tmpVec.x)
      angles.push(angle)

      // "arc length" in range [-0.5 .. 0.5]
      xPositions.push(v.x)

      // copy over the UV for this vertex
      uvs.push(faceUvs[j].toArray())
    })
  })

  // build typed arrays for our attributes
  const posArray = new Float32Array(xPositions)
  const angleArray = new Float32Array(angles)
  const uvArray = new Float32Array(uvs.length * 2)

  // unroll UVs
  for (let i = 0; i < posArray.length; i++) {
    const [ u, v ] = uvs[i]
    uvArray[i * 2 + 0] = u
    uvArray[i * 2 + 1] = v
  }

  const geometry = new InstancedBufferGeometry()
  geometry.maxInstancedCount = count
  geometry.setAttribute('position', new BufferAttribute(posArray, 1))
  geometry.setAttribute('angle', new BufferAttribute(angleArray, 1))
  geometry.setAttribute('uv', new BufferAttribute(uvArray, 2))

  let offsets = []

  for (var i = 0; i < count; i++) {
    let x = i / count
    let y = i
    let z = count
    offsets.push(
      x,
      y,
      z
    )
  }

  geometry.setAttribute('offset', new InstancedBufferAttribute(new Float32Array(offsets), 3))

  // dispose old geometry since we no longer need it
  baseGeometry.dispose()
  return geometry
}

export const makeParametric = async ({ cubeTexture, ui, base, sdk, setting }) => {
  let count = 100
  let numSides = 4
  let subdivisions = 300
  let openEnded = true
  let geo = await createLineGeo({ count, numSides, subdivisions, openEnded })
  let glProxy = {
    add: (v) => {
      ui.$parent.$emit('add', v)
    },
    remove: (v) => {
      ui.$parent.$emit('remove', v)
    }
  }
  let group = sdk.getGroup(setting)
  let uniforms = {
    // tCube: { value: cubeTexture },
    baseOpacity: { value: 1 },
    // baseColor: { value: new Color('#00f') },

    mRefractionRatio: { value: 0.02 },
    mFresnelBias: { value: 0.2 },
    mFresnelPower: { value: 2.2 },
    mFresnelScale: { value: 1.2 },
    tCube: { value: cubeTexture },
    tDudv: { value: null },
    useDudv: { value: false },

    // baseColor: { value: new Color('#fff') },
    thickness: { value: 0.01 },
    spread: { value: 0.01 },
    animateStrength: { value: 0.01 },
    animateRadius: { value: 0.01 },
    time: { value: 0 }
  }

  base.loop(() => {
    geo.maxInstancedCount = Math.floor(group.autoGet('maxLines') / 100.0 * count)

    uniforms.animateStrength.value = group.autoGet('animateStrength') / 100.0
    uniforms.animateRadius.value = group.autoGet('animateRadius') / 100.0

    uniforms.spread.value = group.autoGet('spread') / 10.0
    uniforms.thickness.value = group.autoGet('thickness') / 1000.0

    uniforms.baseOpacity.value = group.autoGet('baseOpacity') / 100.0
    // uniforms.baseColor.value = group.autoGet('baseColor')
    uniforms.time.value = window.performance.now() * 0.001
  })

  let refresh = (mesh) => {
    let material = new RawShaderMaterial({
      defines: {
        lengthSegments: subdivisions.toFixed(1)
      },
      transparent: true,
      uniforms,
      vertexShader: tubeV,
      fragmentShader: tubeF
    })

    mesh.material = material
  }

  let mesh = new Mesh(geo, undefined, count)
  mesh.frustumCulled = false
  mesh.scale.set(20.0, 20.0, 20.0)
  refresh(mesh)

  let obj3d = new Object3D()
  obj3d.add(mesh)
  glProxy.add(obj3d)

  // mesh.position.z = 34.0 - 50

  // group.autoPulse('position', (v) => {
  //   mesh.position.x = v.x - 50.0
  //   mesh.position.y = v.y - 50.0
  //   mesh.position.z = v.z - 50.0
  // })

  console.log('parametric installed')
  let clean = async () => {
    // let mesh = await group.gets.kn)
    mesh.geometry.dispose()
    glProxy.remove(obj3d)
  }
  base.onClean(() => {
    clean()
  })
  return {
    clean
  }
}

export default {
  props: {
    base: {},
    sdk: {},
    cube: {},
    setting: {
      default: 'parametric-1'
    }
  },
  data () {
    return {
      clean () {}
    }
  },
  async mounted () {
    let cubeTexture = await this.base.waitKN(this.cube)
    const parametric = await makeParametric({ cubeTexture: cubeTexture, ui: this, base: this.base, sdk: this.sdk, setting: this.setting })
    this.clean = parametric.clean
  },
  beforeDestroy () {
    this.clean()
  }
}
</script>

<style>

</style>
