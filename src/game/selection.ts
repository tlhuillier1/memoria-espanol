// How the words of a game are chosen — see design/specification.md §2.2. Pure logic, no React.
import type { ThemeWord } from '../types'
import { MIN_WORDS, clampWordCount } from './engine'

/**
 * Choice made in the pre-game dialog:
 * - `random`: `count` words drawn at random among the theme's words, a new draw on each replay;
 * - `chosen`: exactly the words at these indexes of the theme, reshuffled on each replay.
 */
export type WordChoice = { mode: 'random'; count: number } | { mode: 'chosen'; indexes: readonly number[] }

/** Words handed to the game engine: it draws `count` of `pool` (all of them for a chosen list). */
export interface GameDeck {
  pool: ThemeWord[]
  count: number
}

/** Valid, sorted, de-duplicated indexes of a theme with `available` words. */
export function normalizeIndexes(indexes: readonly number[], available: number): number[] {
  const valid = indexes.filter((i) => Number.isInteger(i) && i >= 0 && i < available)
  return [...new Set(valid)].sort((a, b) => a - b)
}

/** Every index of a theme with `available` words: the default selection. */
export function allIndexes(available: number): number[] {
  return Array.from({ length: available }, (_, i) => i)
}

/** Adds the index to the selection, or removes it if it is already there. */
export function toggleIndex(indexes: readonly number[], index: number): number[] {
  return indexes.includes(index) ? indexes.filter((i) => i !== index) : [...indexes, index].sort((a, b) => a - b)
}

/** A chosen list can be played once it has at least MIN_WORDS words. */
export function canPlayChoice(selectedCount: number): boolean {
  return selectedCount >= MIN_WORDS
}

/** Turns the dialog's choice into the engine's input. Throws if a chosen list is too short. */
export function gameDeck(words: readonly ThemeWord[], choice: WordChoice): GameDeck {
  if (choice.mode === 'random') {
    return { pool: words.slice(), count: clampWordCount(choice.count, words.length) }
  }
  const pool = normalizeIndexes(choice.indexes, words.length).map((i) => words[i])
  if (!canPlayChoice(pool.length)) throw new Error(`Choose at least ${MIN_WORDS} words`)
  return { pool, count: pool.length }
}
