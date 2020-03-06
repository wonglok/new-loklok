<template>
  <div class="p-3">
    <textarea type="text" class="m-2 p-2 border border-gray-400 px-3 bg-gray-100 rounded-lg text-gray-700" v-model="item.value" @input="update(item, $event)" cols="50" rows="20"></textarea>
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
      // item.value = ($event.target.value) + ''
      this.app.updateNow(item)
    }
  }
}
</script>

<style scoped>

</style>
