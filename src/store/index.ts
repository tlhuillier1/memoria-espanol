import { createIdbThemeStore, createMemoryThemeStore } from './idbThemeStore'
import type { ThemeStore } from './ThemeStore'

/** The app-wide store for custom themes. Swap this line to move themes online. */
export const themeStore: ThemeStore =
  typeof indexedDB === 'undefined' ? createMemoryThemeStore() : createIdbThemeStore()
