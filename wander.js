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
 * Returns the shortest string in an array of strings
 *
 * @param {arr} Array of values
 * @return {mixed}
 */
exports.shortestIn = arr => {
  return arr.reduce((a, b) => (a.length < b.length ? a : b))
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
exports.walkAll = (steps, html, start = 0, inclusive = false) => {
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
 * Alias for walkWith function, with inclusive = true
 *
 * @param {array} steps An array of strings to search for
 * @param {string} html String to search within
 * @param {integer} start Starting position
 *
 * @return {array}
 */
exports.walkWithAll = (steps, html, start = 0) => {
  return exports.walkAll(steps, html, start, true)
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

/**
 * Finds the string between a <div></div> or other <*></*> tag
 * e.g. <div $seed> ...</div>
 *
 * @param {string|array} seed The string to find within html. Will return the string between tags that contains this string.
 * @param {string} html The haystack to search in
 * @param {integer} start The starting position (default 0)
 * @param {boolean} inclusive True returns surrounding tags
 *
 * @return {string|array} The string (or array of strings) within the <*></*> tags
 */
exports.find = (seed, html, start = 0, inclusive = false) => {
  return exports.run(html, h => {
    return exports.findDetails(seed, h, start, inclusive).match
  })
}

/**
 * Finds the string between a <div></div> or other <*></*> tag
 * i.e. <div $seed> ...</div>
 * Also returns the position of the last match
 *
 * @param {string} seed The string to find within html. Will return the string between tags that contains this string.
 * @param {string} html The haystack to search in
 * @param {integer} start The starting position (default 0)
 * @param {boolean} inclusive True returns surrounding tags
 *
 * @return {object}
 *       - {string} 'match' The string within the <*></*> tags
 *       - {integer} 'end' The position of the end of the closing tag </*>
 */
exports.findDetails = (seed, html, start = 0, inclusive = false) => {
  let pos = html.indexOf(seed, start)

  if (pos === -1) {
    return {
      match: '',
      lastPos: -1,
    }
  }

  const firstOpenPos = html.lastIndexOf('<', pos)
  const firstClosePos = html.lastIndexOf('>', pos)

  // seed is between tags i.e. <*>seed</*>
  if (firstClosePos >= firstOpenPos) {
    let nextOpenPos = html.indexOf('<', firstClosePos + 1)

    return {
      match: html.substring(firstClosePos + 1, nextOpenPos),
      lastPos: nextOpenPos + 1,
    }
  }

  const tag = getTagType(html.substring(firstOpenPos))

  if (tag.singular) {
    const nextClosePos = html.indexOf('>', pos)

    return {
      match: inclusive ? html.substring(pos, nextClosePos + 1) : '',
      lastPos: nextClosePos + 1,
    }
  }

  let end = pos + tag.open.length

  let nextClosePos = html.indexOf(tag.close, end)
  let nextOpenPos = html.indexOf(tag.open, end)
  let endOfString = false
  let count = 1
  let a = []

  do {
    nextOpenPos = html.indexOf(tag.open, end)
    nextClosePos = html.indexOf(tag.close, end)

    if (nextOpenPos === -1) {
      nextOpenPos = html.length
    }

    if (nextClosePos === -1) {
      nextClosePos = html.length
    }

    if (nextOpenPos > nextClosePos) {
      count--
      end = nextClosePos + tag.close.length
    }

    if (nextOpenPos < nextClosePos) {
      count++
      end = nextOpenPos + tag.open.length
    }

    if (nextOpenPos === nextClosePos) {
      count = 0
      end = nextOpenPos
      endOfString = true
    }
  } while (count > 0 && count < 50)

  if (!inclusive) {
    pos = html.indexOf('>', pos) + 1
    if (!endOfString) {
      end = html.lastIndexOf('<', end) - 1
    }
  } else {
    pos = html.lastIndexOf('<', pos)
    end = html.indexOf('>', end) + 1
  }

  return {
    match: html.substring(pos, end + 1).trim(),
    lastPos: end + tag.close.length,
  }
}

/**
 * Returns start of html tag. e.g. <input
 *
 * @param {string} html
 * @return {object}
 *    - {string} 'tagOpen' e.g. <div
 *    - {string} 'tagClose' e.g. </div
 *    - {boolean} 'singular' True if tag does not require close. e.g. <img />
 **/
const getTagType = html => {
  const tagOpen = exports.shortestIn(
    [exports.walk([' '], html), exports.walk(['>'], html)].filter(n => n)
  )

  const tagClose = '</' + tagOpen.replace('<', '')

  return {
    open: tagOpen,
    close: tagClose,
    singular: isSingular(tagOpen),
  }
}

/**
 * True if tag does not require a closing tag. e.g. <br />
 *
 * @param {string} tag
 * @return {boolean}
 */
const isSingular = tag => {
  return ['img', 'br', 'hr', 'input', 'link', '!--', 'meta', 'link'].includes(
    tag.replace('<', '')
  )
}

/**
 * Finds all the string between a <div></div> or other <*></*> tag
 * i.e. <div $seed> ...</div>
 *
 * @param {string} seed The string to find within html. Will return the string between tags that contains this string.
 * @param {string} html The haystack to search in
 * @param {integer} start The starting position (default 0)
 * @param {boolean} inclusive True returns surrounding tags
 *
 * @return {array}
 */
exports.findAll = (seed, html, start = 0, inclusive = false) => {
  return exports.run(html, h => {
    let matches = []
    let pos = start

    do {
      const w = exports.findDetails(seed, h, pos, inclusive)
      pos = w.lastPos

      if (pos !== -1) {
        matches.push(w.match)
      }
    } while (pos !== -1)

    return matches
  })
}

/**
 * Removes symbols found in prices.
 *
 * @param {string|array} text
 * @return {string|array}
 */
exports.removePriceSymbols = text => {
  return exports.run(text, t => t.replace(/[\$\£\€\¥\,\.\s]/g, ''))
}

/**
 * Runs replace (recursively if array)
 *
 * @param {string|array} text
 * @param {string|regex} substr String or regex to find
 * @param {string|array} newSubstr String replace with
 *
 * @return {string|array}
 */
exports.replace = (text, substr, newSubstr) => {
  return exports.run(text, t => t.replace(substr, newSubstr))
}

/**
 * Runs split (recursively if array)
 *
 * @param {string|array} text
 * @param {string} separator
 * @param {string|array}
 *
 * @return {string|array}
 */
exports.split = (text, separator) => {
  return exports.run(text, t => t.split(separator))
}

/**
 * Removes non-numeric characters from string or within array (recursively if array)
 *
 * @param {string|array} text
 * @return {string|array}
 */
exports.removeNonNumericChars = text => {
  return exports.run(text, t => t.replace(/\D/g, ''))
}

/**
 * Removes empty values from an array.
 *
 * @param {array} arr
 * @return {array}
 */
exports.removeEmpty = arr => {
  return arr.filter(n => n)
}

/**
 * Removes dupkicate values from an array.
 *
 * @param {array} arr
 * @return {array}
 */
exports.unique = arr => {
  return Array.from(new Set(arr.map(JSON.stringify)), JSON.parse)
}

/**
 * Remove HTML comments from string or array of strings
 *
 * @param {string|array} html
 * @return {string|array}
 */
exports.removeComments = html => {
  return exports.run(html, t => t.replace(/<!--.*-->/g, ''))
}
