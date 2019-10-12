const wander = require('../wander.js')

describe('wander.run', () => {
  test('on string', () => {
    expect(wander.run('a string', v => v.length)).toBe(8)
  })

  test('on array', () => {
    expect(
      wander.run(['first', 'second', 'third'], v => v.length)
    ).toStrictEqual([5, 6, 5])
  })
})
