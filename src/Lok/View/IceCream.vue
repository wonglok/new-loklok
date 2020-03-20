<template>
  <div class="full" ref="mounter">
  </div>
</template>

<script>
import * as IceCream from '../GLs/IceCream'
export default {
  components: {
  },
  data () {
    return {
      rAPI: false
    }
  },
  mounted () {
    this.rAPI = IceCream.install({ mounter: this.$refs['mounter'], vm: this })
  },
  beforeDestroy () {
    this.rAPI.clean()
  }
}
</script>
