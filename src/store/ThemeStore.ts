import themesData from '../data/themes.json'
import type { Theme } from '../types'

/**
 * Single access point to the themes created by the teacher, so the storage (today the
 * Neon database behind api/) can change without touching the UI.
 */
export interface ThemeStore {
  /** Created themes, in creation order, and the ids of the themes the teacher hid from the students. */
  list(): Promise<ThemeList>
  get(id: string): Promise<Theme | undefined>
  /** Creates or replaces a theme; returns it as stored (photos then have their final URL). */
  save(theme: Theme): Promise<Theme>
  remove(id: string): Promise<void>
  /** Hides a theme (built-in or created) from the students, or shows it again. */
  setHidden(id: string, hidden: boolean): Promise<void>
}

export interface ThemeList {
  themes: Theme[]
  /** Ids of hidden themes, built-in ('frutas') or created (UUID). */
  hidden: string[]
}

/** Read-only themes shipped with the site (design/data/themes.json). */
export const builtInThemes: readonly Theme[] = themesData.themes as Theme[]
