<template>
  <div class="full" ref="mounter">
  </div>
</template>

<script>
import BaseAPI from './BaseAPI.js'
export default {
  data () {
    return {
      base: false
    }
  },
  async mounted () {
    this.base = await BaseAPI()
    this.base.mounter = this.$refs['mounter']
    this.$emit('ready', this.base)
  },
  beforeDestroy () {
    this.base.destroy()
  }
}
</script>

<style>
.full{
  width: 100%;
  height: 100%;
}
</style>
