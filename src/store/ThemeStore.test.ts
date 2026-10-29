import { describe, expect, it } from 'vitest'
import type { Theme } from '../types'
import { mergeThemes } from './ThemeStore'

const theme = (id: string, builtIn: boolean, name = id): Theme => ({ id, grade: '5e', name, builtIn, words: [] })

describe('mergeThemes', () => {
  const builtIns = [theme('frutas', true), theme('animales', true)]

  it('lists built-in themes first, then custom themes', () => {
    const stored = [theme('mine', false), theme('other', false)]
    expect(mergeThemes(builtIns, stored).map((t) => t.id)).toEqual(['frutas', 'animales', 'mine', 'other'])
  })

  it('replaces a built-in theme by its modified copy, in place', () => {
    const stored = [theme('mine', false), theme('animales', true, 'Mis animales')]
    expect(mergeThemes(builtIns, stored).map((t) => t.name)).toEqual(['frutas', 'Mis animales', 'mine'])
  })

  it('ignores a modified copy whose built-in theme no longer exists', () => {
    expect(mergeThemes(builtIns, [theme('gone', true)]).map((t) => t.id)).toEqual(['frutas', 'animales'])
  })
})
