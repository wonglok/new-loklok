<template>
  <div class="full" ref="mounter">
  </div>
</template>

<script>
import * as JellyStudio from '../../GLs/JellyStudio'
export default {
  components: {
  },
  data () {
    return {
      rAPI: false
    }
  },
  mounted () {
    this.rAPI = JellyStudio.install({ mounter: this.$refs['mounter'], vm: this })
  },
  beforeDestroy () {
    this.rAPI.clean()
  }
}
</script>
