import { describe, expect, it } from 'vitest'
import type { Theme } from '../types'
import { choiceSummary, pickerSummary, selectedCountLabel, themeCountLabel, themeSubtitle } from './texts'

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

  it('counts the chosen words', () => {
    expect(selectedCountLabel(0, 18)).toBe('0 de 18 elegidas')
    expect(selectedCountLabel(1, 18)).toBe('1 de 18 elegida')
    expect(selectedCountLabel(6, 18)).toBe('6 de 18 elegidas')
  })

  it('summarizes the chosen words', () => {
    expect(choiceSummary(0, 18)).toBe('Elige al menos 2 palabras.')
    expect(choiceSummary(1, 18)).toBe('Elige al menos 2 palabras.')
    expect(choiceSummary(5, 18)).toBe('10 cartas · 5 palabras elegidas')
    expect(choiceSummary(18, 18)).toBe('36 cartas · todas las palabras del tema')
  })
})
