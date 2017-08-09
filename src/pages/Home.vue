<template>
  <div>
    <h3>Home</h3>
    <div class="row">
      <div class="col-md-4">
        <pre>Slip ratio: {{state.ball.angularVelocity * state.ball.radius / state.ball.velocity - 1}}</pre>
      </div>
      <pre class="col-md-4">{{state}}</pre>
      <pre class="col-md-4">{{game.const}}</pre>
    </div>
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
