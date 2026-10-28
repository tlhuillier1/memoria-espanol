import { useEffect, useRef } from 'react'
import { StatPill } from '../components/StatPill'
import { ThemeImage } from '../components/ThemeImage'
import type { ThemeWord } from '../types'
import { formatTime } from './engine'

interface EndPanelProps {
  picked: ThemeWord[]
  attempts: number
  seconds: number
  onReplay: () => void
  onExit: () => void
}

/** End screen (spec §2.4): replaces the board once every pair is found. */
export function EndPanel({ picked, attempts, seconds, onReplay, onExit }: EndPanelProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)

  // The board (and the focused card) disappears: move focus to the announcement.
  useEffect(() => titleRef.current?.focus(), [])

  return (
    <section className="end-panel" aria-labelledby="end-title">
      <div className="end-panel__heading">
        <h2 id="end-title" ref={titleRef} tabIndex={-1}>
          ¡Enhorabuena!
        </h2>
        <p>Has encontrado las {picked.length} parejas.</p>
      </div>

      <div className="stat-row">
        <StatPill variant="end" label="Intentos" value={attempts} />
        <StatPill variant="end" label="Tiempo" value={formatTime(seconds)} />
      </div>

      <div className="end-panel__recap">
        <h3 className="eyebrow eyebrow--section">Repasa las palabras</h3>
        <ul>
          {picked.map((word) => (
            <li key={word.word}>
              <span className="thumb">
                <ThemeImage src={word.image} />
              </span>
              <span>{word.word}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="button-row">
        <button type="button" className="btn btn--primary push" onClick={onReplay}>
          Jugar otra vez
        </button>
        <button type="button" className="btn btn--secondary push" onClick={onExit}>
          Cambiar de tema
        </button>
      </div>
    </section>
  )
}
