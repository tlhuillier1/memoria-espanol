import { createStore, get, update } from 'idb-keyval'
import type { Theme } from '../types'
import type { ThemeStore } from './ThemeStore'

const KEY = 'custom-themes'

/** Upserts a theme, keeping creation order (a modified theme stays in place). */
function upsert(themes: Theme[], theme: Theme): Theme[] {
  const index = themes.findIndex((t) => t.id === theme.id)
  if (index === -1) return [...themes, theme]
  const next = themes.slice()
  next[index] = theme
  return next
}

/**
 * Custom themes in IndexedDB (photos quickly exceed the ~5 MB of localStorage).
 * All themes live under one key; `update` runs in a single transaction, so concurrent writes don't clobber.
 */
export function createIdbThemeStore(): ThemeStore {
  const db = createStore('memoria', 'themes')
  const read = async () => (await get<Theme[]>(KEY, db)) ?? []
  return {
    list: read,
    get: async (id) => (await read()).find((t) => t.id === id),
    save: (theme) => update<Theme[]>(KEY, (themes = []) => upsert(themes, theme), db),
    remove: (id) => update<Theme[]>(KEY, (themes = []) => themes.filter((t) => t.id !== id), db),
  }
}

/** Non-persistent store (tests, or browsers without IndexedDB). */
export function createMemoryThemeStore(initial: Theme[] = []): ThemeStore {
  let themes = initial.slice()
  return {
    list: async () => themes.slice(),
    get: async (id) => themes.find((t) => t.id === id),
    save: async (theme) => {
      themes = upsert(themes, theme)
    },
    remove: async (id) => {
      themes = themes.filter((t) => t.id !== id)
    },
  }
}
