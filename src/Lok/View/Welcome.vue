<template>
  <div>
    Welcome :D
  </div>
</template>

<script>
import { makeSDK } from '../../human'
export default {
  data () {
    return {
      sdk: false
    }
  },
  async mounted () {
    this.sdk = await makeSDK()
    this.sdk.pulse('group1.k1', console.log)
    this.sdk.pulse('group1.k2', console.log)
    this.sdk.pulse('group1.k3', console.log)
  }
}
</script>

<style>

</style>
