<template>
  <div></div>
</template>

<script>
  import Physics from 'physicsjs'
  require('../physics/car')

  function createCar (x, y, mass) {
    const nodes = []
    const constraints = Physics.behavior('verlet-constraints', {
      iterations: 2,
      label: 'carConstraints',
    })

    const rearAnchor = Physics.body('circle', {
      x: x - 10,
      y: y - 10,
      radius: 3,
      label: 'rearAnchor',
    })

    const frontAnchor = Physics.body('circle', {
      x: x + 10,
      y: y - 10,
      radius: 3,
      label: 'frontAnchor',
    })

    const body = Physics.body('convex-polygon', {
      x: x,
      y: y - 10,
      mass: 0.95 * mass,
      label: 'body',
      vertices: [
        { x: -15, y: 5 },
        { x: 15, y: 5 },
        { x: 15, y: 0 },
        { x: 0, y: -9 },
        { x: -11.5, y: -9 },
        { x: -15, y: -2 },
      ],
    })

    const rearWheel = Physics.body('wheel', {
      x: x - 10,
      y: y - 3.5,
      mass: 0.025 * mass,
      label: 'rearWheel',
    })
    const frontWheel = Physics.body('wheel', {
      x: x + 10,
      y: y - 4,
      mass: 0.025 * mass,
      label: 'frontWheel',
    })

    const stiff = 1
//    constraints.distanceConstraint(rearAnchor, frontAnchor, stiff)
//    constraints.distanceConstraint(rearAnchor, body, stiff)
//    constraints.distanceConstraint(frontAnchor, body, stiff)
//    constraints.angleConstraint(rearWheel, rearAnchor, body, stiff)
//    constraints.angleConstraint(frontWheel, frontAnchor, body, stiff)
    constraints.distanceConstraint(rearWheel, body, stiff)
    constraints.distanceConstraint(frontWheel, body, stiff)
//    constraints.distanceConstraint(rearWheel, frontWheel, stiff)
    constraints.angleConstraint(rearWheel, body, frontWheel, 1)

    nodes.push(body)
    nodes.push(rearWheel)
    nodes.push(frontWheel)
    nodes.push(rearAnchor)
    nodes.push(frontAnchor)
    nodes.push(constraints)
    nodes.constraints = constraints
    return nodes
  }

  export default {
    name: 'physics',
    methods: {
      setup (world) {
        world.sleepDisabled = true

        // bounds of the window
        var viewportBounds = Physics.aabb(0, 0, window.innerWidth, window.innerHeight)
          , edgeBounce
          , renderer
          ;

        const constraints =

          // create a renderer
          renderer = Physics.renderer('canvas', {
            el: this.$el,
            meta: true,
          });

        // add the renderer
        world.add(renderer);
        // render on each step
        world.on('step', function () {
          world.render();
        });

        // constrain objects to these bounds
        edgeBounce = Physics.behavior('edge-collision-detection', {
          aabb: viewportBounds
          , restitution: 0.99
          , cof: 0.8
        });

        // resize events
        window.addEventListener('resize', function () {

          // as of 0.7.0 the renderer will auto resize... so we just take the values from the renderer
          viewportBounds = Physics.aabb(0, 0, renderer.width, renderer.height);
          // update the boundaries
          edgeBounce.setAABB(viewportBounds);

        }, true);

        var planet = Physics.body('circle', {
          x: renderer.width / 2
          , y: renderer.height / 2
          , radius: 150
          , mass: 10000
//        ,vx: 0.007
          , vy: 0
          , cof: 0.95
          , restitution: 0
          , styles: {
            fillStyle: '#6c71c4'
            , angleIndicator: '#3b3e6b'
          }
        });
        world.add(planet)

        var center = Physics.body('circle', {
          hidden: false,
          treatment: 'static',
          x: renderer.width / 2,
          y: renderer.height / 2,
        })
        world.add(center)

        // add some fun interaction
        var attractor = Physics.behavior('attractor', {
          order: 0,
          strength: .002
        });
        var vconst = Physics.behavior('verlet-constraints', {})
        vconst.distanceConstraint(planet, center, 2, 0)
        world.add(vconst)
        world.on({
          'interact:poke': function (pos) {
            world.wakeUpAll();
            attractor.position(pos);
            world.add(attractor);
          }
          , 'interact:move': function (pos) {
            attractor.position(pos);
          }
          , 'interact:release': function () {
            world.wakeUpAll();
            world.remove(attractor);
          }
        });

        const car = createCar(renderer.width / 2, renderer.height / 2 - 160, 10)
        world.add(car)

        // add things to the world
        world.add([
          Physics.behavior('interactive', { el: renderer.container })
          , Physics.behavior('newtonian', { strength: .01 }).applyTo([ planet, car[0], car[1], car[2] ])
          , Physics.behavior('sweep-prune').applyTo([ planet, car[1], car[2] ])
          , Physics.behavior('body-collision-detection', { checkAll: false }).applyTo([ planet, car[1], car[2] ])
          , Physics.behavior('body-impulse-response').applyTo([ planet, car[1], car[2] ])
          , edgeBounce
        ]);

        // subscribe to ticker to advance the simulation
        Physics.util.ticker.on(function (time) {
          // torque
          let torque = 0.1
          torque -= car[1].state.angular.vel * car[1].state.angular.vel * 1e-6
          car[1].state.angular.acc += torque / car[1].inertia
//          car.backWheel.
//
//          // air drag
//          const velSq = ball.state.vel.normSq()
//          let drag = 0.5 * 0.5 * velSq * Math.PI * ball.radius * ball.radius * 1e-3
//          const force = ball.state.vel.clone()
//          force.norm()
//          force.mult(-drag)
//          ball.state.acc.vadd(force)

          world.step(time);
        });

        world.warp(0.1)
      }
    },
    mounted () {
      Physics(this.setup.bind(this))
    },
  }

</script>

<style scoped>
  div {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
</style>
