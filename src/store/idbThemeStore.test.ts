import { describe, expect, it } from 'vitest'
import type { Theme } from '../types'
import { createMemoryThemeStore } from './idbThemeStore'

const theme = (id: string, name = id): Theme => ({
  id,
  grade: '4e',
  name,
  builtIn: false,
  words: [],
})

describe('memory ThemeStore', () => {
  it('keeps creation order and updates a theme in place', async () => {
    const store = createMemoryThemeStore()
    await store.save(theme('a'))
    await store.save(theme('b'))
    await store.save(theme('a', 'La ropa'))
    expect((await store.list()).map((t) => t.name)).toEqual(['La ropa', 'b'])
    expect((await store.get('a'))?.name).toBe('La ropa')
  })

  it('removes a theme', async () => {
    const store = createMemoryThemeStore([theme('a'), theme('b')])
    await store.remove('a')
    expect((await store.list()).map((t) => t.id)).toEqual(['b'])
    expect(await store.get('a')).toBeUndefined()
  })
})
