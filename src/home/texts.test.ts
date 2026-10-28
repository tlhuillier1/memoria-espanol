import { describe, expect, it } from 'vitest'
import type { Theme } from '../types'
import { pickerSummary, themeCountLabel, themeSubtitle } from './texts'

describe('home texts', () => {
  it('pluralizes the theme count', () => {
    expect(themeCountLabel(0)).toBe('0 temas')
    expect(themeCountLabel(1)).toBe('1 tema')
    expect(themeCountLabel(4)).toBe('4 temas')
  })

  it('shows the French name only when there is one', () => {
    const words = Array.from({ length: 6 }, () => ({ word: 'el sol', image: '' }))
    const builtIn: Theme = { id: 'x', grade: '5e', name: 'Las frutas', nameFr: 'Les fruits', builtIn: true, words }
    expect(themeSubtitle(builtIn)).toBe('Les fruits · 6 palabras')
    expect(themeSubtitle({ ...builtIn, nameFr: undefined, builtIn: false })).toBe('6 palabras')
  })

  it('summarizes the word-count choice', () => {
    expect(pickerSummary(6, 18)).toBe('12 cartas · 6 palabras sorteadas entre las 18 del tema')
    expect(pickerSummary(6, 6)).toBe('12 cartas · todas las palabras del tema')
  })
})
