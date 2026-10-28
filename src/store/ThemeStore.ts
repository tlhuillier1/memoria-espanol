import themesData from '../data/themes.json'
import type { Theme } from '../types'

/**
 * Single access point to custom themes, so the IndexedDB implementation can later be
 * swapped for an online store (e.g. Supabase) without touching the UI.
 */
export interface ThemeStore {
  /** Custom themes, in creation order. */
  list(): Promise<Theme[]>
  get(id: string): Promise<Theme | undefined>
  save(theme: Theme): Promise<void>
  remove(id: string): Promise<void>
}

/** Read-only themes shipped with the site (design/data/themes.json). */
export const builtInThemes: readonly Theme[] = themesData.themes as Theme[]
