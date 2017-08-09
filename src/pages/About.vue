<template>
  <div>
    <h1>About</h1>
    <div>
      <p>{{angularAcceleration}}</p>
    </div>
    <div>
      <input type="number" min="0" max="100" step="0.01" v-model="bodyFriction">
      <input type="number" min="0" max="100" step="0.01" v-model="bodyFrictionStatic">
      <input type="number" min="0" max="100" step="0.01" v-model="torque">
    </div>
    <div ref="render"></div>
  </div>
</template>

<script>
  import { Engine, Render, World, Bodies, Body, Runner, Events, Vector, use } from 'matter-js'
  import { Attractors } from 'matter-attractors'
  import { LarkMatter } from '../../vendor/lark-matter'
  use('matter-attractors')
  //  use(LarkMatter)
  LarkMatter.options.dotSize = 4
  LarkMatter.options.rotationNum = 90

  export default {
    name: 'about',
    data () {
      return {
        bodyFriction: 0.1,
        bodyFrictionStatic: 0.5,
        torque: 1,
        angularAcceleration: 0,
      }
    },
    watch: {
      bodyFriction (val) {
        this.ball.bodyFriction = +val
      },
      bodyFrictionStatic (val) {
        this.ball.frictionStatic = +val
      },
    },
    beforeCreate() {
      this.engine = Engine.create({})
//      this.engine.timing.timeScale = 0.51
      this.planet = Bodies.circle(400, 300, 250, {
//        density: 5000,
//        friction: 1000000,
//        frictionStatic: 1000000,
//        frictionAir: 0,
//        restitution: 0,
//        sleepThreshold: 1200,
        plugin: {
          attractors: [ function gravity (bodyA, bodyB) {
            // use Newton's law of gravitation
            var bToA = Vector.sub(bodyB.position, bodyA.position),
              distanceSq = Vector.magnitudeSquared(bToA) || 0.0001,
              normal = Vector.normalise(bToA),
              magnitude = -Attractors.gravityConstant * (bodyA.mass * bodyB.mass / distanceSq),
              force = Vector.mult(normal, magnitude);

            // to apply forces to both bodies
//            Body.applyForce(bodyA, bodyA.position, Matter.Vector.neg(force));
            Body.applyForce(bodyB, bodyB.position, force);
          } ]
        },
      }, 15)
      this.ball = window.ball = Bodies.circle(400, 300 - 250 - 25, 25, {
//        density: 100,
//        friction: 0.1,
//        frictionStatic: 0.5,
//        frictionAir: 1e-5,
//        restitution: 0,
//        sleepThreshold: 1200,
//        plugin: {
//          attractors: [ Attractors.gravity ]
//        },
      }, 15)
      this.engine.world.gravity.x = 0
      this.engine.world.gravity.y = 0
//      Attractors.gravityConstant = 0.001
      World.add(this.engine.world, [ this.planet, this.ball ])
    },
    methods: {
      beforeUpdate () {
//        Body.setPosition(this.planet, { x: 400, y: 300 })
        var bToA = Vector.sub(this.planet.position, this.ball.position)
        var distance = Vector.magnitude(bToA) || 0.0001
        if (distance <= this.planet.circleRadius + this.ball.circleRadius) {
          this.ball.torque += +this.torque
        }
        else {
          this.ball.torque -= this.ball.angularVelocity * this.ball.mass / (1 + this.torque) || 0.0001
        }
//      this.planet.angle += 0.01
      },
      afterUpdate () {
        Body.setPosition(this.planet, { x: 400, y: 300 })
        this.angularAcceleration = this.ball.angularVelocity
      },
    },
    mounted () {
      this.render = Render.create({
        element: this.$refs.render,
        engine: this.engine,
        width: Math.min(document.documentElement.clientWidth, 800),
        height: Math.min(document.documentElement.clientHeight, 600),
        showAngleIndicator: true,
        showCollisions: true,
      })

      //noinspection BadExpressionStatementJS
      Events.on(this.engine, 'beforeUpdate', this.beforeUpdate.bind(this))
      Events.on(this.engine, 'afterUpdate', this.afterUpdate.bind(this))

      Render.run(this.render)
      Engine.run(this.engine)
    },
  }
</script>

<style scoped>
</style>
