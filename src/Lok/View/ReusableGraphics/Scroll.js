// can scroll how many pages = limit.y
export const makeScroller = ({ base, touchTarget, limit = { y: 1000 } }) => {
  class ValueDamper {
    constructor (v = 0) {
      this.latestVal = v
      this.dampedVal = v
      base.loop(() => {
        let diff = (this.latestVal - this.dampedVal) * (60 / 1000)
        this.dampedVal += diff
      })
    }
    set value (v) {
      this.latestVal = v
    }
    get value () {
      return this.dampedVal
    }
  }
  let browserScrollBox = document.querySelector('.broswer-scroll-box')
  let scrollAmount = 0
  let SmoothY = new ValueDamper(-0.2)
  SmoothY.value = 0.0
  if (browserScrollBox) {
    browserScrollBox.addEventListener('scroll', () => {
      let value = (browserScrollBox.scrollTop) / window.innerHeight
      if (value < 0) {
        value = 0
      }
      SmoothY.value = value
    }, true)
  } else {
    touchTarget.addEventListener('wheel', (evt) => {
      evt.preventDefault()
      scrollAmount += evt.deltaY
      if (scrollAmount < 0) {
        scrollAmount -= evt.deltaY
      } else if (scrollAmount > (limit.y * window.innerHeight)) {
        scrollAmount -= evt.deltaY
      }
      SmoothY.value = scrollAmount / window.innerHeight
    }, { passive: false })

    let state = {
      tsY: 0,
      tdY: 0,
      taY: 0,
      inertiaY: 1
    }
    touchTarget.addEventListener('touchstart', (evt) => {
      evt.preventDefault()
      let t1 = evt.touches[0]
      // console.log(t1)
      state.tsY = t1.pageY
      state.tD = true
    }, { passive: false })
    touchTarget.addEventListener('touchmove', (evt) => {
      evt.preventDefault()
      if (state.tD) {
        let t1 = evt.touches[0]
        // console.log(t1)
        state.tdY = t1.pageY - state.tsY
        state.tsY = t1.pageY
        state.inertiaY = 1.5
      }
    }, { passive: false })
    touchTarget.addEventListener('touchend', (evt) => {
      state.tsY = 0
      state.tD = false
    }, { passive: false })
    touchTarget.addEventListener('touchcancel', (evt) => {
      state.tsY = 0
      state.tD = false
    }, { passive: false })

    base.loop(() => {
      state.inertiaY *= 0.15
      let delta = state.inertiaY * state.tdY * (20.0 / 1000)
      state.taY -= delta

      if (state.taY <= 0) {
        state.taY += delta
      } else if (state.taY >= limit.y) {
        state.taY += delta
      } else {
      }
      if (state.inertiaY > 0.03) {
        SmoothY.value = state.taY
      }
    })
  }

  return SmoothY
}
