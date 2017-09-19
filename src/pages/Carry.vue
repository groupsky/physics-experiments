<style scoped lang="less">
</style>

<template>
</template>

<script>
  /** global planck **/

  const TYPE_GROUND = 1
  const TYPE_CAR = 2
  const TYPE_EGG = 4

  const { acos, abs, cos, sin, min, max, PI } = Math

  export default {
    name: 'planck',
    methods: {
      setup (testbed) {

        testbed.speed = 1.3;
        testbed.hz = 50;

        var pl = planck, Vec2 = pl.Vec2;
        var world = new pl.World({
          gravity: Vec2(0, -10)
        });

        // wheel spring settings
        var HZ = 6.0;
        var ZETA = 0.7;
        var SPEED = 75.0;
        var TRAILER_DIST = 1
        var TRAILER_HEIGHT = 0.5

        var ground = world.createBody();

        var groundFD = {
          density: 0.0,
          friction: 1.6,
          filterCategoryBits: TYPE_GROUND,
        };

        ground.createFixture(pl.Edge(Vec2(-200.0, 0.0), Vec2(20.0, 0.0)), groundFD);

        const hs = (function () {
          var hs = []
          let k = 2
          const o = 0

          for (let x = 0; x < 360 / 2; x++, k += 0.01) {
            hs.push((0 + ((
              sin(k * 2 * (x + o) * PI / 180) +
              sin(k * 5 * (x + o) * PI / 180) +
              cos(k * 3 * (x + o) * PI / 180) +
              cos(k * 7 * (x + o) * PI / 180)) + 1) * min(100, x)) / (1 + min(10, x)))
          }

          return hs
        })()

        var x = 20, y1 = 0.0, dx = 5.0, wrapx = 5.0 * hs.length

        for (var j = 0; j < 3; ++j) {
          for (var i = 0; i < hs.length; ++i) {
            var y2 = hs[ i ]
            ground.createFixture(pl.Edge(Vec2(x, y1), Vec2(x + dx, y2)), groundFD)
            y1 = y2
            x += dx
          }
        }

        for (var i = 0; i < 10; ++i) {
          var y2 = hs[ i ];
          ground.createFixture(pl.Edge(Vec2(x, y1), Vec2(x + dx, y2)), groundFD);
          y1 = y2;
          x += dx;
        }

        ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x + 40.0, 0.0)), groundFD);

        x += 80.0;
        ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x + 40.0, 0.0)), groundFD);

        x += 40.0;
        ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x + 10.0, 5.0)), groundFD);

        x += 20.0;
        ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x + 40.0, 0.0)), groundFD);

        x += 40.0;
        ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x, 20.0)), groundFD);

//        // Teeter
//        var teeter = world.createDynamicBody(Vec2(140.0, 1.0));
//        teeter.createFixture(pl.Box(10.0, 0.25), 1.0);
//        world.createJoint(pl.RevoluteJoint({
//          lowerAngle : -8.0 * Math.PI / 180.0,
//          upperAngle : 8.0 * Math.PI / 180.0,
//          enableLimit : true
//        }, ground, teeter, teeter.getPosition()));
//
//        teeter.applyAngularImpulse(100.0, true);
//
//        // Bridge
//        var bridgeFD = {};
//        bridgeFD.density = 1.0;
//        bridgeFD.friction = 0.6;
//
//        var prevBody = ground;
//        for (var i = 0; i < 20; ++i) {
//          var bridgeBlock = world.createDynamicBody(Vec2(161.0 + 2.0 * i, -0.125));
//          bridgeBlock.createFixture(pl.Box(1.0, 0.125), bridgeFD);
//
//          world.createJoint(pl.RevoluteJoint({}, prevBody, bridgeBlock, Vec2(160.0 + 2.0 * i, -0.125)));
//
//          prevBody = bridgeBlock;
//        }
//
//        world.createJoint(pl.RevoluteJoint({}, prevBody, ground, Vec2(160.0 + 2.0 * i, -0.125)));

        // Boxes
//        var box = pl.Box(0.5, 0.5);
//
//        world.createDynamicBody(Vec2(230.0, 0.5))
//          .createFixture(box, 0.5);
//
//        world.createDynamicBody(Vec2(230.0, 1.5))
//          .createFixture(box, 0.5);
//
//        world.createDynamicBody(Vec2(230.0, 2.5))
//          .createFixture(box, 0.5);
//
//        world.createDynamicBody(Vec2(230.0, 3.5))
//          .createFixture(box, 0.5);
//
//        world.createDynamicBody(Vec2(230.0, 4.5))
//          .createFixture(box, 0.5);

        // Car
        var carFD = {
          density: 5.0,
          filterCategoryBits: TYPE_CAR
        }
        var car = world.createDynamicBody(Vec2(0.0, 1.0));
        car.createFixture(pl.Polygon([
          Vec2(-1.5, -0.5),
          Vec2(1.5, -0.5),
          Vec2(1.5, 0.0),
          Vec2(0.0, 0.9),
          Vec2(-1.15, 0.9),
          Vec2(-1.5, 0.2)
        ]), carFD);

        var wheelFD = {
          density: 1.0,
          friction: 1.9,
          filterCategoryBits: TYPE_CAR,
        }

        var wheelBack = world.createDynamicBody({
          position: Vec2(-1.0, 0.35),
          angularDamping: 0.1,
        });
        wheelBack.createFixture(pl.Circle(0.4), wheelFD);

        var wheelFront = world.createDynamicBody({
          position: Vec2(1.0, 0.4),
          angularDamping: 0.1,
        });
        wheelFront.createFixture(pl.Circle(0.4), wheelFD);

        var springBack = world.createJoint(pl.WheelJoint({
          motorSpeed: 0.0,
          maxMotorTorque: 1000.0,
          enableMotor: true,
          frequencyHz: HZ,
          dampingRatio: ZETA
        }, car, wheelBack, wheelBack.getPosition(), Vec2(0.0, 1.0)));

        var springFront = world.createJoint(pl.WheelJoint({
          motorSpeed: 0.0,
          maxMotorTorque: 10.0,
          enableMotor: false,
          frequencyHz: HZ,
          dampingRatio: ZETA
        }, car, wheelFront, wheelFront.getPosition(), Vec2(0.0, 1.0)));

        // trailer
        var prev = car
        var prevT = null
        var eggFD = {
          density: 5.0,
          friction: 0.6,
          filterCategoryBits: TYPE_EGG,
        }

        var trailers = []
        for (var i = 0; i < 15; i++) {
          var trailer = createTrailer(-2 - i * (TRAILER_DIST + 1.25))
          var joinTrailer = world.createJoint(pl.WeldJoint({
            frequencyHz: HZ,
            dampingRatio: ZETA,
          }, prev, trailer.body, Vec2.add(Vec2(0.55 + TRAILER_DIST, -0.15), trailer.body.getPosition())))
          prev = trailer.body
          trailer.join = joinTrailer
          trailers.push(trailer)
          if (prevT) prevT.next = trailer
          prevT = trailer

          var egg = world.createDynamicBody({
            position: Vec2(-3 - i * (1.25 + TRAILER_DIST), 1.75),
            angle: Math.PI * (Math.random() - 0.5) / 10,
            userData: {
              type: 'egg',
              broken: false,
            }
          })
          egg.createFixture(pl.Circle(Vec2(0, 0), 1 / 2), eggFD)
          egg.createFixture(pl.Circle(Vec2(0, 0.5), 1 / 3), eggFD)
          egg.createFixture(pl.Edge(Vec2(0.5, 0.0), Vec2(1 / 3, 0.5)), eggFD)
          egg.createFixture(pl.Edge(Vec2(-0.5, 0.0), Vec2(-1 / 3, 0.5)), eggFD)

        }

//        world.on('pre-solve', function (contact) {
//          const a = contact.getFixtureA().getBody().getUserData()
//          const b = contact.getFixtureB().getBody().getUserData()
//
//          if (a && a.type === 'egg' && a.broken) {
//            contact.setEnabled(false)
//          }
//          if (b && b.type === 'egg' && b.broken) {
//            contact.setEnabled(false)
//          }
//        })

        world.on('post-solve', function (contact, impulse) {
          const a = contact.getFixtureA().getBody().getUserData()
          const b = contact.getFixtureB().getBody().getUserData()

          if (!((a && a.type === 'egg') || (b && b.type === 'egg'))) return

          // Should the body break?
          var count = contact.getManifold().pointCount;

          var maxImpulse = 0.0;
          for (var i = 0; i < count; ++i) {
            maxImpulse = Math.max(maxImpulse, impulse.normalImpulses[ i ]);
          }

          if (maxImpulse > 20) {
            if (a && a.type === 'egg') {
              breakAnEgg(contact.getFixtureA().getBody())
            }
            if (b && b.type === 'egg') {
              breakAnEgg(contact.getFixtureB().getBody())
            }
          }
        });

        const fwVec = Vec2(1, 0)
        testbed.keydown = function () {
          if (testbed.activeKeys.down) {
            HZ = Math.max(0.0, HZ - 1.0);
            springBack.setSpringFrequencyHz(HZ);
            springFront.setSpringFrequencyHz(HZ);
//            springTrailer.setSpringFrequencyHz(HZ);

          } else if (testbed.activeKeys.up) {
            HZ += 1.0;
            springBack.setSpringFrequencyHz(HZ);
            springFront.setSpringFrequencyHz(HZ);
//            springTrailer.setSpringFrequencyHz(HZ);
          }
        };

        testbed.step = function () {
          if (testbed.activeKeys.right && testbed.activeKeys.left) {
            springBack.setMotorSpeed(0);
            springBack.enableMotor(true);

          } else if (testbed.activeKeys.right) {
            springBack.setMotorSpeed(-SPEED);
            springBack.enableMotor(true);
            car.applyLinearImpulse(car.getWorldVector(Vec2(15, 0)), car.getPosition(), true)

          } else if (testbed.activeKeys.left) {
            springBack.setMotorSpeed(+SPEED);
            springBack.enableMotor(true);

          } else {
            springBack.setMotorSpeed(0);
            springBack.enableMotor(false);
          }

          var cp = car.getPosition();
          if (cp.x > testbed.x + 10) {
            testbed.x = cp.x - 10;

          } else if (cp.x < testbed.x - 10) {
            testbed.x = cp.x + 10;
          }

          var prevVec = car.getWorldVector(fwVec)
          var prevTrailer = null
          for (var trailer = trailers[0]; trailer; trailer = trailer.next) {
            var trailVec = trailer.body.getWorldVector(fwVec)
            var angle = acos(Vec2.dot(prevVec, trailVec))
            if (abs(angle) > PI / 4) {
              detachTrailer(trailer)
              if (prevTrailer) {
                prevTrailer.next = null
              }
            }
            prevTrailer = trailer
            prevVec = trailVec
          }
        };

        testbed.info('←/→: Accelerate car, ↑/↓: Change spring frequency');

        return world;

        function createTrailer (offset) {
          var trailer = {}
          var trailerFD = {
            density: 1.0,
            friction: 0.6,
            filterCategoryBits: TYPE_CAR,
          }
          trailer.body = world.createDynamicBody(Vec2(offset - TRAILER_DIST, 1.0));
          trailer.body.createFixture(pl.Polygon([
            Vec2(-0.5, -0.5),
            Vec2(0.5, -0.5),
            Vec2(0.8, 0.0),
            Vec2(-0.8, 0.0),
          ]), trailerFD);
          trailer.body.createFixture(pl.Polygon([
            Vec2(0.8, 0.0),
            Vec2(0.8, TRAILER_HEIGHT),
            Vec2(0.6, TRAILER_HEIGHT),
            Vec2(0.25, 0.0),
          ]), trailerFD);
          trailer.body.createFixture(pl.Polygon([
            Vec2(-0.25, 0.0),
            Vec2(-0.6, TRAILER_HEIGHT),
            Vec2(-0.8, TRAILER_HEIGHT),
            Vec2(-0.8, 0.0),
          ]), trailerFD);
          trailer.body.createFixture(pl.Edge(Vec2(0.75, -0.15), Vec2(0.55 + TRAILER_DIST, -0.15)), trailerFD)

          trailer.wheel = world.createDynamicBody({
            position: Vec2(offset - TRAILER_DIST, 0.35),
            angularDamping: 0.1,
          });
          trailer.wheel.createFixture(pl.Circle(0.4), wheelFD);

          trailer.spring = world.createJoint(pl.WheelJoint({
            motorSpeed: 0.0,
            maxMotorTorque: 20.0,
            enableMotor: false,
            frequencyHz: HZ,
            dampingRatio: ZETA
          }, trailer.body, trailer.wheel, trailer.wheel.getPosition(), Vec2(0.0, 1.0)));

          return trailer
        }

        function killBody(body) {
          for (var f = body.getFixtureList(); f; f = f.getNext()) {
            f.setFilterData({
              groupIndex: f.getFilterGroupIndex(),
              categoryBits: f.getFilterCategoryBits(),
              maskBits: TYPE_GROUND,
            })
            if (f.ui) {
              f.ui.parent().remove(f.ui)
              f.ui = false
            }
          }
          body.render = body.render || {}
          body.render.stroke = 'rgba(255,63,63,0.6)'
        }

        function breakAnEgg (egg) {
          egg.getUserData().broken = true
          killBody(egg)
        }

        function detachTrailer(trailer) {
          if (trailer.detached) return
          world.destroyJoint(trailer.join)
          while (trailer) {
            trailer.detached = true
            killBody(trailer.body)
            killBody(trailer.wheel)
            trailer = trailer.next
          }
        }
      },
    },
    beforeCreate() {
      this.world = planck.World()
    },
    mounted() {
      planck.testbed(this.setup.bind(this))
    },
  }
</script>
