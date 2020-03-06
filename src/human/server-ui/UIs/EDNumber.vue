<template>
  <div class="p-3">
    <input type="range" step="0.01" class="m-2 border border-gray-400 bg-gray-100 rounded-lg text-gray-700" v-model="item.value" @input="update(item, $event)" />
    <input type="text" class="m-2 p-2 border border-gray-400 px-3 bg-gray-100 rounded-lg text-gray-700" v-model="item.value" @input="update(item, $event)" />
  </div>
</template>

<script>
export default {
  props: {
    app: {},
    item: {}
  },
  methods: {
    update (item, $event) {
      item.value = Number($event.target.value)
      this.app.updateLater(item)
    }
  }
}
</script>

<style scoped>

</style>
