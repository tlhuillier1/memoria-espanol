// Data model — see design/specification.md §4.

export type Grade = '5e' | '4e' | '3e'

export const GRADES: readonly Grade[] = ['5e', '4e', '3e']

export interface ThemeWord {
  /** Spanish word with its article, e.g. "la manzana". */
  word: string
  /** Asset path relative to the site root: built-in picto, or stored photo (api/images/<sha256>); a data URL while being edited. */
  image: string
}

export interface Theme {
  /** 'frutas' for a built-in theme, a UUID for a custom one. */
  id: string
  grade: Grade
  name: string
  /** French translation, built-in themes only. */
  nameFr?: string
  /** Preview background; custom themes use --custom-soft. */
  tint?: string
  builtIn: boolean
  words: ThemeWord[]
}
