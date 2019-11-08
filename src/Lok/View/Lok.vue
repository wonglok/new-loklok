<template>
  <div class="full" ref="mounter">
  </div>
</template>

<script>
import * as Balls from '../GLs/Balls'
export default {
  components: {
  },
  data () {
    return {
      rAPI: false
    }
  },
  mounted () {
    this.rAPI = Balls.install({ mounter: this.$refs['mounter'], vm: this })
  },
  beforeDestroy () {
    this.rAPI.clean()
  }
}
</script>
