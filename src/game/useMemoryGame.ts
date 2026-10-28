import { useCallback, useEffect, useRef, useState } from 'react'
import type { ThemeWord } from '../types'
import { MISMATCH_DELAY_MS, WIN_DELAY_MS, flipCard, hideMismatch, isWon, newGame, type GameState } from './engine'

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

  // Latest values, updated synchronously: two clicks handled before React re-renders
  // must not both start from the same stale state.
  const gameRef = useRef(game)
  const startedAtRef = useRef(startedAt)

  const commit = useCallback((next: GameState) => {
    gameRef.current = next
    setGame(next)
  }, [])

  // Clock: starts on the first click, stops on the last pair.
  useEffect(() => {
    if (startedAt === null || won) return
    const tick = () => setSeconds(Math.floor((Date.now() - startedAt) / 1000))
    const id = window.setInterval(tick, 250)
    return () => window.clearInterval(id)
  }, [startedAt, won])

  useEffect(() => {
    if (!game.locked) return
    const id = window.setTimeout(() => commit(hideMismatch(gameRef.current)), MISMATCH_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [game.locked, commit])

  useEffect(() => {
    if (!won) return
    const id = window.setTimeout(() => setShowEnd(true), WIN_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [won])

  const flip = (index: number) => {
    const current = gameRef.current
    const next = flipCard(current, index)
    if (next === current) return
    if (startedAtRef.current === null) {
      startedAtRef.current = Date.now()
      setStartedAt(startedAtRef.current)
    }
    // Freeze the exact time on the last pair, without waiting for the next tick.
    if (isWon(next)) setSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000))
    commit(next)
  }

  /** New draw and new shuffle with the same number of words, counters reset. */
  const restart = useCallback(() => {
    commit(newGame(words, count))
    startedAtRef.current = null
    setStartedAt(null)
    setSeconds(0)
    setShowEnd(false)
  }, [words, count, commit])

  return { game, seconds, won, showEnd, flip, restart }
}
