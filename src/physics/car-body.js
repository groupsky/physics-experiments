import Physics from 'physicsjs'

Physics.body('car-body', 'convex-polygon', function (parent) {
  var defaults = {
    vertices: [
      { x: -15, y: 5 },
      { x: 15, y: 5 },
      { x: 15, y: 0 },
      { x: 0, y: -9 },
      { x: -11.5, y: -9 },
      { x: -15, y: -2 },
    ],
  }

  return {
    init: function (options) {
      options = Physics.util.extend({}, defaults, options)

      parent.init.call(this, options)
    },
  }
})

module.exports = Physics
