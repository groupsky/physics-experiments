import Physics from 'physicsjs'

require('./car-body')
require('./wheel')

Physics.body('car', 'compound', function (parent) {
  var defaults = {}

  return {
    init: function (options) {
      options = Physics.util.extend({}, defaults, options)

      parent.init.call(this, options)

      this.body = Physics.body('car-body', {x: 0, y: -10})
      this.backWheel = Physics.body('wheel', {x: -10, y: -3.5})
      this.frontWheel = Physics.body('wheel', {x: 10, y: -4})

      this.addChildren([ this.body, this.backWheel, this.frontWheel ])
    },
  }
})

module.exports = Physics
