const fs = require('fs')
const wanderer = require('../wanderer.js')
const testFile = fs.readFileSync('./tests/test.html', 'utf8')

test('wanderer.firstNonEmpty', () => {
  expect(
    new wanderer(['', 0, false, 'first one', 'second one']).firstNonEmpty()
      .value
  ).toBe('first one')
})

test('wander.shortest', () => {
  expect(
    new wanderer(['longer string', 'short one', 'medium string']).shortest()
      .value
  ).toBe('short one')
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

  test('Found on walkAll', () => {
    expect(
      new wanderer(testFile).walkAll(['this does', 'not exist']).value
    ).toStrictEqual([])

    expect(
      new wanderer(testFile).walkAll(['<th>', '</th>']).value
    ).toStrictEqual(['First', 'Second', 'Third'])
  })

  test('Found on walkWith', () => {
    expect(new wanderer(testFile).walkWith(['>']).value).toBe('<html>')
    expect(new wanderer(testFile).walkWith(['<title>', '</title>']).value).toBe(
      '<title>Test File</title>'
    )
  })

  test('Found on walkWithAll', () => {
    expect(
      new wanderer(testFile).walkWithAll(['<th>', '</th>']).value
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

describe('wanderer.find', () => {
  test('Found with find', () => {
    expect(new wanderer(testFile).find('not found anywhere').value).toBe('')
    expect(new wanderer(testFile).find('Some class').value).toBe(
      'Some class text'
    )
    expect(new wanderer(testFile).find('<img').value).toBe('')
    expect(new wanderer(testFile).find('<img', 0, true).value).toBe(
      '<img src="image.jpg" />'
    )

    expect(new wanderer(testFile).find('<h1').value).toBe('This is a test file')
    expect(new wanderer(testFile).find('some-class').value).toBe(
      'Some class text'
    )
    expect(new wanderer(testFile).find('some-class', 0, true).value).toBe(
      '<div class="some-class">Some class text</div>'
    )

    expect(new wanderer(testFile).find('some-class', 1260).value).toBe(
      'Some class again'
    )
    expect(new wanderer(testFile).find('some-class', 1260, true).value).toBe(
      '<div class="some-class">Some class again</div>'
    )

    expect(new wanderer(testFile).find('id="description"').value).toBe(
      'This is a bit of text'
    )

    expect(new wanderer(testFile).find('extra-div').value).toBe(
      '<div><p>inner stuff</p></div>'
    )

    expect(new wanderer(testFile).find('extra-div', 0, true).value).toBe(
      '<div class="extra-div"><div><p>inner stuff</p></div></div>'
    )

    expect(new wanderer(testFile).find('This file is use', 0, true).value).toBe(
      'This file is use to run tests on Crawler'
    )
  })
})

describe('wanderer.findAll', () => {
  test('Found with findAll', () => {
    expect(new wanderer(testFile).findAll('some-class').value).toStrictEqual([
      'Some class text',
      'Some class again',
    ])
  })

  test('Found in html', () => {
    expect(
      new wanderer('<li>123</li><li>456</li>').findAll('<li').value
    ).toStrictEqual(['123', '456'])
  })
})

test('Can remove price symbols', () => {
  expect(
    new wanderer('  1$2£3€4¥5,00,00. 88  ').removePriceSymbols().value
  ).toBe('12345000088')

  expect(
    new wanderer([
      '  1$2£3€4¥5,00,00. 88  ',
      '$1.24',
      'abc',
    ]).removePriceSymbols().value
  ).toStrictEqual(['12345000088', '124', 'abc'])
})

describe('wanderer.replace', () => {
  test('Can replace string', () => {
    expect(new wanderer('12345').replace('234', 'abc').value).toBe('1abc5')
  })

  test('Can replace string within array', () => {
    expect(
      new wanderer(['12345', '222', '333']).replace('2', 'a').value
    ).toStrictEqual(['1a345', 'a22', '333'])
  })

  test('Can replace using regex', () => {
    expect(new wanderer('12345').replace(/234/, 'abc').value).toBe('1abc5')
  })

  test('Can replace within array using regex', () => {
    expect(
      new wanderer(['12345', '222', '333']).replace(/2/g, 'a').value
    ).toStrictEqual(['1a345', 'aaa', '333'])
  })
})

describe('wanderer.replace', () => {
  test('Can replace string', () => {
    expect(new wanderer('12345').replace('234', 'abc').value).toBe('1abc5')
  })

  test('Can replace string within array', () => {
    expect(
      new wanderer(['12345', '222', '333']).replace('2', 'a').value
    ).toStrictEqual(['1a345', 'a22', '333'])
  })

  test('Can replace using regex', () => {
    expect(new wanderer('12345').replace(/234/, 'abc').value).toBe('1abc5')
  })

  test('Can replace within array using regex', () => {
    expect(
      new wanderer(['12345', '222', '333']).replace(/2/g, 'a').value
    ).toStrictEqual(['1a345', 'aaa', '333'])
  })
})

describe('wanderer.split', () => {
  test('Can split string', () => {
    expect(new wanderer('123*456*789').split('*').value).toStrictEqual([
      '123',
      '456',
      '789',
    ])
  })

  test('Can split within array', () => {
    expect(new wanderer(['1*2*3', 'a*b*c']).split('*').value).toStrictEqual([
      ['1', '2', '3'],
      ['a', 'b', 'c'],
    ])
  })
})

describe('wanderer.removeNonNumericChars', () => {
  test('On string', () => {
    expect(new wanderer('abc120.ju78').removeNonNumericChars().value).toBe(
      '12078'
    )
  })

  test('On array', () => {
    expect(
      new wanderer(['abc120.ju78', '-123abc']).removeNonNumericChars().value
    ).toStrictEqual(['12078', '123'])
  })
})

test('wanderer.removeEmpty', () => {
  expect(
    new wanderer(['', 0, null, 1, 'abc']).removeEmpty().value
  ).toStrictEqual([1, 'abc'])
})

test('wanderer.unique', () => {
  expect(
    new wanderer([1, 2, 2, 2, 'a', 'a', [1, 2, 3], [1, 2, 3]]).unique().value
  ).toStrictEqual([1, 2, 'a', [1, 2, 3]])
})

test('wanderer.filter', () => {
  expect(new wanderer([1, 2, 3, 4, 5]).filter(n => n > 3).value).toStrictEqual([
    4,
    5,
  ])
})

describe('wanderer.removeComments', () => {
  test('On string', () => {
    expect(new wanderer('abc <!-- comment -->def').removeComments().value).toBe(
      'abc def'
    )
  })

  test('On array', () => {
    expect(
      new wanderer([
        'abc <!-- comment -->def',
        '123 <!-- comment -->456',
      ]).removeComments().value
    ).toStrictEqual(['abc def', '123 456'])
  })
})
