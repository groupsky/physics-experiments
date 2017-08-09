<style scoped lang="less">
</style>

<template>
</template>

<script>
  import MyJoint from '../MyJoint'

  /** global planck **/
  export default {
    name: 'planck',
    methods: {
      setup (testbed) {
        testbed.speed = 1.3;
        testbed.hz = 50;

        var pl = planck, Vec2 = pl.Vec2;
        const gravityConstant = 10
        /**
         * @type {World}
         */
        var world = new pl.World({});
        const planetPoint = new Vec2(0, 0)

        /**
         * @type {Body}
         */
        const ball = world.createBody({
          type: 'dynamic',
          position: Vec2(0.0, 26.25),
//          linearDamping: 10,
          angularDamping: 0,
          allowSleep: false,
        })
        ball.createFixture(pl.Circle(1), {
          density: 10.0,
          friction: 0.85,
          restitution: 0.0,
        });

        /**
         * @type {Body}
         */
        const planetFix = world.createBody(Vec2(planetPoint))
        planetFix.createFixture(pl.Circle(0.0), 0)

        /**
         * @type {Body}
         */
        const planet = world.createBody({
          type: 'dynamic',
          position: Vec2(planetPoint),
          angularDamping: 0,
          allowSleep: false,
        })
        planet.createFixture(pl.Circle(25.0), {
          density: 0.1,
//          friction: 1.1,
          restitution: 0.0,
        });
        world.createJoint(pl.RevoluteJoint({}, planet, planetFix, Vec2(planetPoint)))
//        const gravityJoint = world.createJoint(pl.DistanceJoint({
//          frequencyHz: 3,
//          dampingRatio: 0.25,
//        }, planet, planet.getWorldCenter(), ball, ball.getWorldCenter()))

        const touchingDistanceSq = 26 * 26

        testbed.step = function () {
          // planet does not move
//          planet.setPosition(planetPoint)

          // gravity
          /**
           * @type {Vec2}
           */
          const dir = Vec2.sub(ball.getPosition(), planet.getPosition())
          const distanceSq = Vec2.lengthSquared(dir) || 0.0001
          dir.normalize(dir)
          const magnitude = -gravityConstant * (planet.getMass() * ball.getMass() / distanceSq)
          const force = Vec2.mul(dir, magnitude);
          ball.applyForceToCenter(force, true)

          // ball torque
//          if (distanceSq < touchingDistanceSq) {
//            ball.applyTorque(00, true)
//            ball.setAngularDamping(0)
//          } else {
//            ball.applyTorque(-ball.getAngularVelocity() * ball.getMass() / 26)
//            ball.setAngularDamping(0.5)
//          }

          if (testbed.activeKeys.up) {
            ball.applyTorque(5000, true)
          }
          if (testbed.activeKeys.down) {
            ball.applyTorque(-5000, true)
          }
          if (testbed.activeKeys.left) {
            ball.applyForceToCenter(force, true)
          }
        }

        return world;
      },
      tick () {
//        window.requestAnimationFrame(this.tick.bind(this))
//        world.step(1 / 120)
      },
    },
    beforeCreate() {
      this.world = planck.World()
    },
    mounted() {
//      window.requestAnimationFrame(this.tick.bind(this))
      planck.testbed(this.setup.bind(this))
    },
  }
</script>
