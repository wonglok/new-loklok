export const makeBase = async ({ mounter }) => {
  let getID = () => '_' + (100000000.0 * Math.random()).toFixed(0) + ''
  let env = {
    mounter,
    waitKN: (kn) => {
      return new Promise((resolve) => {
        let key = getID()
        env._.loop[key] = () => {
          if (env[kn]) {
            env._.loop[key] = () => {}
            resolve(env[kn])
          }
        }
      })
    },
    getID,
    _: {
      loop: {},
      resize: {},
      clean: {}
    },
    loop: (fn) => {
      let key = getID()
      env._.loop[key] = fn
      return () => {
        env._.loop[key] = () => {}
      }
    },
    onResize: (fn) => {
      fn()
      env._.resize[getID()] = fn
    },
    onClean: (fn) => {
      env._.clean[getID()] = fn
    },
    destroy: () => {
      for (var loopKN in env._.loop) {
        env._.loop[loopKN] = () => {}
      }
      for (var cleanKN in env._.clean) {
        env._.clean[cleanKN]()
      }
    }
  }
  let rAFID = 0
  let runLoop = () => {
    for (var loopKN in env._.loop) {
      env._.loop[loopKN]()
    }
  }
  let looper = () => {
    rAFID = requestAnimationFrame(looper)
    runLoop()
  }
  rAFID = requestAnimationFrame(looper)
  env.onClean(() => {
    cancelAnimationFrame(rAFID)
  })

  let tout = 0
  let runResize = () => {
    for (var resizeKN in env._.resize) {
      env._.resize[resizeKN]()
    }
  }
  let resize = () => {
    clearTimeout(tout)
    tout = setTimeout(() => {
      runResize()
    }, 100)
  }
  window.addEventListener('resize', resize, false)
  env.onClean(() => {
    window.removeEventListener('resize', resize, false)
  })

  // window.dispatchEvent(new Event('resize'))
  // setTimeout(() => {
  //   window.dispatchEvent(new Event('resize'))
  // }, 100)

  env.systemReady = () => {
    // runLoop()
    runResize()
  }

  return env
}
