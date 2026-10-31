import { createApiThemeStore } from './apiThemeStore'
import type { ThemeStore } from './ThemeStore'

/** The app-wide store for the themes created by the teacher. */
export const themeStore: ThemeStore = createApiThemeStore()
