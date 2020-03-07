export const makeScroller = ({ base, touchTarget }) => {
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
  let scroller = document.querySelector('.scroller-area')
  let scrollAmount = 0
  let SmoothY = new ValueDamper(-0.2)
  SmoothY.value = 0.0
  if (scroller) {
    scroller.addEventListener('scroll', () => {
      let value = (scroller.scrollTop) / window.innerHeight
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
        scrollAmount = 0
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
      console.log(t1)
      state.tsY = t1.pageY
      state.tD = true
    }, { passive: false })
    touchTarget.addEventListener('touchmove', (evt) => {
      evt.preventDefault()
      if (state.tD) {
        let t1 = evt.touches[0]
        console.log(t1)
        state.tdY = t1.pageY - state.tsY
        state.tsY = t1.pageY
        state.inertiaY = 1.0
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
      state.inertiaY *= 0.97
      state.taY -= state.inertiaY * state.tdY * (3 / 1000)

      if (state.taY < -0.1) {
        state.taY = -0.1
      }
      if (state.taY > 1.2) {
        state.taY = 1.2
      }
      if (state.inertiaY > 0.03) {
        SmoothY.value = state.taY
      }
    })
  }

  return SmoothY
}
