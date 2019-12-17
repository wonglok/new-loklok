<template>
  <div class="full" ref="mounter">
    <button v-if="rAPI" class="button toucher z-50 fixed bottom-0 right-0 p-3 text-2xl" @click="rAPI.initAudio">🎸</button>
  </div>
</template>

<script>
import * as AudioVisualisation from '../GLs/AudioVisualisation'
export default {
  components: {
  },
  data () {
    return {
      init () {
        window.alert()
      },
      rAPI: false
    }
  },
  mounted () {
    this.rAPI = AudioVisualisation.install({ mounter: this.$refs['mounter'], vm: this })
  },
  beforeDestroy () {
    this.rAPI.clean()
  }
}
</script>

<style lang="postcss">
.button{
  z-index: 10000000;
}
</style>
