import { Vector3, Vector2, Color } from 'three'
let waitGet = ({ getter }) => {
  return new Promise((resolve) => {
    let tout = setInterval(() => {
      let res = getter()
      if (res) {
        clearInterval(tout)
        resolve(res)
      }
    })
  })
}

export const makeSDK = async () => {
  // let getID = () => '_' + (Math.random() * 1000000).toFixed(0) + ''
  let sdk = {
    ready: false,
    _: {
      pulses: {},
      stubs: {}
    },
    data: {
      objects: []
    },
    get list () {
      return sdk.data.objects
    },
    get root () {
      return sdk.data
    },
    // editor: getID(),
    sendPulse: (gp, kn) => {
      let allPulses = sdk._.pulses
      let allStubs = sdk._.stubs
      let fn1 = allPulses[gp + '.' + kn] || (() => {})
      fn1()

      for (let skn in allStubs) {
        allStubs[skn]()
      }
    }
  }
  // code shake
  if (process.env.NODE_ENV === 'development') {
    let io = require('socket.io-client')
    let hostname = location.hostname
    let socket = io(`http://${hostname}:2329`)
    sdk.socket = socket

    socket.emit('init-request', {}, (data) => {
      for (var kn in data) {
        sdk.data[kn] = data[kn]
      }
      sdk.ready = true
    })

    socket.on('down-add', (adder) => {
      sdk.data.objects.push(adder)
      sdk.sendPulse(adder.group, adder.key)
    })

    socket.on('down-remove', (remover) => {
      let arr = sdk.data.objects
      arr.splice(arr.findIndex(e => e.id === remover.id, 1), 1)
      sdk.sendPulse(remover.group, remover.key)
    })

    // UPDATE
    socket.on('down-update', ({ editor, updater }) => {
      // if this isn't myself then update it
      let arr = sdk.data.objects
      let idx = arr.findIndex(e => e.id === updater.id, 1)
      arr[idx] = updater
      sdk.sendPulse(updater.group, updater.key)
    })

    // make sure data is ready so that APIs are correct
    await waitGet({
      getter: () => {
        return sdk.ready
      }
    })
  }

  if (process.env.NODE_ENV === 'production') {
    sdk.data = require('../data/db.json')
    sdk.ready = true
  }

  let HolderCache = {}
  let transformer = (obj, cacheKey) => {
    if (!obj || typeof obj.value === 'undefined') {
      return
    }
    let val = obj.value
    if (obj.type === 'vec3') {
      // HolderCache[cacheKey] = HolderCache[cacheKey] || new Vector3(val.x, val.y, val.z)
      HolderCache[cacheKey] = new Vector3(val.x, val.y, val.z)
      // HolderCache[cacheKey].x = val.x
      // HolderCache[cacheKey].y = val.y
      // HolderCache[cacheKey].z = val.z
      return HolderCache[cacheKey]
    } else if (obj.type === 'vec2') {
      // HolderCache[cacheKey] = HolderCache[cacheKey] || new Vector2(val.x, val.y)
      HolderCache[cacheKey] = new Vector2(val.x, val.y)
      // HolderCache[cacheKey].x = val.x
      // HolderCache[cacheKey].y = val.y

      return HolderCache[cacheKey]
    } else if (obj.type === 'color') {
      // let color = new Color(val.r / 255, val.g / 255, val.b / 255)
      // color.a = val.a
      // color.opacity = val.a

      // HolderCache[cacheKey] = HolderCache[cacheKey] || new Color(val.r / 255, val.g / 255, val.b / 255)
      HolderCache[cacheKey] = new Color(val.r / 255, val.g / 255, val.b / 255)
      // HolderCache[cacheKey].r = val.r / 255
      // HolderCache[cacheKey].g = val.g / 255
      // HolderCache[cacheKey].b = val.b / 255
      HolderCache[cacheKey].a = val.a
      HolderCache[cacheKey].opacity = val.a
      return HolderCache[cacheKey]
    } else {
      return val
    }
  }

  let surge = (gpkn, streamFn, auto) => {
    let obj = sdk.list.find(e => (e.group + '.' + e.key) === gpkn)
    if (auto) {
      streamFn(transformer(obj, gpkn))
      return
    }
    streamFn(obj)
  }

  sdk.pulse = (gpkn, streamFn, auto) => {
    sdk._.pulses[gpkn] = () => {
      surge(gpkn, streamFn, auto)
    }
    surge(gpkn, streamFn, auto)
  }

  sdk.autoPulse = (gpkn, streamFn) => {
    sdk.pulse(gpkn, streamFn, true)
  }

  sdk.get = (gpkn) => {
    let obj = sdk.list.find(e => (e.group + '.' + e.key) === gpkn)
    return obj
  }
  sdk.autoGet = (gpkn) => {
    let obj = sdk.get(gpkn)
    return transformer(obj, gpkn)
  }

  sdk.onStubGroup = (group, onStubReady) => {
    if (!sdk.list.some(e => e.group === group)) {
      console.error(group, 'group not found')
    }

    let makeStub = () => {
      let stub = {}
      let items = sdk.list.filter(e => e.group === group)
      items.forEach((item) => {
        let gpkn = `${item.group}.${item.key}`
        stub[item.key] = transformer(item, gpkn)
        // Object.defineProperty(stub, item.key, { get: () => transformer(item, gpkn) })
        // Object.defineProperty(stub, item.key, { get: () => transformer(item, gpkn) })
      })
      return stub
    }

    sdk._.stubs[group] = () => {
      onStubReady(makeStub())
    }
    onStubReady(makeStub())
  }

  sdk.getGroup = (group) => {
    if (!sdk.list.some(e => e.group === group)) {
      console.error(group, 'group not found')
    }
    return {
      proxy: new Proxy({}, {
        get (tempObj, kn) {
          let obj = sdk.get(`${group}.${kn}`)
          return transformer(obj, `${group}.${kn}`)
        }
      }),
      autoGet: (kn) => {
        // let groupItems = sdk.list.filter(e => e.group === group)
        let obj = sdk.get(`${group}.${kn}`)
        if (!obj) {
          console.error(`not found ${group}.${kn}`)
        }
        return transformer(obj, `${group}.${kn}`)
      },
      get: (kn) => {
        let obj = sdk.get(`${group}.${kn}`)
        return obj
        // let groupItems = sdk.list.filter(e => e.group === group)
        // return groupItems.find(t => t.key === kn)
      },
      pulse: (kn, streamFn) => {
        return sdk.pulse(`${group}.${kn}`, streamFn, false)
      },
      autoPulse: (kn, streamFn) => {
        return sdk.pulse(`${group}.${kn}`, streamFn, true)
      }
    }
  }
  return sdk
}
