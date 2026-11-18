import { describe, expect, it } from 'vitest'
import type { ThemeWord } from '../types'
import { newGame } from './engine'
import { allIndexes, canPlayChoice, gameDeck, normalizeIndexes, toggleIndex } from './selection'

const words: ThemeWord[] = Array.from({ length: 8 }, (_, i) => ({
  word: `la palabra${i}`,
  image: `assets/pictos/test/${i}.svg`,
}))

describe('word selection', () => {
  it('selects every word by default', () => {
    expect(allIndexes(4)).toEqual([0, 1, 2, 3])
    expect(allIndexes(0)).toEqual([])
  })

  it('toggles an index and keeps the selection sorted', () => {
    expect(toggleIndex([0, 2], 1)).toEqual([0, 1, 2])
    expect(toggleIndex([0, 1, 2], 1)).toEqual([0, 2])
    expect(toggleIndex([], 5)).toEqual([5])
  })

  it('drops invalid and duplicated indexes', () => {
    expect(normalizeIndexes([3, 1, 3, -1, 8, 1.5, 0], 8)).toEqual([0, 1, 3])
  })

  it('needs at least two words to play', () => {
    expect(canPlayChoice(0)).toBe(false)
    expect(canPlayChoice(1)).toBe(false)
    expect(canPlayChoice(2)).toBe(true)
  })
})

describe('gameDeck', () => {
  it('draws among all the words in random mode', () => {
    const deck = gameDeck(words, { mode: 'random', count: 3 })
    expect(deck.pool).toEqual(words)
    expect(deck.count).toBe(3)
  })

  it('clamps the random count to the theme', () => {
    expect(gameDeck(words, { mode: 'random', count: 50 }).count).toBe(8)
    expect(gameDeck(words, { mode: 'random', count: 0 }).count).toBe(2)
  })

  it('plays exactly the chosen words, in theme order', () => {
    const deck = gameDeck(words, { mode: 'chosen', indexes: [5, 1, 3] })
    expect(deck.pool).toEqual([words[1], words[3], words[5]])
    expect(deck.count).toBe(3)
  })

  it('refuses a chosen list shorter than two words', () => {
    expect(() => gameDeck(words, { mode: 'chosen', indexes: [4] })).toThrow()
    expect(() => gameDeck(words, { mode: 'chosen', indexes: [] })).toThrow()
  })

  it('deals every chosen word, and only them, on each new game', () => {
    const { pool, count } = gameDeck(words, { mode: 'chosen', indexes: [0, 6, 7] })
    for (let round = 0; round < 5; round++) {
      const game = newGame(pool, count)
      expect(game.cards).toHaveLength(6)
      expect(game.picked.map((w) => w.word).sort()).toEqual(['la palabra0', 'la palabra6', 'la palabra7'])
    }
  })
})
