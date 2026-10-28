// Pure game logic — see design/specification.md §3. No timers, no DOM: the React hook drives the delays.
import type { ThemeWord } from '../types'

export const MIN_WORDS = 2
/** Delay before a mismatched pair turns back face down. */
export const MISMATCH_DELAY_MS = 1100
/** Delay between the last pair found and the end screen. */
export const WIN_DELAY_MS = 900

export type CardKind = 'image' | 'word'

export interface Card {
  id: string
  /** Index of the word in `GameState.picked`: two cards with the same pair match. */
  pair: number
  kind: CardKind
  word: ThemeWord
  /** Face up (temporarily or because it is matched). */
  up: boolean
  matched: boolean
  /** Part of the mismatched pair currently shown. */
  wrong: boolean
}

export interface GameState {
  /** Words drawn for this game, in draw order (used by the end screen). */
  picked: ThemeWord[]
  cards: Card[]
  /** Indexes of face-up cards not yet resolved (0 or 1). */
  open: number[]
  attempts: number
  found: number
  /** True while a mismatched pair is shown; clicks are ignored until `hideMismatch`. */
  locked: boolean
}

export type Rng = () => number

/** Fisher-Yates shuffle, returns a new array. */
export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const result = items.slice()
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** Keeps the requested number of words within 2 ≤ n ≤ number of words of the theme. */
export function clampWordCount(requested: number, available: number): number {
  return Math.max(MIN_WORDS, Math.min(available, Math.round(requested)))
}

/** Default value of the word-count picker: min(6, N). */
export function defaultWordCount(available: number): number {
  return clampWordCount(6, available)
}

/** Draws `count` random words and deals one image card and one word card for each, shuffled. */
export function newGame(words: readonly ThemeWord[], count: number, rng: Rng = Math.random): GameState {
  if (words.length < MIN_WORDS) throw new Error(`A theme needs at least ${MIN_WORDS} words`)
  const picked = shuffle(words, rng).slice(0, clampWordCount(count, words.length))
  const cards = picked.flatMap((word, pair): Card[] => [
    { id: `i${pair}`, pair, kind: 'image', word, up: false, matched: false, wrong: false },
    { id: `w${pair}`, pair, kind: 'word', word, up: false, matched: false, wrong: false },
  ])
  return { picked, cards: shuffle(cards, rng), open: [], attempts: 0, found: 0, locked: false }
}

/**
 * Turns a card face up and resolves the pair when two are open.
 * Returns the same state object when the click is ignored (locked board, card already visible, game over).
 */
export function flipCard(state: GameState, index: number): GameState {
  const card = state.cards[index]
  if (state.locked || isWon(state) || !card || card.up || card.matched) return state

  const cards = state.cards.slice()
  cards[index] = { ...card, up: true }
  const open = [...state.open, index]
  if (open.length < 2) return { ...state, cards, open }

  const [a, b] = open
  const attempts = state.attempts + 1
  if (cards[a].pair === cards[b].pair) {
    cards[a] = { ...cards[a], matched: true }
    cards[b] = { ...cards[b], matched: true }
    return { ...state, cards, open: [], attempts, found: state.found + 1 }
  }
  cards[a] = { ...cards[a], wrong: true }
  cards[b] = { ...cards[b], wrong: true }
  return { ...state, cards, open: [], attempts, locked: true }
}

/** Turns the mismatched pair back face down and unlocks the board. */
export function hideMismatch(state: GameState): GameState {
  if (!state.locked) return state
  return {
    ...state,
    locked: false,
    cards: state.cards.map((card) => (card.wrong ? { ...card, up: false, wrong: false } : card)),
  }
}

export function isWon(state: GameState): boolean {
  return state.found === state.picked.length
}

// --- Display helpers -------------------------------------------------------------------------

/** Board columns by number of cards (spec §2.3). */
export function columnsFor(cardCount: number): number {
  if (cardCount <= 12) return 4
  if (cardCount <= 20) return 5
  if (cardCount <= 30) return 6
  return 8
}

/** Font size of the noun on a word card, in `cqi` units, by length (spec §2.3). */
export function nounFontSize(noun: string): number {
  const length = noun.length
  if (length <= 6) return 17
  if (length <= 9) return 14
  if (length <= 12) return 11.5
  return 9.5
}

/** Formats elapsed seconds as `m:ss`. */
export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/** Accessible label of a card button (spec §6). `index` is 0-based. */
export function cardLabel(card: Card, index: number): string {
  if (!card.up && !card.matched) return `Carta ${index + 1}, boca abajo`
  const prefix = card.kind === 'word' ? 'Palabra' : 'Imagen'
  return `${prefix}: ${card.word.word}${card.matched ? ' (pareja encontrada)' : ''}`
}
