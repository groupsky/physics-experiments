<template>
  <div>
    <h1>Home</h1>
    <pre>{{state}}</pre>
    <pre>Slip ratio: {{state.ball.angularVelocity * state.ball.radius / state.ball.velocity - 1}}</pre>
  </div>
</template>

<script>
  export default {
    name: 'home',
    inject: [ 'game' ],
    data () {
      return { state: this.game.state }
    },
  }
</script>

<style scoped>
</style>
