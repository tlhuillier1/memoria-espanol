import themesData from '../data/themes.json'
import type { Theme } from '../types'

/**
 * Single access point to custom themes, so the IndexedDB implementation can later be
 * swapped for an online store (e.g. Supabase) without touching the UI.
 */
export interface ThemeStore {
  /** Custom themes and modified built-in themes (same id as the original), in save order. */
  list(): Promise<Theme[]>
  get(id: string): Promise<Theme | undefined>
  save(theme: Theme): Promise<void>
  remove(id: string): Promise<void>
}

/** Themes shipped with the site (design/data/themes.json); a modified copy is kept in the store. */
export const builtInThemes: readonly Theme[] = themesData.themes as Theme[]

/**
 * Themes shown in the app: built-in themes (replaced by their modified copy, if any), then custom themes.
 * Removing the modified copy from the store restores the original.
 */
export function mergeThemes(builtIns: readonly Theme[], stored: readonly Theme[]): Theme[] {
  const modified = new Map(stored.filter((t) => t.builtIn).map((t) => [t.id, t]))
  return [...builtIns.map((t) => modified.get(t.id) ?? t), ...stored.filter((t) => !t.builtIn)]
}
