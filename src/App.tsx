import { useState } from 'react'
import { ThemeImage } from './components/ThemeImage'
import { defaultWordCount } from './game/engine'
import { GameScreen } from './game/GameScreen'
import { builtInThemes } from './store/ThemeStore'
import type { Theme } from './types'

type Screen = { name: 'home' } | { name: 'game'; theme: Theme; wordCount: number }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })

  if (screen.name === 'game') {
    return <GameScreen theme={screen.theme} wordCount={screen.wordCount} onExit={() => setScreen({ name: 'home' })} />
  }

  // Temporary home: the real one (grade picker, theme cards, word-count dialog) comes next.
  return (
    <main className="container screen">
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(52px, 10vw, 76px)',
          lineHeight: 0.95,
          letterSpacing: '-0.01em',
          margin: 0,
        }}
      >
        <span style={{ color: 'var(--accent-red)' }}>¡</span>Memoria
        <span style={{ color: 'var(--accent-red)' }}>!</span>
      </h1>
      <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 16, listStyle: 'none', padding: 0, margin: 0 }}>
        {builtInThemes.map((theme) => (
          <li key={theme.id}>
            <button
              type="button"
              className="btn btn--secondary push"
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: theme.tint }}
              onClick={() => setScreen({ name: 'game', theme, wordCount: defaultWordCount(theme.words.length) })}
            >
              <span className="thumb" style={{ width: 40, height: 40 }}>
                <ThemeImage src={theme.words[0].image} pictoSize="90%" />
              </span>
              Jugar: {theme.name}
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
