import { describe, expect, it } from 'vitest'
import type { ThemeWord } from '../types'
import {
  cardLabel,
  clampWordCount,
  columnsFor,
  defaultWordCount,
  flipCard,
  formatTime,
  hideMismatch,
  isWon,
  newGame,
  nounFontSize,
  shuffle,
  type GameState,
} from './engine'

const words: ThemeWord[] = Array.from({ length: 18 }, (_, i) => ({
  word: `la palabra${i}`,
  image: `assets/pictos/test/${i}.svg`,
}))

/** Deterministic pseudo-random generator so tests are reproducible. */
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 2 ** 32
    return s / 2 ** 32
  }
}

/** Index of the other card of the same pair. */
function partnerOf(state: GameState, index: number): number {
  return state.cards.findIndex((c, i) => i !== index && c.pair === state.cards[index].pair)
}

/** Index of a card that does not match `index`. */
function strangerOf(state: GameState, index: number): number {
  return state.cards.findIndex((c) => c.pair !== state.cards[index].pair)
}

describe('shuffle', () => {
  it('returns a permutation without mutating the input', () => {
    const input = [1, 2, 3, 4, 5, 6]
    const output = shuffle(input, seeded(1))
    expect(input).toEqual([1, 2, 3, 4, 5, 6])
    expect([...output].sort()).toEqual(input)
  })

  it('can produce every permutation (Fisher-Yates, not a biased sort)', () => {
    const rng = seeded(42)
    const seen = new Set<string>()
    for (let i = 0; i < 500; i++) seen.add(shuffle([1, 2, 3], rng).join())
    expect(seen.size).toBe(6)
  })
})

describe('word count', () => {
  it('clamps between 2 and the number of words', () => {
    expect(clampWordCount(1, 18)).toBe(2)
    expect(clampWordCount(25, 18)).toBe(18)
    expect(clampWordCount(7, 18)).toBe(7)
  })

  it('defaults to min(6, N)', () => {
    expect(defaultWordCount(18)).toBe(6)
    expect(defaultWordCount(4)).toBe(4)
  })
})

describe('newGame', () => {
  it('draws n distinct words and deals 2n shuffled cards', () => {
    const game = newGame(words, 6, seeded(3))
    expect(game.picked).toHaveLength(6)
    expect(new Set(game.picked).size).toBe(6)
    expect(game.cards).toHaveLength(12)
    for (let pair = 0; pair < 6; pair++) {
      const cards = game.cards.filter((c) => c.pair === pair)
      expect(cards.map((c) => c.kind).sort()).toEqual(['image', 'word'])
      expect(cards[0].word).toBe(game.picked[pair])
    }
    expect(game.cards.every((c) => !c.up && !c.matched && !c.wrong)).toBe(true)
    expect(game).toMatchObject({ open: [], attempts: 0, found: 0, locked: false })
  })

  it('draws a random subset of the theme', () => {
    const rng = seeded(7)
    const draws = new Set<string>()
    for (let i = 0; i < 20; i++) draws.add(newGame(words, 6, rng).picked.map((w) => w.word).sort().join())
    expect(draws.size).toBeGreaterThan(1)
  })

  it('uses every word when n = N and clamps out-of-range counts', () => {
    expect(newGame(words, 18).picked).toHaveLength(18)
    expect(newGame(words, 50).picked).toHaveLength(18)
    expect(newGame(words, 0).picked).toHaveLength(2)
  })

  it('rejects a theme with fewer than 2 words', () => {
    expect(() => newGame(words.slice(0, 1), 2)).toThrow()
  })
})

describe('flipCard', () => {
  it('turns the first card face up without counting an attempt', () => {
    const game = flipCard(newGame(words, 6, seeded(1)), 0)
    expect(game.cards[0].up).toBe(true)
    expect(game.open).toEqual([0])
    expect(game.attempts).toBe(0)
  })

  it('ignores a card that is already visible', () => {
    const game = flipCard(newGame(words, 6, seeded(1)), 0)
    expect(flipCard(game, 0)).toBe(game)
  })

  it('ignores an out-of-range index', () => {
    const game = newGame(words, 6, seeded(1))
    expect(flipCard(game, 99)).toBe(game)
  })

  it('keeps a matching pair visible and counts it', () => {
    let game = newGame(words, 6, seeded(1))
    const partner = partnerOf(game, 0)
    game = flipCard(flipCard(game, 0), partner)
    expect(game.attempts).toBe(1)
    expect(game.found).toBe(1)
    expect(game.open).toEqual([])
    expect(game.locked).toBe(false)
    expect(game.cards[0]).toMatchObject({ up: true, matched: true })
    expect(game.cards[partner]).toMatchObject({ up: true, matched: true })
    // A matched card cannot be clicked again.
    expect(flipCard(game, 0)).toBe(game)
  })

  it('marks a mismatch, locks the board, then hides the pair', () => {
    let game = newGame(words, 6, seeded(1))
    const stranger = strangerOf(game, 0)
    game = flipCard(flipCard(game, 0), stranger)
    expect(game.attempts).toBe(1)
    expect(game.found).toBe(0)
    expect(game.locked).toBe(true)
    expect(game.cards[0]).toMatchObject({ up: true, wrong: true })
    expect(game.cards[stranger]).toMatchObject({ up: true, wrong: true })

    const third = game.cards.findIndex((c) => !c.up)
    expect(flipCard(game, third)).toBe(game)

    game = hideMismatch(game)
    expect(game.locked).toBe(false)
    expect(game.cards[0]).toMatchObject({ up: false, wrong: false })
    expect(game.cards[stranger]).toMatchObject({ up: false, wrong: false })
  })

  it('hideMismatch does nothing when the board is not locked', () => {
    const game = newGame(words, 6, seeded(1))
    expect(hideMismatch(game)).toBe(game)
  })

  it('wins once every pair is found, then ignores clicks', () => {
    let game = newGame(words, 4, seeded(9))
    expect(isWon(game)).toBe(false)
    for (let pair = 0; pair < 4; pair++) {
      const [a, b] = game.cards.flatMap((c, i) => (c.pair === pair ? [i] : []))
      game = flipCard(flipCard(game, a), b)
    }
    expect(game.found).toBe(4)
    expect(game.attempts).toBe(4)
    expect(isWon(game)).toBe(true)
    expect(game.cards.every((c) => c.matched)).toBe(true)
  })
})

describe('display helpers', () => {
  it('picks the board columns from the number of cards', () => {
    expect([4, 12, 14, 20, 22, 30, 32, 60].map(columnsFor)).toEqual([4, 4, 5, 5, 6, 6, 8, 8])
  })

  it('shrinks long nouns', () => {
    expect(nounFontSize('sol')).toBe(17)
    expect(nounFontSize('manzana')).toBe(14)
    expect(nounFontSize('arcoíris')).toBe(14)
    expect(nounFontSize('mantequilla')).toBe(11.5)
    expect(nounFontSize('electrodoméstico')).toBe(9.5)
  })

  it('formats time as m:ss', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(42)).toBe('0:42')
    expect(formatTime(75)).toBe('1:15')
    expect(formatTime(600)).toBe('10:00')
  })

  it('labels cards for screen readers', () => {
    const card = { id: 'w0', pair: 0, kind: 'word' as const, word: { word: 'la fresa', image: '' }, up: false, matched: false, wrong: false }
    expect(cardLabel(card, 4)).toBe('Carta 5, boca abajo')
    expect(cardLabel({ ...card, up: true }, 4)).toBe('Palabra: la fresa')
    expect(cardLabel({ ...card, kind: 'image', up: true, matched: true }, 4)).toBe('Imagen: la fresa (pareja encontrada)')
  })
})
