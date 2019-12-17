<template>
  <div class="full" ref="mounter">
    <button class=" pointer-events-auto fixed bottom-0 right-0 p-3 text-2xl toucher" @click="init()">🎸</button>
  </div>
</template>

<script>
import * as AudioVisualisation from '../GLs/AudioVisualisation'
export default {
  components: {
  },
  data () {
    return {
      init () {},
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
