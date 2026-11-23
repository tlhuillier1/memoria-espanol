import type { Theme } from '../types'

/**
 * Themes shown on the home screen: students never see the hidden ones;
 * the teacher sees them all, the hidden ones greyed out (spec §2.1).
 */
export function visibleThemes(themes: readonly Theme[], hidden: ReadonlySet<string>, teacher: boolean): Theme[] {
  return teacher ? [...themes] : themes.filter((theme) => !hidden.has(theme.id))
}
