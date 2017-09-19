<template>
  <canvas ref="canvas" width="800" height="600"></canvas>
</template>

<script>
  import pl from 'planck-js'
  import { Vec2 } from 'planck-js'
  import { rollingForce, radsToKmh, dragForce, msToKmh } from '../physicsUtils'
  const { min, cos, sin, PI, sqrt, round, asin, floor, ceil, acos } = Math
  const dx = 5
  const carScale = 5
  const hs = (function () {
    var hs = []
    const k = 2
    const o = 5

    for (let x = 0; x < 360 / 2; x++) {
      hs.push(((
        sin(k * 2 * (x + o) * PI / 180) +
        sin(k * 5 * (x + o) * PI / 180) +
        cos(k * 3 * (x + o) * PI / 180) +
        cos(k * 7 * (x + o) * PI / 180)) - 2.4) * 5)
    }

    return hs
  })()

  export default {
    name: 'hpplanck',
    data () {
      return {
        speed: 5,
        simHz: 50,
        suspensionHz: 18,
        suspensionDampingRatio: 0.7,
        gravity: 100,
        lastTick: new Date().getTime(),
        elapsedTime: 0,
        groundFriction: 1.0,
        wheelFriction: 1.0,
        torque: 50,
        wrapx: dx * hs.length,
      }
    },
    computed: {
      timeStep () {
        return 1 / this.simHz
      },
    },
    watch: {
      gravity (val) {
        this.world.gravity.y = -val
      },
      groundFriction (val) {
        this.updateBodyFriction(this.ground, val)
      },
      wheelFriction (val) {
        this.updateBodyFriction(this.wheelBack, val)
        this.updateBodyFriction(this.wheelFront, val)
      },
      suspensionHz (val) {
        this.springBack.setSpringFrequencyHz(val)
        this.springFront.setSpringFrequencyHz(val)
      },
      suspensionDampingRatio (val) {
        this.springBack.setSpringDampingRatio(val)
        this.springFront.setSpringDampingRatio(val)
      },
      torque (val) {
        this.springBack.setMotorSpeed(-val)
      },
    },
    methods: {
      carSpeed () {
        return msToKmh(this.car.getLinearVelocity().length())
      },
      updateBodyFriction(body, val) {
        for (let f = body.getFixtureList(); f; f = f.getNext()) {
          f.setFriction(val)
        }
        for (let c = body.getContactList(); c; c = c.next) {
          c.contact.setFriction(val)
        }
      },
      scheduleTick () {
        const self = this

        function t () {
          const now = new Date().getTime()
          const timeStep = self.timeStep
          self.elapsedTime += min(timeStep, (now - self.lastTick) * 0.001 * self.speed)
          while (self.elapsedTime > timeStep) {
            self.step(timeStep)
            self.elapsedTime -= timeStep
          }
          self.draw()
          self.scheduleTick()
        }

        //window.requestAnimationFrame(t)
        window.setTimeout(t, 10)
      },
      create () {
        const world = this.world = new pl.World({
          gravity: Vec2(0, -this.gravity)
        })

        /**
         * @type {Body}
         */
        this.ground = world.createBody()

        var groundFD = {
          density: 0.0,
          friction: this.groundFriction,
        }

        var x = -hs.length * dx, y1 = 0.0

        for (var j = 0; j < 3; ++j) {
          for (var i = 0; i < hs.length; ++i) {
            var y2 = hs[ i ]
            this.ground.createFixture(pl.Edge(Vec2(x, y1), Vec2(x + dx, y2)), groundFD)
            y1 = y2
            x += dx
          }
        }

        // Car
        /**
         * @type {Body}
         */
        this.car = world.createDynamicBody({
          position: Vec2(0.0, 0.75),
          gravityScale: 1,
          linearDamping: 0.1,
        })
        this.car.createFixture(pl.Polygon([
          Vec2(-1.5, -0.5),
          Vec2(1.5, -0.5),
          Vec2(1.5, 0.0),
          Vec2(0.0, 0.9),
          Vec2(-1.15, 0.9),
          Vec2(-1.5, 0.2)
        ]), 5)

        var wheelFD = {
          density: 1,
          friction: this.wheelFriction,
        }

        this.wheelBack = world.createDynamicBody({
          position: Vec2(-1.0, 0.35),
          gravityScale: 1,
          angularDamping: 0.25,
        })
        this.wheelBack.createFixture(pl.Circle(0.4), wheelFD)

        this.wheelFront = world.createDynamicBody({
          position: Vec2(1.0, 0.4),
          gravityScale: 1,
          angularDamping: 0.1,
        })
        this.wheelFront.createFixture(pl.Circle(0.4), wheelFD)

        /**
         * @type {WheelJoint}
         */
        this.springBack = world.createJoint(pl.WheelJoint({
          motorSpeed: -this.torque,
          maxMotorTorque: 10000.0,
          enableMotor: true,
          frequencyHz: this.suspensionHz,
          dampingRatio: this.suspensionDampingRatio,
        }, this.car, this.wheelBack, this.wheelBack.getPosition(), Vec2(0.0, 1.0)))

        /**
         * @type {WheelJoint}
         */
        this.springFront = world.createJoint(pl.WheelJoint({
          motorSpeed: 0.0,
          maxMotorTorque: 10000.0,
          enableMotor: false,
          frequencyHz: this.suspensionHz,
          dampingRatio: this.suspensionDampingRatio,
        }, this.car, this.wheelFront, this.wheelFront.getPosition(), Vec2(0.0, 1.0)))
      },
      step (timeStep) {
        const rfb = rollingForce(10, 2, radsToKmh(this.wheelBack.getAngularVelocity(), 2 * Math.PI * 0.4)) || 0
        this.wheelBack.applyTorque(-rfb * 0.4 * Math.sign(this.wheelBack.getAngularVelocity()))

        const rff = rollingForce(10, 2, radsToKmh(this.wheelFront.getAngularVelocity(), 2 * Math.PI * 0.4)) || 0
        this.wheelFront.applyTorque(-rff * 0.4 * Math.sign(this.wheelFront.getAngularVelocity()))

        /**
         * @type {Vec2}
         */
        const dv = Vec2.clone(this.car.getLinearVelocity())
        const speed = msToKmh(dv.length())
        const df = dragForce(0.35, speed, 2)
        dv.normalize()
        dv.mul(-df)
        this.car.applyForce(dv, this.car.getWorldCenter())

        const cx = this.car.getPosition().x
        const wrapx = this.wrapx
        if (cx >= wrapx) {
          [ this.car, this.wheelBack, this.wheelFront ].forEach(function (b) {
            const np = Vec2.clone(b.getPosition())
            np.x -= wrapx
            b.setPosition(np)
          })
        }

        this.world.step(timeStep)
      },
      draw () {
        const ctx = this.ctx
        ctx.fillStyle = '#ccc'
        ctx.fillRect(0, 0, 800, 600)

        if (false) {
          ctx.save()
          ctx.translate(0, 300)
          ctx.beginPath()
          ctx.moveTo(0, 0)
          const k = 1
          for (let i = 0, l = hs.length, x = i * dx, y = hs[ i ]; i < l; i++, x += dx, y = hs[ i ]) {
            ctx.lineTo(k * x, y * k)
          }
          ctx.stroke()

          const xx = this.car.getPosition().x * k
          const yy = this.car.getPosition().y * k
          ctx.fillStyle = '#c33'
          ctx.fillRect(xx - 1.5, yy - 1.5, 3, 3)
          ctx.save()
          ctx.translate(xx, yy)
          ctx.rotate(-this.car.getAngle())
          ctx.beginPath()
          ctx.moveTo(-1.5 * carScale * k, -0.2 * carScale * k)
          const carV = [
            [ -1.5, -0.5 ],
            [ 1.5, -0.5 ],
            [ 1.5, 0.0 ],
            [ 0.0, 0.9 ],
            [ -1.15, 0.9 ],
            [ -1.5, 0.2 ] ]
          carV.forEach(function (v) {
            ctx.lineTo(v[ 0 ] * carScale * k, -v[ 1 ] * carScale * k)
          })
          ctx.stroke()
          ctx.restore()

          ctx.restore()
        }

        const carAngle = PI / 2

        {
          ctx.save()
          ctx.translate(400, 300)
          ctx.beginPath()
          let first = true
          for (let i = 0, l = hs.length, x = i * dx, y = hs[ i ]; i < l; i++, x += dx, y = hs[ i ]) {
            const angle = 2 * PI * x / this.wrapx - carAngle
            const r = 200 + y * 5
            const xx = cos(angle) * r
            const yy = sin(angle) * r
            if (first) {
              ctx.moveTo(xx, yy)
              first = false
            } else {
              ctx.lineTo(xx, yy)
            }
          }
        }
        ctx.stroke()
        {
          const x = this.car.getPosition().x
          const y = this.car.getPosition().y
          const angle = 2 * PI * x / this.wrapx - carAngle
          const r = 200 + y * 5
          const xx = cos(angle) * r
          const yy = sin(angle) * r
          const x1 = ceil((x + 1) / dx)
          const x2 = floor((x - 1) / dx)
          /**
           * @type {Vec2}
           */
          const v1 = Vec2(x1 * dx, hs[ (x1 + hs.length) % hs.length ] * 5)
          /**
           * @type {Vec2}
           */
          const v2 = Vec2(x2 * dx, hs[ (x2 + hs.length) % hs.length ] * 5)
          v1.normalize()
          v2.normalize()
          const groundAngle = acos(Vec2.dot(v1, v2))
          console.log(groundAngle)
          ctx.fillStyle = '#c33'
          ctx.fillRect(xx - 1.5, yy - 1.5, 3, 3)
          ctx.save()
          ctx.translate(xx, yy)
          ctx.rotate(-groundAngle - this.car.getAngle() + angle + carAngle)
          ctx.beginPath()
          ctx.moveTo(-1.5 * carScale, -0.2 * carScale)
          const carV = [
            [ -1.5, -0.5 ],
            [ 1.5, -0.5 ],
            [ 1.5, 0.0 ],
            [ 0.0, 0.9 ],
            [ -1.15, 0.9 ],
            [ -1.5, 0.2 ] ]
          carV.forEach(function (v) {
            ctx.lineTo(v[ 0 ] * carScale, -v[ 1 ] * carScale)
          })
//          ctx.moveTo(-1 * carScale, 0)
          ctx.arc(-1 * carScale, 0.5 * carScale, 0.4 * carScale, 0, 2 * PI)
          ctx.arc(1 * carScale, 0.5 * carScale, 0.4 * carScale, 0, 2 * PI)
          ctx.stroke()
//          this.drawWheel(this.wheelBack, carAngle)
//          this.drawWheel(this.wheelFront, carAngle)
          ctx.restore()
        }

        const infos = [
          `Speed: ${round(this.carSpeed() * 10) / 10} km/h`,
          `Angle: ${round(this.car.getAngle() * 180 / PI * 10) / 10}`,
        ]
        for (let i = 0; i < infos.length; i++) {
          ctx.fillText(infos[ i ], -380, -280 + i * 20)
        }

        ctx.restore()
      },
      toPolar(vec, offset) {
        offset = offset || 0
        const x = vec.x
        const y = vec.y
        const angle = 2 * PI * x / this.wrapx - offset
        const r = 200 + y * 5
        const xx = cos(angle) * r
        const yy = sin(angle) * r
        return { x: xx, y: yy }
      },
      drawWheel(wheel, offset) {
        /**
         * @type {Vec2}
         */
        const pv = Vec2.clone(wheel.getPosition())
        pv.sub(this.car.getPosition())
        pv.mul(carScale)
        const p = this.toPolar(this.car.getPosition(), offset)
        this.ctx.beginPath()
        this.ctx.arc(p.x + pv.x, p.y - pv.y, 0.4 * carScale, 0, 2 * PI)
        this.ctx.stroke()
      }
    },
    mounted () {
      this.ctx = this.$refs.canvas.getContext('2d')

      this.create()
      this.scheduleTick()
    },
  }
</script>
