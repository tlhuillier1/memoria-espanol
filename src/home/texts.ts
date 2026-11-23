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

/** Counter above the word list of the dialog's « Elegir las palabras » mode. */
export function selectedCountLabel(selected: number, available: number): string {
  return `${selected} de ${available} ${selected === 1 ? 'elegida' : 'elegidas'}`
}

/** Info line of the dialog's « Elegir las palabras » mode. */
export function choiceSummary(selected: number, available: number): string {
  if (selected < 2) return 'Elige al menos 2 palabras.'
  const detail = selected === available ? 'todas las palabras del tema' : `${selected} palabras elegidas`
  return `${selected * 2} cartas · ${detail}`
}

/** Info line of the word-count dialog. */
export function pickerSummary(count: number, available: number): string {
  const detail = count === available ? 'todas las palabras del tema' : `${count} palabras sorteadas entre las ${available} del tema`
  return `${count * 2} cartas · ${detail}`
}

/** Status message after the teacher hides or shows a theme. */
export function visibilityNotice(theme: Theme, hidden: boolean): string {
  return hidden ? `Tema «${theme.name}» oculto para los alumnos.` : `Tema «${theme.name}» visible para los alumnos.`
}

/** Error under the card's actions when hiding or showing failed. */
export function visibilityError(hide: boolean): string {
  return `No se ha podido ${hide ? 'ocultar' : 'mostrar'} el tema. Inténtalo de nuevo.`
}
