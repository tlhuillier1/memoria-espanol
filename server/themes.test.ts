import { describe, expect, it } from 'vitest'
import { MAX_WORDS, parseThemeInput, toApiTheme } from './themes.js'

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
