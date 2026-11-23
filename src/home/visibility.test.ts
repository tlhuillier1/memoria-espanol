import { describe, expect, it } from 'vitest'
import type { Theme } from '../types'
import { visibleThemes } from './visibility'

const theme = (id: string, builtIn = false): Theme => ({ id, grade: '5e', name: id, builtIn, words: [] })
const themes = [theme('frutas', true), theme('animales', true), theme('3f2a9c1e-8b7d-4e6f-a5c4-1d2e3f4a5b6c')]

describe('visibleThemes', () => {
  it('leaves the hidden themes out for the students, built-in or created', () => {
    const hidden = new Set(['frutas', '3f2a9c1e-8b7d-4e6f-a5c4-1d2e3f4a5b6c'])
    expect(visibleThemes(themes, hidden, false).map((t) => t.id)).toEqual(['animales'])
  })

  it('shows every theme to the teacher, in the same order', () => {
    expect(visibleThemes(themes, new Set(['frutas']), true)).toEqual(themes)
  })

  it('shows everything when nothing is hidden', () => {
    expect(visibleThemes(themes, new Set(), false)).toEqual(themes)
  })

  it('ignores hidden ids of deleted themes', () => {
    expect(visibleThemes(themes, new Set(['gone']), false)).toEqual(themes)
  })
})
