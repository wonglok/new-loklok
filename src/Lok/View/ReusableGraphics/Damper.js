export class Damper {
  constructor (v = 0, base = { loop: () => {} }) {
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
