import { useCallback, useEffect, useState } from 'react'
import type { ThemeWord } from '../types'
import { MISMATCH_DELAY_MS, WIN_DELAY_MS, flipCard, hideMismatch, isWon, newGame } from './engine'

/**
 * React wrapper around the pure engine: owns the timer and the mismatch / end-screen delays.
 * Every timer is cleared on unmount, so leaving the game cancels everything (spec §3 rule 7).
 */
export function useMemoryGame(words: readonly ThemeWord[], count: number) {
  const [game, setGame] = useState(() => newGame(words, count))
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [showEnd, setShowEnd] = useState(false)
  const won = isWon(game)

  // Clock: starts on the first click, stops on the last pair.
  useEffect(() => {
    if (startedAt === null || won) return
    const tick = () => setSeconds(Math.floor((Date.now() - startedAt) / 1000))
    const id = window.setInterval(tick, 250)
    return () => window.clearInterval(id)
  }, [startedAt, won])

  useEffect(() => {
    if (!game.locked) return
    const id = window.setTimeout(() => setGame(hideMismatch), MISMATCH_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [game.locked])

  useEffect(() => {
    if (!won) return
    const id = window.setTimeout(() => setShowEnd(true), WIN_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [won])

  const flip = (index: number) => {
    const next = flipCard(game, index)
    if (next === game) return
    const start = startedAt ?? Date.now()
    if (startedAt === null) setStartedAt(start)
    // Freeze the exact time on the last pair, without waiting for the next tick.
    if (isWon(next)) setSeconds(Math.floor((Date.now() - start) / 1000))
    setGame(next)
  }

  /** New draw and new shuffle with the same number of words, counters reset. */
  const restart = useCallback(() => {
    setGame(newGame(words, count))
    setStartedAt(null)
    setSeconds(0)
    setShowEnd(false)
  }, [words, count])

  return { game, seconds, won, showEnd, flip, restart }
}
