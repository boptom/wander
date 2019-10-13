/**
 * Returns the first non-empty item
 *
 * @param {arr} Array of values
 * @return {mixed}
 */
exports.firstNonEmpty = arr => {
  const filtered = arr.filter(n => n)
  return filtered.length === 0 ? '' : filtered[0]
}

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

/**
 * Finds each string within steps and returns the
 * string between the last and 2nd last step.
 *
 * @param {array} steps An array of strings to search for
 * @param {string} html String to search within
 * @param {integer} start Starting position
 * @param {boolean} inclusive Include the last and 2nd last step in match
 *
 * @return {object} With keys 'match', 'lastPos'.
 *
 * match is '', lastPos is -1 if steps not found.
 */
exports.walkDetails = (steps, html, start = 0, inclusive = false) => {
  if (steps.length === 0) {
    return {
      match: '',
      lastPos: -1,
    }
  }

  if (steps.length === 1) {
    const lastPos = html.indexOf(steps[0])
    if (lastPos === -1) {
      return {
        match: '',
        lastPos: -1,
      }
    }

    return inclusive
      ? {
          match: html.substring(0, lastPos) + steps[0],
          lastPos: lastPos + steps[0].length + steps[0].length,
        }
      : {
          match: html.substring(0, lastPos),
          lastPos: lastPos + steps[0].length,
        }
  }

  let pos = start

  const positions = steps.map(step => {
    pos = html.indexOf(step, pos)

    if (pos === -1) {
      return -1
    }

    return (pos = pos + step.length)
  })

  if (positions.includes(-1)) {
    return {
      match: '',
      lastPos: -1,
    }
  }

  const to = positions[positions.length - 1] - steps[steps.length - 1].length
  const from = positions[positions.length - 2]

  return inclusive
    ? {
        match:
          steps[steps.length - 2] +
          html.substring(from, to) +
          steps[steps.length - 1],
        lastPos: positions[positions.length - 1],
      }
    : {
        match: html.substring(from, to),
        lastPos: positions[positions.length - 1],
      }
}

/**
 * Finds each string within steps and returns the
 * string between the last and 2nd last step.
 *
 * @param {array} steps An array of strings to search for
 * @param {string} html String to search within
 * @param {integer} start Starting position
 * @param {boolean} inclusive Include last and 2nd last steps in match
 *
 * @return {string}
 */
exports.walk = (steps, html, start = 0, inclusive = false) => {
  return exports.run(html, h => {
    return exports.walkDetails(steps, h, start, inclusive).match
  })
}

/**
 * Finds each string within steps and returns the
 * string between the last and 2nd last step.
 * Repeats until end on html string.
 *
 * @param {array} steps An array of strings to search for
 * @param {string} html String to search within
 * @param {integer} start Starting position
 * @param {boolean} inclusive Include last and 2nd last steps in match
 *
 * @return {array}
 */
exports.walkRepeat = (steps, html, start = 0, inclusive = false) => {
  return exports.run(html, h => {
    let matches = []
    let pos = start

    do {
      const w = exports.walkDetails(steps, h, pos, inclusive)
      pos = w.lastPos

      if (pos !== -1) {
        matches.push(w.match)
      }
    } while (pos !== -1)

    return matches
  })
}

/**
 * Alias for walk function, with inclusive = true
 *
 * @param {array} steps An array of strings to search for
 * @param {string} html String to search within
 * @param {integer} start Starting position
 *
 * @return {array}
 */
exports.walkWith = (steps, html, start = 0) => {
  return exports.walk(steps, html, start, true)
}

/**
 * Alias for walkRepeat function, with inclusive = true
 *
 * @param {array} steps An array of strings to search for
 * @param {string} html String to search within
 * @param {integer} start Starting position
 *
 * @return {array}
 */
exports.walkWithRepeat = (steps, html, start = 0) => {
  return exports.walkRepeat(steps, html, start, true)
}

/**
 * Returns the value attribute, given the name attribute.
 *
 * @param {string} name The html name attribute
 * @param {string} html String to search within
 *
 * @return {string}
 */
exports.getValue = (name, html) => {
  return exports.firstNonEmpty([
    exports.walk(['name="' + name + '"', 'value="', '"'], html),
    exports.walk(["name='" + name + "'", "value='", "'"], html),
  ])
}

/**
 * Removes between 2 strings, returning the result.
 *
 * @param {string} text
 * @param {string} startStr
 * @param {string} endStr
 * @param {boolean} inclusive True to also remove startStr and endStr
 *
 * @return {string}
 */
exports.removeBetween = (text, startStr, endStr, inclusive = false) => {
  return exports.run(text, t => {
    let startPos = 0
    let start = 0
    let end = 0

    do {
      start = t.indexOf(startStr, startPos)
      end = t.indexOf(endStr, start)

      if (start !== -1 && end !== -1) {
        t = inclusive
          ? t.substring(0, start) + t.substring(end + endStr.length)
          : t.substring(0, start + startStr.length) + t.substring(end)

        startPos = inclusive ? start : start + startStr.length + endStr.length
      }
    } while (start !== -1 && end !== -1)

    return t
  })
}
