import themesData from '../data/themes.json'
import type { Theme } from '../types'

/**
 * Single access point to the themes created by the teacher, so the storage (today the
 * Neon database behind api/) can change without touching the UI.
 */
export interface ThemeStore {
  /** Created themes, in creation order. */
  list(): Promise<Theme[]>
  get(id: string): Promise<Theme | undefined>
  /** Creates or replaces a theme; returns it as stored (photos then have their final URL). */
  save(theme: Theme): Promise<Theme>
  remove(id: string): Promise<void>
}

/** Read-only themes shipped with the site (design/data/themes.json). */
export const builtInThemes: readonly Theme[] = themesData.themes as Theme[]
