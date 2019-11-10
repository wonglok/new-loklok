<template>
  <div id="app" class="full">
    <router-view/>
    <router-link to="/" class="absolute bottom-0 left-0 p-4">🏠</router-link>
  </div>
</template>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
