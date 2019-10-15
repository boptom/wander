const fs = require('fs')
const wander = require('../wander.js')
const testFile = fs.readFileSync('./tests/test.html', 'utf8')

test('wander.firstNonEmpty', () => {
  expect(wander.firstNonEmpty(['', 0, false, 'first one', 'second one'])).toBe(
    'first one'
  )
})

test('wander.shortestIn', () => {
  expect(
    wander.shortestIn(['longer string', 'short one', 'medium string'])
  ).toBe('short one')
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

  test('Found on walkAll', () => {
    expect(wander.walkAll(['this does', 'not exist'], testFile)).toStrictEqual(
      []
    )

    expect(wander.walkAll(['<th>', '</th>'], testFile)).toStrictEqual([
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

  test('Found on walkWithAll', () => {
    expect(wander.walkWithAll(['<th>', '</th>'], testFile)).toStrictEqual([
      '<th>First</th>',
      '<th>Second</th>',
      '<th>Third</th>',
    ])
  })
})

test('wander.getValue', () => {
  expect(wander.getValue('input-name', testFile)).toBe('12340')
  expect(wander.getValue('input-name-again', testFile)).toBe('5678')
})

describe('wander.removeBetween', () => {
  test('On string', () => {
    expect(wander.removeBetween('abc 123 def 456', 'bc', 'def')).toBe(
      'abcdef 456'
    )
  })
  test('On string inclusive', () => {
    expect(wander.removeBetween('abc 123 def 456', 'bc', 'def', true)).toBe(
      'a 456'
    )
  })

  test('On html', () => {
    expect(
      wander.removeBetween(
        'abc<div class="hello">def</div><div id="">',
        '<div ',
        '>'
      )
    ).toBe('abc<div >def</div><div >')
  })
})

describe('wander.find', () => {
  test('Found with find', () => {
    expect(wander.find('not found anywhere', testFile)).toBe('')
    expect(wander.find('Some class', testFile)).toBe('Some class text')
    expect(wander.find('<img', testFile)).toBe('')
    expect(wander.find('<img', testFile, 0, true)).toBe(
      '<img src="image.jpg" />'
    )

    expect(wander.find('<h1', testFile)).toBe('This is a test file')
    expect(wander.find('some-class', testFile)).toBe('Some class text')
    expect(wander.find('some-class', testFile, 0, true)).toBe(
      '<div class="some-class">Some class text</div>'
    )

    expect(wander.find('some-class', testFile, 1260)).toBe('Some class again')
    expect(wander.find('some-class', testFile, 1260, true)).toBe(
      '<div class="some-class">Some class again</div>'
    )

    expect(wander.find('id="description"', testFile)).toBe(
      'This is a bit of text'
    )

    expect(wander.find('extra-div', testFile)).toBe(
      '<div><p>inner stuff</p></div>'
    )

    expect(wander.find('extra-div', testFile, 0, true)).toBe(
      '<div class="extra-div"><div><p>inner stuff</p></div></div>'
    )

    expect(wander.find('This file is use', testFile, 0, true)).toBe(
      'This file is use to run tests on Crawler'
    )
  })

  test('Found with findAll', () => {
    expect(wander.findAll('some-class', testFile)).toStrictEqual([
      'Some class text',
      'Some class again',
    ])
  })

  expect(wander.findAll('<li', '<li>123</li><li>456</li>')).toStrictEqual([
    '123',
    '456',
  ])
})

test('Can remove price symbols', () => {
  expect(wander.removePriceSymbols('  1$2£3€4¥5,00,00. 88  ')).toBe(
    '12345000088'
  )

  expect(
    wander.removePriceSymbols(['  1$2£3€4¥5,00,00. 88  ', '$1.24', 'abc'])
  ).toStrictEqual(['12345000088', '124', 'abc'])
})

describe('wander.replace', () => {
  test('Can replace string', () => {
    expect(wander.replace('12345', '234', 'abc')).toBe('1abc5')
  })

  test('Can replace string within array', () => {
    expect(wander.replace(['12345', '222', '333'], '2', 'a')).toStrictEqual([
      '1a345',
      'a22',
      '333',
    ])
  })

  test('Can replace using regex', () => {
    expect(wander.replace('12345', /234/, 'abc')).toBe('1abc5')
  })

  test('Can replace within array using regex', () => {
    expect(wander.replace(['12345', '222', '333'], /2/g, 'a')).toStrictEqual([
      '1a345',
      'aaa',
      '333',
    ])
  })
})

describe('wander.split', () => {
  test('Can split string', () => {
    expect(wander.split('123*456*789', '*')).toStrictEqual([
      '123',
      '456',
      '789',
    ])
  })

  test('Can split within array', () => {
    expect(wander.split(['1*2*3', 'a*b*c'], '*')).toStrictEqual([
      ['1', '2', '3'],
      ['a', 'b', 'c'],
    ])
  })
})

describe('wander.removeNonNumericChars', () => {
  test('On string', () => {
    expect(wander.removeNonNumericChars('abc120.ju78')).toBe('12078')
  })

  test('On array', () => {
    expect(
      wander.removeNonNumericChars(['abc120.ju78', '-123abc'])
    ).toStrictEqual(['12078', '123'])
  })
})

test('wander.removeEmpty', () => {
  expect(wander.removeEmpty(['', 0, null, 1, 'abc'])).toStrictEqual([1, 'abc'])
})

test('wander.unique', () => {
  expect(
    wander.unique([1, 2, 2, 2, 'a', 'a', [1, 2, 3], [1, 2, 3]])
  ).toStrictEqual([1, 2, 'a', [1, 2, 3]])
})

describe('wander.removeComments', () => {
  test('On string', () => {
    expect(wander.removeComments('abc <!-- comment -->def')).toBe('abc def')
  })

  test('On array', () => {
    expect(
      wander.removeComments([
        'abc <!-- comment -->def',
        '123 <!-- comment -->456',
      ])
    ).toStrictEqual(['abc def', '123 456'])
  })
})

describe('wander.nullIfContains', () => {
  test('On string', () => {
    expect(wander.nullIfContains('a', 'cat')).toBe(null)
  })

  test('On array', () => {
    expect(wander.nullIfContains('a', ['cat', 'dog'])).toStrictEqual([
      null,
      'dog',
    ])
  })
})
