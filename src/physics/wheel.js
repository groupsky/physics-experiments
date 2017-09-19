import Physics from 'physicsjs'

Physics.body('wheel', 'circle', function (parent) {
  var defaults = {
    radius: 4,
  }

  return {
    init: function (options) {
      options = Physics.util.extend({}, defaults, options)

      parent.init.call(this, options)
    },

    // extended
    recalc: function () {
      parent.recalc.call(this)
      // moment of inertia
      this.inertia = 2 / 5 * this.mass * this.radius * this.radius
    }
  }
})

module.exports = Physics
