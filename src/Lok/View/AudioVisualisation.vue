<template>
  <div class="full" ref="mounter">
  </div>
</template>

<script>
import * as AudioVisualisation from '../GLs/AudioVisualisation'
export default {
  components: {
  },
  data () {
    return {
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
