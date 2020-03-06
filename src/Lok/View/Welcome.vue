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
    this.sdk.pulse('group1.k1', this.log)
    this.sdk.pulse('group1.k2', this.log)
    this.sdk.pulse('group1.k3', this.log)

    let groupOne = this.sdk.getGroup('group1')
    let k1 = groupOne.get('k1')
    this.log(k1)
    groupOne.pulse('k1', () => {
      console.log(groupOne.get('k1'))
    })
  },
  methods: {
    log (v) {
      this.logs.unshift(v)
    }
  }
}
</script>

<style>

</style>
