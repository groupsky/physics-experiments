<template>
  <div>
    <h1>Home</h1>
    <p>Ticks: {{tickCounter}}</p>
  </div>
</template>

<script>
  export default {
    name: 'home',
    inject: [ 'game' ],
    data () {
      return { tickCounter: 0 }
    },
    watch: {
      'game.tick' (tickCounter) {
        this.tickCounter = tickCounter
      }
    }
  }
</script>

<style scoped>
</style>
