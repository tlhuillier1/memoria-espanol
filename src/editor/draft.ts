// Theme form state and validation — spec §2.5 and §5. Pure, so it can be unit-tested.
import type { Grade, Theme } from '../types'

export const CUSTOM_TINT = '#ECE6F7'
export const MIN_ROWS = 2
const NEW_THEME_ROWS = 4

export const FORM_ERRORS = {
  noName: 'Escribe un nombre para el tema.',
  incompleteRow: 'Cada palabra necesita su imagen, y cada imagen su palabra.',
  tooFewRows: 'Hacen falta al menos 2 palabras con su imagen.',
  unreadableImage: 'No se ha podido leer esta imagen.',
} as const

export interface DraftRow {
  /** Stable React key; also lets an async photo import find its row after edits. */
  key: string
  word: string
  /** Data URL of the photo, or an asset path when editing; '' when empty. */
  image: string
}

export interface Draft {
  /** Set when modifying an existing theme. */
  id?: string
  name: string
  grade: Grade
  rows: DraftRow[]
}

export type DraftResult = { ok: true; theme: Theme } | { ok: false; error: string }

export function emptyRow(): DraftRow {
  return { key: crypto.randomUUID(), word: '', image: '' }
}

export function emptyDraft(grade: Grade): Draft {
  return { name: '', grade, rows: Array.from({ length: NEW_THEME_ROWS }, emptyRow) }
}

export function draftFromTheme(theme: Theme): Draft {
  return {
    id: theme.id,
    name: theme.name,
    grade: theme.grade,
    rows: theme.words.map((w) => ({ key: crypto.randomUUID(), word: w.word, image: w.image })),
  }
}

const isBlank = (row: DraftRow) => !row.word.trim() && !row.image
const isComplete = (row: DraftRow) => !!row.word.trim() && !!row.image

/** Rows with both a word and an image (« {k} listas · mínimo 2 »). */
export function readyCount(rows: readonly DraftRow[]): number {
  return rows.filter(isComplete).length
}

/** Checks the draft in the order of spec §5; fully blank rows are ignored, spaces trimmed. */
export function validateDraft(draft: Draft, newId: () => string = () => crypto.randomUUID()): DraftResult {
  const name = draft.name.trim()
  if (!name) return { ok: false, error: FORM_ERRORS.noName }

  const rows = draft.rows.filter((row) => !isBlank(row))
  if (!rows.every(isComplete)) return { ok: false, error: FORM_ERRORS.incompleteRow }
  if (rows.length < MIN_ROWS) return { ok: false, error: FORM_ERRORS.tooFewRows }

  return {
    ok: true,
    theme: {
      id: draft.id ?? newId(),
      grade: draft.grade,
      name,
      tint: CUSTOM_TINT,
      builtIn: false,
      words: rows.map((row) => ({ word: row.word.trim(), image: row.image })),
    },
  }
}

/** Shown in the form when the database did not take the theme (spec §5); the draft is kept. */
export const SAVE_ERRORS = {
  failed: 'No se ha podido guardar el tema. Comprueba la conexión e inténtalo de nuevo.',
  sessionExpired: 'Tu sesión de profesora ha caducado. Vuelve a entrar desde la página de inicio.',
} as const

/** Status shown on the home screen after saving (spec §2.1). */
export function savedNotice(theme: Theme): string {
  return `Tema «${theme.name}» guardado en ${theme.grade}.`
}
