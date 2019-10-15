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

  walkAll(steps, start, inclusive = false) {
    this.value = wander.walkAll(steps, this.value, start, inclusive)
    return this
  }

  walkWithAll(steps, start) {
    this.value = wander.walkWithAll(steps, this.value, start)
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

  find(seed, start = 0, inclusive = false) {
    this.value = wander.find(seed, this.value, start, inclusive)
    return this
  }

  findAll(seed, start = 0, inclusive = false) {
    this.value = wander.findAll(seed, this.value, start, inclusive)
    return this
  }

  removePriceSymbols() {
    this.value = wander.removePriceSymbols(this.value)
    return this
  }

  replace(substr, newSubstr) {
    this.value = wander.replace(this.value, substr, newSubstr)
    return this
  }

  split(separator) {
    this.value = wander.split(this.value, separator)
    return this
  }

  removeNonNumericChars() {
    this.value = wander.removeNonNumericChars(this.value)
    return this
  }

  removeEmpty() {
    this.value = wander.removeEmpty(this.value)
    return this
  }

  unique() {
    this.value = wander.unique(this.value)
    return this
  }

  filter(func) {
    this.value = this.value.filter(func)
    return this
  }

  removeComments() {
    this.value = wander.removeComments(this.value)
    return this
  }

  cleanHtml() {
    this.removeComments()
      .removeBetween('<h1', '>')
      .removeBetween('<h2', '>')
      .removeBetween('<h3', '>')
      .removeBetween('<h4', '>')
      .removeBetween('<h5', '>')
      .removeBetween('<table', '>')
      .removeBetween('<th', '>')
      .removeBetween('<td', '>')
      .removeBetween('<ol', '>')
      .removeBetween('<li', '>')
      .removeBetween('<div', '>')
      .removeBetween('<span', '>')
      .removeBetween('<a', '>')
      .removeBetween('<i', '>')
      .removeBetween('<p', '>')
      .removeBetween('class="', '"', true)
      .removeBetween('id="', '"', true)
      .removeBetween('<hr', '>', true)
      .removeBetween('<style', '/style>', true)
      .removeBetween('<script', '/script>', true)
      .replace(/\r?\n|\r/g, '')

    return this
  }

  nullIfContains(search) {
    this.value = wander.nullIfContains(search, this.value)
    return this
  }

  nullIfMissing(search) {
    this.value = wander.nullIfMissing(search, this.value)
    return this
  }
}
