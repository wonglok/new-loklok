export default async () => {
  let getID = () => '_' + (100000000.0 * Math.random()).toFixed(0) + ''
  let env = {
    waitKN: (kn) => {
      return new Promise((resolve) => {
        let tout = 0
        setInterval(() => {
          if (env[kn]) {
            clearInterval(tout)
            resolve(env[kn])
          }
        })
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
      env._.resize[getID()] = fn
      fn()
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
  let looper = () => {
    rAFID = requestAnimationFrame(looper)
    for (var loopKN in env._.loop) {
      env._.loop[loopKN]()
    }
  }
  rAFID = requestAnimationFrame(looper)
  env.onClean(() => {
    cancelAnimationFrame(rAFID)
  })

  let tout = 0
  let resize = () => {
    clearTimeout(tout)
    tout = setTimeout(() => {
      for (var resizeKN in env._.resize) {
        env._.resize[resizeKN]()
      }
    }, 50)
  }
  window.addEventListener('resize', resize, false)
  env.onClean(() => {
    window.removeEventListener('resize', resize, false)
  })

  window.dispatchEvent(new Event('resize'))
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'))
  }, 100)

  return env
}
