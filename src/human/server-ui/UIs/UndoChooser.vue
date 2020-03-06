<template>
  <div>
    <button class="m-2 p-2 border border-red-400 px-3 bg-red-100 rounded-lg text-red-700" @click="undo(item)">Reset Data & Type</button>
  </div>
</template>

<script>
export default {
  props: {
    app: {},
    item: {}
  },
  methods: {
    undo (item) {
      if (this.$parent.alt || window.confirm('reset?')) {
        item.type = 'unknown'
        item.value = null
        this.app.updateNow(item)
      }
    }
  }
}
</script>

<style scoped>
</style>
