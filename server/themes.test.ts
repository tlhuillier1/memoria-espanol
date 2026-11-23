import { describe, expect, it } from 'vitest'
import { MAX_WORDS, hideableThemeKind, parseThemeInput, toApiTheme } from './themes.js'

const hash = (c: string) => c.repeat(64)
const word = (w: string, c = 'a') => ({ word: w, image: `api/images/${hash(c)}` })

describe('parseThemeInput', () => {
  it('trims the name and words and extracts the image ids', () => {
    const input = parseThemeInput({ grade: '4e', name: ' La ropa ', words: [word(' la camisa '), word('el gorro', 'b')] })
    expect(input).toEqual({
      grade: '4e',
      name: 'La ropa',
      words: [
        { word: 'la camisa', imageId: hash('a') },
        { word: 'el gorro', imageId: hash('b') },
      ],
    })
  })

  it('accepts image paths resolved against the site base', () => {
    expect(parseThemeInput({ grade: '5e', name: 'x', words: [word('a'), { word: 'b', image: `./api/images/${hash('c')}` }] })).not.toBeNull()
  })

  it.each([
    ['not an object', null],
    ['unknown grade', { grade: '6e', name: 'x', words: [word('a'), word('b')] }],
    ['blank name', { grade: '5e', name: '  ', words: [word('a'), word('b')] }],
    ['too long name', { grade: '5e', name: 'x'.repeat(81), words: [word('a'), word('b')] }],
    ['fewer than 2 words', { grade: '5e', name: 'x', words: [word('a')] }],
    ['too many words', { grade: '5e', name: 'x', words: Array.from({ length: MAX_WORDS + 1 }, () => word('a')) }],
    ['blank word', { grade: '5e', name: 'x', words: [word(' '), word('b')] }],
    ['data URL instead of a stored image', { grade: '5e', name: 'x', words: [word('a'), { word: 'b', image: 'data:image/jpeg;base64,AA' }] }],
    ['image of another site', { grade: '5e', name: 'x', words: [word('a'), { word: 'b', image: 'https://example.com/x.jpg' }] }],
  ])('refuses %s', (_, body) => {
    expect(parseThemeInput(body)).toBeNull()
  })
})

describe('toApiTheme', () => {
  it('turns image ids back into paths', () => {
    const theme = toApiTheme({ id: 'id', grade: '3e', name: 'n', words: [{ word: 'el sol', imageId: hash('f') }] })
    expect(theme.words).toEqual([{ word: 'el sol', image: `api/images/${hash('f')}` }])
  })
})

describe('hideableThemeKind', () => {
  it('recognises a created theme by its UUID', () => {
    expect(hideableThemeKind('3f2a9c1e-8b7d-4e6f-a5c4-1d2e3f4a5b6c')).toBe('created')
  })

  it.each(['frutas', 'animales', 'material-escolar', 'tema2'])('accepts the built-in id %s', (id) => {
    expect(hideableThemeKind(id)).toBe('builtIn')
  })

  it.each([
    ['an empty id', ''],
    ['uppercase letters', 'Frutas'],
    ['an uppercase UUID', '3F2A9C1E-8B7D-4E6F-A5C4-1D2E3F4A5B6C'],
    ['a path', '../themes'],
    ['spaces', 'las frutas'],
    ['a leading dash', '-frutas'],
    ['a double dash', 'las--frutas'],
    ['a too long id', 'a'.repeat(41)],
  ])('refuses %s', (_, id) => {
    expect(hideableThemeKind(id)).toBeNull()
  })
})
