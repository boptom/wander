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

  shortest() {
    this.value = wander.shortestIn(this.value)
    return this
  }

  firstNonEmpty() {
    this.value = wander.firstNonEmpty(this.value)
    return this
  }

  walk(steps, start = 0, inclusive = false) {
    this.value = wander.walk(steps, this.value, start, inclusive)
    return this
  }

  walkWith(steps, start = 0) {
    this.value = wander.walkWith(steps, this.value, start)
    return this
  }

  walkRepeat(steps, start, inclusive = false) {
    this.value = wander.walkRepeat(steps, this.value, start, inclusive)
    return this
  }

  walkWithRepeat(steps, start) {
    this.value = wander.walkWithRepeat(steps, this.value, start)
    return this
  }

  getValue(name) {
    this.value = wander.getValue(name, this.value)
    return this
  }

  removeBetween(startStr, endStr, inclusive = false) {
    this.value = wander.removeBetween(this.value, startStr, endStr, inclusive)
    return this
  }

  getTag(seed, start = 0, inclusive = false) {
    this.value = wander.getTag(seed, this.value, start, inclusive)
    return this
  }

  getTagRepeat(seed, start = 0, inclusive = false) {
    this.value = wander.getTagRepeat(seed, this.value, start, inclusive)
    return this
  }
}
