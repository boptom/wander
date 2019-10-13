const fs = require('fs')
const wander = require('../wander.js')
const testFile = fs.readFileSync('./tests/test.html', 'utf8')

test('wander.firstNonEmpty', () => {
  expect(wander.firstNonEmpty(['', 0, false, 'first one', 'second one'])).toBe(
    'first one'
  )
})

describe('wander.run', () => {
  test('On string', () => {
    expect(wander.run('a string', v => v.length)).toBe(8)
  })

  test('On array', () => {
    expect(
      wander.run(['first', 'second', 'third'], v => v.length)
    ).toStrictEqual([5, 6, 5])
  })
})

describe('wander.walk', () => {
  test('Not found on walk', () => {
    expect(wander.walk(['this is', 'not found'], testFile)).toBe('')
  })

  test('Found on walk', () => {
    expect(wander.walk(['>'], testFile)).toBe('<html')
    expect(wander.walk(['<title>', '</title>'], testFile)).toBe('Test File')
    expect(wander.walk(['<html>', '<title>', '</title>'], testFile)).toBe(
      'Test File'
    )

    expect(wander.walk(['<html>', '<title>', '</title>'], testFile, 100)).toBe(
      ''
    )

    expect(wander.walk(['<table', '<td>', '</td>'], testFile)).toBe(
      'Row1, Data1'
    )

    expect(wander.walk(['<td>', '</td>'], testFile, 600)).toBe('Row2, Data1')

    expect(
      wander.walk(['<html>', '<title>', '</title>'], testFile, 'non numeric')
    ).toBe('Test File')
  })

  test('Found on walkRepeat', () => {
    expect(
      wander.walkRepeat(['this does', 'not exist'], testFile)
    ).toStrictEqual([])

    expect(wander.walkRepeat(['<th>', '</th>'], testFile)).toStrictEqual([
      'First',
      'Second',
      'Third',
    ])
  })

  test('Found on walkWith', () => {
    expect(wander.walkWith(['>'], testFile)).toBe('<html>')
    expect(wander.walkWith(['<title>', '</title>'], testFile)).toBe(
      '<title>Test File</title>'
    )
  })

  test('Found on walkWithRepeat', () => {
    expect(wander.walkWithRepeat(['<th>', '</th>'], testFile)).toStrictEqual([
      '<th>First</th>',
      '<th>Second</th>',
      '<th>Third</th>',
    ])
  })
})
