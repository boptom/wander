const wanderer = require('../wanderer.js')

describe('wanderer.run', () => {
  test('on string', () => {
    expect(new wanderer('a string').run(v => v.length).value).toBe(8)
  })

  test('on array', () => {
    expect(
      new wanderer(['first', 'second', 'third']).run(v => v.length).value
    ).toStrictEqual([5, 6, 5])
  })
})
