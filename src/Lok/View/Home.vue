<template>
  <div class="full" ref="mounter">
  </div>
</template>

<script>
import * as Ribbon from '../GLs/Ribbon'
export default {
  components: {
  },
  data () {
    return {
      rAPI: false
    }
  },
  mounted () {
    this.rAPI = Ribbon.install({ mounter: this.$refs['mounter'], vm: this })
  },
  beforeDestroy () {
    this.rAPI.clean()
  }
}
</script>
