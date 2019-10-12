/**
 * Runs a function on a string, or recursively over an array.
 *
 * @param {string|array} value
 * @param {func} function
 *
 * @return {string|array}
 */
exports.run = (value, func) => {
  if (value instanceof Array) {
    return value.map(v => exports.run(v, func))
  }

  return func(value)
}
