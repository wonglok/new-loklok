<template>
  <div>
    Welcome :D
    <pre :key="kn" v-for="(log, kn) in logs">{{ JSON.stringify(log) }}</pre>
  </div>
</template>

<script>
import { makeSDK } from '../../human'
export default {
  data () {
    return {
      logs: [],
      sdk: false
    }
  },
  async mounted () {
    this.sdk = await makeSDK()
    let group = this.sdk.getGroup('test')
    group.autoPulse('k0', console.log)
    group.autoPulse('k1', console.log)
    group.autoPulse('k2', console.log)
    group.autoPulse('k3', console.log)
    group.autoPulse('k4', console.log)
    group.autoPulse('k5', console.log)
    group.autoPulse('k6', console.log)

    // let groupOne = this.sdk.getGroup('group1')
    // let k1 = groupOne.get('k1')
    // this.log(k1)
    // groupOne.pulse('k1', () => {
    //   this.log(groupOne.get('k1'))
    // })
  },
  methods: {
    log (v) {
      this.logs.unshift(v)
      this.logs = this.logs.slice(0, 50)
    }
  }
}
</script>

<style>

</style>
