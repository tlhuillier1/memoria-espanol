import type { CSSProperties } from 'react'
import { BackButton } from '../components/BackButton'
import { Icon } from '../components/Icon'
import { StatPill } from '../components/StatPill'
import type { Theme } from '../types'
import { EndPanel } from './EndPanel'
import { columnsFor, formatTime } from './engine'
import { MemoryCard } from './MemoryCard'
import { useMemoryGame } from './useMemoryGame'
import './game.css'

interface GameScreenProps {
  theme: Theme
  wordCount: number
  /** Back to the theme list; unmounting cancels the clock and pending delays. */
  onExit: () => void
}

export function GameScreen({ theme, wordCount, onExit }: GameScreenProps) {
  const { game, seconds, showEnd, flip, restart } = useMemoryGame(theme.words, wordCount)
  const columns = columnsFor(game.cards.length)
  const boardStyle = {
    '--cols': columns,
    maxWidth: `${Math.min(1080, columns * 215)}px`,
  } as CSSProperties

  return (
    <main className="container screen game-screen">
      <header className="game-header">
        <div className="game-header__title">
          <BackButton onClick={onExit} />
          <div>
            <span className="eyebrow">{theme.grade}</span>
            <h1 className="screen-title">{theme.name}</h1>
          </div>
        </div>
        <div className="stat-row">
          <StatPill label="Parejas" value={`${game.found}/${game.picked.length}`} />
          <StatPill label="Intentos" value={game.attempts} />
          <StatPill label="Tiempo" value={formatTime(seconds)} />
          <button type="button" className="icon-button push" onClick={restart} aria-label="Volver a empezar con otras palabras">
            <Icon name="refresh" />
          </button>
        </div>
      </header>

      {showEnd ? (
        <EndPanel picked={game.picked} attempts={game.attempts} seconds={seconds} onReplay={restart} onExit={onExit} />
      ) : (
        <div className="board-wrap" style={boardStyle}>
          <p className="game-instructions">Gira dos cartas: una palabra y su imagen.</p>
          <div className="board">
            {game.cards.map((card, index) => (
              <MemoryCard key={card.id} card={card} index={index} onFlip={flip} />
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
