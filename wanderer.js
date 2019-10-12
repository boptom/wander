const wander = require('./wander.js')

/**
 * Chainable class methods encompassing the functions from wander.js
 */
module.exports = class Wanderer {
  constructor(value) {
    this.value = value
  }

  run(func) {
    this.value = wander.run(this.value, func)
    return this
  }
}
