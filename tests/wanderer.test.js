const fs = require('fs')
const wanderer = require('../wanderer.js')
const testFile = fs.readFileSync('./tests/test.html', 'utf8')

test('wanderer.firstNonEmpty', () => {
  expect(
    new wanderer(['', 0, false, 'first one', 'second one']).firstNonEmpty()
      .value
  ).toBe('first one')
})

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

describe('wanderer.walk', () => {
  test('Not found on walk', () => {
    expect(new wanderer(testFile).walk(['this is', 'not found']).value).toBe('')
  })

  test('Found on walk', () => {
    expect(new wanderer(testFile).walk(['>']).value).toBe('<html')
    expect(new wanderer(testFile).walk(['<title>', '</title>']).value).toBe(
      'Test File'
    )
    expect(
      new wanderer(testFile).walk(['<html>', '<title>', '</title>']).value
    ).toBe('Test File')

    expect(
      new wanderer(testFile).walk(['<html>', '<title>', '</title>'], 100).value
    ).toBe('')

    expect(new wanderer(testFile).walk(['<table', '<td>', '</td>']).value).toBe(
      'Row1, Data1'
    )

    expect(new wanderer(testFile).walk(['<td>', '</td>'], 600).value).toBe(
      'Row2, Data1'
    )

    expect(
      new wanderer(testFile).walk(
        ['<html>', '<title>', '</title>'],
        'non numeric'
      ).value
    ).toBe('Test File')
  })

  test('Found on walkRepeat', () => {
    expect(
      new wanderer(testFile).walkRepeat(['this does', 'not exist']).value
    ).toStrictEqual([])

    expect(
      new wanderer(testFile).walkRepeat(['<th>', '</th>']).value
    ).toStrictEqual(['First', 'Second', 'Third'])
  })

  test('Found on walkWith', () => {
    expect(new wanderer(testFile).walkWith(['>']).value).toBe('<html>')
    expect(new wanderer(testFile).walkWith(['<title>', '</title>']).value).toBe(
      '<title>Test File</title>'
    )
  })

  test('Found on walkWithRepeat', () => {
    expect(
      new wanderer(testFile).walkWithRepeat(['<th>', '</th>']).value
    ).toStrictEqual(['<th>First</th>', '<th>Second</th>', '<th>Third</th>'])
  })
})

test('wanderer.getValue', () => {
  expect(new wanderer(testFile).getValue('input-name').value).toBe('12340')
  expect(new wanderer(testFile).getValue('input-name-again').value).toBe('5678')
})

describe('wanderer.removeBetween', () => {
  test('On string', () => {
    expect(
      new wanderer('abc 123 def 456').removeBetween('bc', 'def').value
    ).toBe('abcdef 456')
  })

  test('On string inclusive', () => {
    expect(
      new wanderer('abc 123 def 456').removeBetween('bc', 'def', true).value
    ).toBe('a 456')
  })

  test('On html', () => {
    expect(
      new wanderer('abc<div class="hello">def</div><div id="">').removeBetween(
        '<div ',
        '>'
      ).value
    ).toBe('abc<div >def</div><div >')
  })
})
