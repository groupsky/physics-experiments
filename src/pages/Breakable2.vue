<style scoped lang="less">
</style>

<template>
</template>

<script>
  /** global planck **/
  export default {
    name: 'planck',
    methods: {
      setup (testbed) {
        var pl = planck, Vec2 = pl.Vec2;
        var world = new pl.World(Vec2(0, -10));

        var m_velocity;
        var m_angularVelocity;

        var m_broke = false;
        var m_break = false;

        var e_count = 7;

        // Ground body
        var ground = world.createBody();
        ground.createFixture(pl.Edge(Vec2(-40.0, 0.0), Vec2(40.0, 0.0)), 0.0);

        // Mid pole body
        var pole = world.createBody({
          position: Vec2(0.0, 10.0),
        });
        pole.createFixture(pl.Edge(Vec2(-0.2, -0.2), Vec2(0.0, 0.0)), 0.0);
        pole.createFixture(pl.Edge(Vec2(0.0, 0.0), Vec2(0.2, -0.2)), 0.0);

        // Breakable dynamic body
        var m_body1 = world.createDynamicBody({
          position: Vec2(0.0, 40.0),
          angle: 0.25 * Math.PI,
          angularVelocity: 5,
        });

        var m_shape1 = pl.Box(0.5, 0.5, Vec2(-0.5, 0.0), 0.0);
        var m_piece1 = m_body1.createFixture(m_shape1, 1.0);

        var m_shape2 = pl.Box(0.5, 0.5, Vec2(0.5, 0.0), 0.0);
        var m_piece2 = m_body1.createFixture(m_shape2, 1.0);

        world.on('post-solve', function (contact, impulse) {
          if (m_broke) {
            // The body already broke.
            return;
          }

          // Should the body break?
          var count = contact.getManifold().pointCount;

          var maxImpulse = 0.0;
          for (var i = 0; i < count; ++i) {
            maxImpulse = Math.max(maxImpulse, impulse.normalImpulses[ i ]);
          }

          if (maxImpulse > 40.0) {
            // Flag the body for breaking.
            m_break = true;
          }
        });

        function Break () {
          // Create two bodies from one.
          var body1 = m_piece1.getBody();
          var center = body1.getWorldCenter();

          body1.destroyFixture(m_piece2);
          m_piece2 = null;

          var body2 = world.createDynamicBody({
            type: 'dynamic',
            position: body1.getPosition(),
            angle: body1.getAngle()
          });

          m_piece2 = body2.createFixture(m_shape2, 1.0);

          // Compute consistent velocities for new bodies based on
          // cached velocity.
          var center1 = body1.getWorldCenter();
          var center2 = body2.getWorldCenter();

          var velocity1 = Vec2.add(m_velocity, Vec2.cross(m_angularVelocity, Vec2.sub(center1, center)));
          var velocity2 = Vec2.add(m_velocity, Vec2.cross(m_angularVelocity, Vec2.sub(center2, center)));

          console.log(velocity1, velocity2);

          body1.setAngularVelocity(m_angularVelocity);
          body1.setLinearVelocity(velocity1);

          body2.setAngularVelocity(m_angularVelocity);
          body2.setLinearVelocity(velocity2);
        }

        testbed.step = function () {
          if (m_break) {
            Break();
            m_broke = true;
            m_break = false;
          }

          // Cache velocities to improve movement on breakage.
          if (m_broke == false) {
            m_velocity = m_body1.getLinearVelocity();
            m_angularVelocity = m_body1.getAngularVelocity();
          }
        };

        return world;
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
