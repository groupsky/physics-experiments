<template>
  <div></div>
</template>

<script>
  import Physics from 'physicsjs'

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

        // create some bodies
        var ball = Physics.body('circle', {
          x: renderer.width / 2
          , y: renderer.height / 2 - 150 - 30
//        ,vx: -0.15
          , mass: 100
          , radius: 30
          , cof: 0.95
          , styles: {
            fillStyle: '#cb4b16'
            , angleIndicator: '#72240d'
          }
        });
        window.myball = ball
        ball.inertia = 2 / 5 * ball.mass * ball.radius * ball.radius
        ball.state.angular.acc = 1e-5
        world.add(ball)
        console.log(ball)

        var planet = Physics.body('circle', {
          x: renderer.width / 2
          , y: renderer.height / 2
          , radius: 350
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

        var center = Physics.body('point', {
          hidden: true,
          treatment: 'static',
          x: renderer.width / 2,
          y: renderer.width / 2,
        })
        world.add(center)

        // add some fun interaction
        var attractor = Physics.behavior('attractor', {
          order: 0,
          strength: .002
        });
        var vconst = Physics.behavior('verlet-constraints', {})
        vconst.distanceConstraint(planet, center, 1, 0)
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

        // add things to the world
        world.add([
          Physics.behavior('interactive', { el: renderer.container })
          , Physics.behavior('newtonian', { strength: .1 }).applyTo([ planet, ball ])
          , Physics.behavior('sweep-prune').applyTo([ planet, ball ])
          , Physics.behavior('body-collision-detection', { checkAll: false }).applyTo([ planet, ball ])
          , Physics.behavior('body-impulse-response').applyTo([ planet, ball ])
          , edgeBounce
        ]);

        // subscribe to ticker to advance the simulation
        Physics.util.ticker.on(function (time) {
          // torque
          let torque = 0.1
          torque -= ball.state.angular.vel * ball.state.angular.vel * 1e-6
          ball.state.angular.acc += torque / ball.inertia

          // air drag
          const velSq = ball.state.vel.normSq()
          let drag = 0.5 * 0.5 * velSq * Math.PI * ball.radius * ball.radius * 1e-3
          const force = ball.state.vel.clone()
          force.norm()
          force.mult(-drag)
          ball.state.acc.vadd(force)

          world.step(time);
        });
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
