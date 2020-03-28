
// can scroll how many pages = limit.y
export const makeScroller = ({ base, mounter, limit = { canRun: true, y: 1000 }, onMove = () => {} }) => {
  let state = {
    tsY: 0,
    tdY: 0,
    taY: 0,
    inertiaY: 1
  }
  class ValueDamper {
    constructor (v = 0) {
      this.maxY = limit.y
      this.latestVal = v
      this.dampedVal = v
      base.onLoop(() => {
        let diff = (this.latestVal - this.dampedVal) * (60 / 1000)
        this.dampedVal += diff
      })
    }
    set value (v) {
      this.latestVal = v
      state.taY = v
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
    mounter.addEventListener('wheel', (evt) => {
      evt.preventDefault()
      if (!limit.canRun) {
        return
      }
      scrollAmount += evt.deltaY
      if (scrollAmount < 0) {
        scrollAmount -= evt.deltaY
      } else if (scrollAmount > (limit.y * window.innerHeight)) {
        scrollAmount -= evt.deltaY
      }
      SmoothY.value = scrollAmount / window.innerHeight

      onMove(SmoothY)
    }, { passive: false })

    mounter.addEventListener('touchstart', (evt) => {
      evt.preventDefault()
      let t1 = evt.touches[0]
      // console.log(t1)
      state.tsY = t1.pageY
      state.tD = true
    }, { passive: false })
    mounter.addEventListener('touchmove', (evt) => {
      evt.preventDefault()
      if (!limit.canRun) {
        return
      }
      if (state.tD) {
        let t1 = evt.touches[0]
        // console.log(t1)
        state.tdY = t1.pageY - state.tsY
        state.tsY = t1.pageY
        state.inertiaY = 1.5
      }
      onMove(SmoothY)
    }, { passive: false })
    mounter.addEventListener('touchend', (evt) => {
      state.tsY = 0
      state.tD = false
    }, { passive: false })
    mounter.addEventListener('touchcancel', (evt) => {
      state.tsY = 0
      state.tD = false
    }, { passive: false })

    base.onLoop(() => {
      if (!limit.canRun) {
        state.tdY = 0
        state.inertiaY = 0
        return
      }

      state.inertiaY *= 0.75
      let delta = state.inertiaY * state.tdY * 2.11 / 1000
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
