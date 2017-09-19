<style scoped lang="less">
</style>

<template>
</template>

<script>
  import MyJoint from '../MyJoint'
  import { rollingForce, radsToKmh, dragForce, msToKmh } from '../physicsUtils'
  const { sin, cos, PI } = Math

  /** global planck **/
  export default {
    name: 'planck',
    methods: {
      setup (testbed) {
        testbed.speed = 1.3
        testbed.hz = 60

        var pl = planck, Vec2 = pl.Vec2
        var world = new pl.World({
          gravity: Vec2(0, -25)
        })

        // wheel spring settings
        var HZ = 15.0
        var ZETA = 1
        var SPEED = 10.0

        var ground = world.createBody()

        var groundFD = {
          density: 0.0,
          friction: 1.0
        }

        const hs = (function () {
          var hs = []
          const k = 2
          const o = 5

          for (let x = 0; x < 360 / 2; x++) {
            hs.push(((
              sin(k * 2 * (x+o) * PI / 180) +
              sin(k * 5 * (x+o) * PI / 180) +
              cos(k * 3 * (x+o) * PI / 180) +
              cos(k * 7 * (x+o) * PI / 180)) - 2.4)*5)
          }

          return hs
        })()

        var x = -hs.length * 5.0, y1 = 0.0, dx = 5.0, wrapx = 5.0 * hs.length

        for (var j = 0; j < 3; ++j) {
          for (var i = 0; i < hs.length; ++i) {
            var y2 = hs[ i ]
            ground.createFixture(pl.Edge(Vec2(x, y1), Vec2(x + dx, y2)), groundFD)
            y1 = y2
            x += dx
          }
        }

        // Car
        /**
         * @type {Body}
         */
        var car = world.createDynamicBody({
          position: Vec2(0.0, 1),
          gravityScale: 1,
          linearDamping: 0.1,
        })
        car.createFixture(pl.Polygon([
          Vec2(-1.5, -0.5),
          Vec2(1.5, -0.5),
          Vec2(1.5, 0.0),
          Vec2(0.0, 0.9),
          Vec2(-1.15, 0.9),
          Vec2(-1.5, 0.2)
        ]), 1)
//        car.createFixture(pl.Polygon([
//          Vec2(0.85, -0.35),
//          Vec2(1.15, -0.35),
//          Vec2(1.15, -0.25),
//          Vec2(0.85, -0.25)
//        ]), 50)
        car.createFixture(pl.Polygon([
          Vec2(-1.5, -0.5),
          Vec2(1.5, -0.5),
          Vec2(1.5, -0.45),
          Vec2(-1.5, -0.45)
        ]), 12.5)

        var wheelFD = {
          density: 1,
          friction: 0.9
        }

        var wheelBack = world.createDynamicBody({
          position: Vec2(-1.0, 0.35),
          gravityScale: 1,
          angularDamping: 0.5,
        })
        wheelBack.createFixture(pl.Circle(0.4), wheelFD)

        var wheelFront = world.createDynamicBody({
          position: Vec2(1.0, 0.40),
          gravityScale: 1,
          angularDamping: 0.1,
        })
        wheelFront.createFixture(pl.Circle(0.4), wheelFD)

        var springBack = world.createJoint(pl.WheelJoint({
          motorSpeed: -SPEED,
          maxMotorTorque: 10000.0,
          enableMotor: true,
          frequencyHz: HZ,
          dampingRatio: ZETA
        }, car, wheelBack, wheelBack.getPosition(), Vec2(0.0, 1.0)))

        var springFront = world.createJoint(pl.WheelJoint({
          motorSpeed: -SPEED,
          maxMotorTorque: 10000.0,
          enableMotor: true,
          frequencyHz: HZ,
          dampingRatio: ZETA
        }, car, wheelFront, wheelFront.getPosition(), Vec2(0.0, 1.0)))

        testbed.keydown = function () {
          if (testbed.activeKeys.down) {
            HZ = Math.max(0.0, HZ - 1.0)
            springBack.setSpringFrequencyHz(HZ)
            springFront.setSpringFrequencyHz(HZ)

          } else if (testbed.activeKeys.up) {
            HZ += 1.0
            springBack.setSpringFrequencyHz(HZ)
            springFront.setSpringFrequencyHz(HZ)
          }
        }

        testbed.step = function () {
          const rfb = rollingForce(10, 2, radsToKmh(wheelBack.getAngularVelocity(), 2 * Math.PI * 0.4)) || 0
          wheelBack.applyTorque(-rfb * 0.4 * Math.sign(wheelBack.getAngularVelocity()))

          const rff = rollingForce(10, 2, radsToKmh(wheelFront.getAngularVelocity(), 2 * Math.PI * 0.4)) || 0
          wheelFront.applyTorque(-rff * 0.4 * Math.sign(wheelFront.getAngularVelocity()))

          /**
           * @type {Vec2}
           */
          const dv = Vec2.clone(car.getLinearVelocity())
          const speed = msToKmh(dv.length())
          const df = dragForce(0.35, speed, 2)
          dv.normalize()
          dv.mul(-df)
          car.applyForceToCenter(dv)

          const downforcev = Vec2(-dv.y, dv.x)
          downforcev.normalize()
          downforcev.mul( speed * speed * 0.25 )
//          car.applyForce(downforcev, car.getWorldPoint(Vec2(1, 0)))
//          car.applyForce(downforcev, car.getWorldPoint(Vec2(-1, 0)))
//          wheelBack.applyForceToCenter(downforcev)
//          wheelFront.applyForceToCenter(downforcev)


          if (testbed.activeKeys.right) {
            springBack.setMotorSpeed(springBack.getMotorSpeed() - SPEED)
            springFront.setMotorSpeed(springFront.getMotorSpeed() - SPEED)
          }
          if (testbed.activeKeys.left) {
            springBack.setMotorSpeed(springBack.getMotorSpeed() + SPEED)
            springFront.setMotorSpeed(springFront.getMotorSpeed() + SPEED)
          }

          var cp = car.getPosition()
          const cx = cp.x - car.getLinearVelocity().x / 10
          if (cx > testbed.x + 10) {
            testbed.x = cx - 10

          } else if (cx < testbed.x - 10) {
            testbed.x = cx + 10
          }
          if (cp.x >= wrapx) {
            [ car, wheelBack, wheelFront ].forEach(function (b) {
              const np = Vec2.clone(b.getPosition())
              np.x -= wrapx
              b.setPosition(np)
            })
            testbed.x -= wrapx
          } else if (cp.x < 0) {
            [ car, wheelBack, wheelFront ].forEach(function (b) {
              const np = Vec2.clone(b.getPosition())
              np.x += wrapx
              b.setPosition(np)
            })
            testbed.x += wrapx
          }
        }

        testbed.info('â†/â†’: Accelerate car, â†‘/â†“: Change spring frequency')

        return world
      },
    },
    mounted() {
      planck.testbed(this.setup.bind(this))
    },
  }
</script>
