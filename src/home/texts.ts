// Interface strings with counts — exact wording in design/specification.md §7.
import type { Theme } from '../types'

export function themeCountLabel(count: number): string {
  return count === 1 ? '1 tema' : `${count} temas`
}

export function wordCountLabel(count: number): string {
  return count === 1 ? '1 palabra' : `${count} palabras`
}

/** Line under a theme name: French translation (built-in themes) + word count. */
export function themeSubtitle(theme: Theme): string {
  const words = wordCountLabel(theme.words.length)
  return theme.nameFr ? `${theme.nameFr} · ${words}` : words
}

/** Info line of the word-count dialog. */
export function pickerSummary(count: number, available: number): string {
  const detail = count === available ? 'todas las palabras del tema' : `${count} palabras sorteadas entre las ${available} del tema`
  return `${count * 2} cartas · ${detail}`
}
