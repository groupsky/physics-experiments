<style scoped lang="less">
</style>

<template>
</template>

<script>
  /** global planck **/
  const SCALE = 1
  const TRAILERS = 1
  const MAX_DIFF = 100

  const TYPE_GROUND = 1
  const TYPE_CAR = 2
  const TYPE_EGG = 4
  const MIN_Y = -15
  const MAX_Y = 35

  const { acos, abs, cos, sin, min, max, PI, floor, random, ceil, round } = Math

  export default {
    name: 'planck',
    methods: {
      setup (testbed) {

        testbed.speed = 1.3;
        testbed.hz = 50;

        var pl = planck, Vec2 = pl.Vec2;
        var world = new pl.World({
          gravity: Vec2(0, -15)
        });

        // wheel spring settings
        var HZ = 5.0;
        var ZETA = 0.7;
        var SPEED = 150.0 * SCALE * SCALE;
        var TRAILER_DIST = 0.75 * SCALE
        var TRAILER_HEIGHT = 0.5 * SCALE

        var ground = world.createBody({
          userData: {
            type: 'gnd',
          },
        });

        var groundFD = {
          density: 0.0,
          friction: 100,
          filterCategoryBits: TYPE_GROUND,
        };

        var p = { x: 20.0, y: 0.0, lastType: 0 }
        var d = 1
        ground.createFixture(pl.Edge(Vec2(-200.0, 0.0), Vec2(p.x, p.y)), groundFD);
        while (p.x < 2000) {
          p = createGround(ground, p, {
            difficulty: d,
            lastType: p.lastType
          })
          d = min(MAX_DIFF, d + 1)
        }

//        const hs = (function () {
//          var hs = []
//          let k = 1
//          const o = 0
//
//          for (let x = 0; x < 360 * 2; x++, k += 0.001) {
//            hs.push((0 + ((
//              sin(k * 2 * (x + o) * PI / 180) +
//              sin(k * 5 * (x + o) * PI / 180) +
//              cos(k * 3 * (x + o) * PI / 180) +
//              cos(k * 7 * (x + o) * PI / 180)) + 1) * min(100, x)) / (1 + min(10, x)))
//          }
//
//          return hs
//        })()
//
//        var x = 20, y1 = 0.0, dx = 5.0, wrapx = 5.0 * hs.length
//
//        for (var j = 0; j < 3; ++j) {
//          for (var i = 0; i < hs.length; ++i) {
//            var y2 = hs[ i ]
//            ground.createFixture(pl.Edge(Vec2(x, y1), Vec2(x + dx, y2)), groundFD)
//            y1 = y2
//            x += dx
//          }
//        }
//
//        for (var i = 0; i < 10; ++i) {
//          var y2 = hs[ i ];
//          ground.createFixture(pl.Edge(Vec2(x, y1), Vec2(x + dx, y2)), groundFD);
//          y1 = y2;
//          x += dx;
//        }
//
//        ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x + 40.0, 0.0)), groundFD);
//
//        x += 80.0;
//        ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x + 40.0, 0.0)), groundFD);
//
//        x += 40.0;
//        ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x + 10.0, 5.0)), groundFD);
//
//        x += 20.0;
//        ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x + 40.0, 0.0)), groundFD);
//
//        x += 40.0;
//        ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x, 20.0)), groundFD);

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
          density: 1.0,
          filterCategoryBits: TYPE_CAR
        }
        var car = world.createDynamicBody({
          position: Vec2(0.15 * SCALE, 1.1 * SCALE),
          angularDamping: 0.95,
          linearDamping: 0.25,
        });
        car.createFixture(pl.Polygon([
          Vec2(-1.5 * SCALE, -0.5 * SCALE),
          Vec2(1.5 * SCALE, -0.5 * SCALE),
          Vec2(1.5 * SCALE, 0.0 * SCALE),
          Vec2(0.0 * SCALE, 0.9 * SCALE),
          Vec2(-1.15 * SCALE, 0.9 * SCALE),
          Vec2(-1.5 * SCALE, 0.2 * SCALE)
        ]), carFD);
//        car.createFixture(pl.Polygon([
//          Vec2(-1.4 * SCALE, -0.4 * SCALE),
//          Vec2(1.4 * SCALE, -0.4 * SCALE),
//          Vec2(1.4 * SCALE, -0.1 * SCALE),
//          Vec2(-1.4 * SCALE, -0.1 * SCALE),
//        ]), {
//          density: 1,
//          filterCategoryBits: 0
//        })
        car.createFixture(pl.Polygon([
          Vec2(0.2 * SCALE, -0.4 * SCALE),
          Vec2(1.4 * SCALE, -0.4 * SCALE),
          Vec2(1.4 * SCALE, -0.1 * SCALE),
          Vec2(0.2 * SCALE, -0.1 * SCALE),
        ]), {
          density: 1,
          filterCategoryBits: 0
        })

        var wheelFD = {
          density: 1.75,
          friction: 100,
          restitution: 0.5,
          filterCategoryBits: TYPE_CAR,
        }

        var wheelBack = world.createDynamicBody({
          position: Vec2((-1.0 + 0.15) * SCALE, 0.35 * SCALE),
          angularDamping: 0.1,
        });
        wheelBack.createFixture(pl.Circle(0.4 * SCALE), wheelFD);

        var wheelFront = world.createDynamicBody({
          position: Vec2((1.0 + 0.15) * SCALE, 0.35 * SCALE),
          angularDamping: 0.1,
        });
        wheelFront.createFixture(pl.Circle(0.35 * SCALE), wheelFD);

        var springBack = world.createJoint(pl.WheelJoint({
          motorSpeed: 0.0,
          maxMotorTorque: power(TRAILERS, true),
          enableMotor: false,
          frequencyHz: HZ,
          dampingRatio: ZETA
        }, car, wheelBack, wheelBack.getPosition(), Vec2(0.0, 1.0)));

        var springFront = world.createJoint(pl.WheelJoint({
          motorSpeed: 0.0,
          maxMotorTorque: power(TRAILERS, false),
          enableMotor: false,
          frequencyHz: HZ,
          dampingRatio: ZETA
        }, car, wheelFront, wheelFront.getPosition(), Vec2(0.0, 1.0)));

        // trailer
        var prev = car
        var prevT = null
        var eggFD = {
          density: 2/3,
          restitution: 0.5,
          filterCategoryBits: TYPE_EGG,
        }

        var trailers = []
        for (var i = 0; i < TRAILERS; i++) {
          var trailer = createTrailer(-2 * SCALE - i * (TRAILER_DIST + 1.25 * SCALE))
          var joinTrailer = world.createJoint(pl.WeldJoint({
            frequencyHz: 1,
            dampingRatio: ZETA,
          }, prev, trailer.body, Vec2.add(Vec2(0.55 * SCALE + TRAILER_DIST, -0.15 * SCALE), trailer.body.getPosition())))
          prev = trailer.body
          trailer.join = joinTrailer
          trailers.push(trailer)
          if (prevT) prevT.next = trailer
          prevT = trailer

          var egg = world.createDynamicBody({
            position: Vec2(-2.75 * SCALE - i * (TRAILER_DIST + 1.25 * SCALE), 1.5 * SCALE),
            angle: Math.PI * (Math.random() - 0.5) / 10,
            userData: {
              type: 'egg',
              broken: false,
            }
          })
          egg.createFixture(pl.Circle(Vec2(0 * SCALE, 0 * SCALE), 1 / 2 * SCALE), eggFD)
          egg.createFixture(pl.Circle(Vec2(0 * SCALE, 0.5 * SCALE), 1 / 3 * SCALE), eggFD)
          egg.createFixture(pl.Edge(Vec2(0.5 * SCALE, 0.0 * SCALE), Vec2(1 / 3 * SCALE, 0.5 * SCALE)), eggFD)
          egg.createFixture(pl.Edge(Vec2(-0.5 * SCALE, 0.0 * SCALE), Vec2(-1 / 3 * SCALE, 0.5 * SCALE)), eggFD)

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
          if (a && a.type === 'gnd' && b && b.type === 'egg') {
            breakAnEgg(contact.getFixtureB().getBody())
          }
          if (a && a.type === 'egg' && b && b.type === 'gnd') {
            breakAnEgg(contact.getFixtureA().getBody())
          }

          // Should the body break?
          var count = contact.getManifold().pointCount;

          var maxImpulse = 0.0;
          for (var i = 0; i < count; ++i) {
            maxImpulse = Math.max(maxImpulse, impulse.normalImpulses[ i ]);
          }

          if (maxImpulse > 20 * SCALE * SCALE) {
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
            springFront.setMotorSpeed(0);
            springFront.enableMotor(true);
          } else if (testbed.activeKeys.right) {
            springBack.setMotorSpeed(-SPEED);
            springBack.enableMotor(true);
            springFront.setMotorSpeed(-SPEED);
            springFront.enableMotor(true);
//            car.applyLinearImpulse(car.getWorldVector(Vec2(25, 0)), Vec2.add(Vec2(-1, -1), car.getWorldCenter()), true)
//            car.applyLinearImpulse(car.getWorldVector(Vec2(0, 0)), Vec2.add(Vec2(-1, -1), car.getWorldCenter()), true)

          } else if (testbed.activeKeys.left) {
            springBack.setMotorSpeed(+SPEED);
            springBack.enableMotor(true);
            springFront.setMotorSpeed(+SPEED);
            springFront.enableMotor(true);
//            car.applyLinearImpulse(car.getWorldVector(Vec2(-25, 0)), Vec2.add(Vec2(+1, -1), car.getWorldCenter()), true)

          } else {
            springBack.setMotorSpeed(0);
            springBack.enableMotor(false);
            springFront.setMotorSpeed(0);
            springFront.enableMotor(false);
          }

          var cp = car.getPosition();
          if (cp.x > testbed.x + 10) {
            testbed.x = cp.x - 10;

          } else if (cp.x < testbed.x - 10) {
            testbed.x = cp.x + 10;
          }

          var prevVec = car.getWorldVector(fwVec)
          var prevTrailer = null
          for (var trailer = trailers[ 0 ], len = 0; trailer; trailer = trailer.next, len++) {
            var trailVec = trailer.body.getWorldVector(fwVec)
            var angle = acos(Vec2.dot(prevVec, trailVec))
            if (abs(angle) > PI / 2) {
              console.log('angle', angle, 'trailer', len)
              springBack.setMaxMotorTorque(power(len, true))
              springFront.setMaxMotorTorque(power(len, false))
              detachTrailer(trailer)
              if (prevTrailer) {
                prevTrailer.next = null
              }
            }
            prevTrailer = trailer
            prevVec = trailVec
          }

          car.applyTorque(-car.getAngle()*75)
        };

        testbed.info('←/→: Accelerate car, ↑/↓: Change spring frequency');

        return world;

        function createTrailer (offset) {
          var trailer = {}
          var trailerFD = {
            density: 0.40,
            filterCategoryBits: TYPE_CAR,
          }
          trailer.body = world.createDynamicBody(Vec2(offset - TRAILER_DIST, 1.0 * SCALE));
          trailer.body.createFixture(pl.Polygon([
            Vec2(-0.5 * SCALE, -0.5 * SCALE),
            Vec2(0.5 * SCALE, -0.5 * SCALE),
            Vec2(0.8 * SCALE, 0.0 * SCALE),
            Vec2(-0.8 * SCALE, 0.0 * SCALE),
          ]), trailerFD);
          trailer.body.createFixture(pl.Polygon([
            Vec2(0.8 * SCALE, 0.0 * SCALE),
            Vec2(0.8 * SCALE, TRAILER_HEIGHT),
            Vec2(0.6 * SCALE, TRAILER_HEIGHT),
            Vec2(0.25 * SCALE, 0.0 * SCALE),
          ]), trailerFD);
          trailer.body.createFixture(pl.Polygon([
            Vec2(-0.25 * SCALE, 0.0 * SCALE),
            Vec2(-0.6 * SCALE, TRAILER_HEIGHT),
            Vec2(-0.8 * SCALE, TRAILER_HEIGHT),
            Vec2(-0.8 * SCALE, 0.0 * SCALE),
          ]), trailerFD);
          trailer.body.createFixture(pl.Edge(Vec2(0.63 * SCALE, -0.15 * SCALE), Vec2(0.63 * SCALE + TRAILER_DIST, -0.15 * SCALE)), trailerFD)

          trailer.wheel = world.createDynamicBody({
            position: Vec2(offset - TRAILER_DIST, 0.35 * SCALE),
            angularDamping: 0.1,
          });
          trailer.wheel.createFixture(pl.Circle(0.4 * SCALE), wheelFD);

          trailer.spring = world.createJoint(pl.WheelJoint({
            motorSpeed: 0.0,
            maxMotorTorque: 20.0,
            enableMotor: false,
            frequencyHz: HZ,
            dampingRatio: ZETA
          }, trailer.body, trailer.wheel, trailer.wheel.getPosition(), Vec2(0.0, 1.0)));

          return trailer
        }

        function killBody (body) {
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

        function detachTrailer (trailer) {
          if (trailer.detached) return
          world.destroyJoint(trailer.join)
          while (trailer) {
            trailer.detached = true
            killBody(trailer.body)
            killBody(trailer.wheel)
            trailer = trailer.next
          }
        }

        function power (len, front) {
          return (front ? 1 : 3) * len * SCALE * SCALE + (front ? 5 : 15) * SCALE * SCALE
        }

        function createGround (body, pos, opts) {
          opts = opts || {}
          var type = opts.type
          while ((type === opts.lastType) || (type === undefined)) {
            type = floor(random() * 10)
          }
          var diff = ceil(2 * min(opts.difficulty || floor(random() * MAX_DIFF), MAX_DIFF) / MAX_DIFF)
          var i, j, x, y, width, height, angle, radius
          switch (type) {
            // flat
            case 0:
            case 5:
            case 6:
            case 7:
              width = opts.width || 1 + diff * floor(2 + random() * 2) + floor(random() * 3)
              body.createFixture(pl.Edge(pos, Vec2(pos.x + width, pos.y)), groundFD);
              return { x: pos.x + width, y: pos.y, lastType: 0 }
            // up
            case 1:
            case 8:
              width = round(diff * (5 + random() * (diff + 1) * 6))
              height = width * diff / 5
              if (pos.y + height > MAX_Y) return { x: p.x, y: p.y, lastType: opts.lastType }

              x = pos.x
              y = pos.y
              for (i = -PI / 2; i <= PI / 2; i += PI / width) {
                j = (1 + sin(i)) * height / 2
                body.createFixture(pl.Edge(Vec2(x, y), Vec2(x + 1, pos.y + j)), groundFD);
                x++
                y = pos.y + j
              }
              return { x: x, y: y, lastType: 1 }
            // down
            case 2:
            case 9:
              width = round(diff * (5 + random() * (diff + 1) * 6))
              height = width * diff / 3
              if (pos.y - height < MIN_Y) return { x: p.x, y: p.y, lastType: opts.lastType }

              x = pos.x
              y = pos.y
              for (i = PI / 2; i >= -PI / 2; i -= PI / width) {
                j = (sin(i) - 1) * height / 2
                body.createFixture(pl.Edge(Vec2(x, y), Vec2(x + 1, pos.y + j)), groundFD);
                x++
                y = pos.y + j
              }
              return { x: x, y: y, lastType: 2 }
            // bridge
            case 3:
              width = 4 + floor((4 - diff) * random() * 16)

              var bridgeFD = {
                density: 1.0,
                friction: 60,
                filterCategoryBits: TYPE_GROUND,
              };

              var prevBody = body;
              for (var i = 0; i < width / 2; ++i) {
                var bridgeBlock = world.createDynamicBody({
                  position: Vec2(pos.x + 1.0 + 2.0 * i, pos.y - 0.125),
                  userData: {
                    type: 'gnd',
                  },
                });
                bridgeBlock.createFixture(pl.Box(1.0, 0.125), bridgeFD);

                world.createJoint(pl.RevoluteJoint({}, prevBody, bridgeBlock, Vec2(pos.x + 2.0 * i, pos.y - 0.125)));

                prevBody = bridgeBlock;
              }

              world.createJoint(pl.RevoluteJoint({}, prevBody, body, Vec2(pos.x + 2.0 * i, pos.y - 0.125)));

              return createGround(body, { x: pos.x + 2.0 * i, y: pos.y }, Object.assign({}, opts, {
                type: 0,
                lastType: 3
              }))

            // Teeter
            case 4:
              width = 3 + floor(3 - random() * diff) * 12
              angle = 4 + round(random()*16)
              var teeter = world.createDynamicBody({
                position: Vec2(pos.x + width / 2, pos.y + sin(angle * PI / 180) * width / 2 - 0.125),
                userData: {
                  type: 'gnd',
                },
              });
              teeter.createFixture(pl.Box(width / 2, 0.25), {
                density: 1.0,
                filterCategoryBits: TYPE_GROUND,
              });
              world.createJoint(pl.RevoluteJoint({
                lowerAngle: -angle * Math.PI / 180.0,
                upperAngle: angle * Math.PI / 180.0,
                enableLimit: true
              }, body, teeter, teeter.getPosition()));

              teeter.applyAngularImpulse(100.0, true);
              return createGround(body, { x: pos.x + width, y: pos.y }, Object.assign({}, opts, {
                type: 0,
                lastType: 4
              }))
          }
        }
      },
    },
    mounted() {
      planck.testbed(this.setup.bind(this))
    },
  }
</script>
