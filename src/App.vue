<template>
  <div id="app" class="full">
    <!-- <keep-alive> -->
      <router-view :key="$router.fullPath" />
    <!-- </keep-alive> -->
    <!-- <router-link to="/menu" class="absolute bottom-0 left-0 p-4 toucher">🏠</router-link> -->
  </div>
</template>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.toucher{
  user-select: none;
  touch-action: manipulation;
}
</style>
