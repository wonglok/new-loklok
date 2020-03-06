<template>
  <div>
    <div class="p-2 text-3xl">Please Choose Your Data Type</div>
    <button class="m-2 p-2 border border-green-400 px-3 bg-green-100 rounded-lg text-green-700" @click="choose(item, 'number')">Numbers</button>
  </div>
</template>

<script>
export default {
  props: {
    app: {},
    item: {}
  },
  methods: {
    choose (item, type) {
      if (type === 'number') {
        item.type = 'number'
        item.value = 0
        this.app.updateNow(item)
      }
    }
  }
}
</script>

<style scoped>

</style>
