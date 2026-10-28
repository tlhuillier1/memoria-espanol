import { imageUrl } from './lib/assets'
import { builtInThemes } from './store/ThemeStore'

// Placeholder home screen: checks that tokens, fonts, data and assets are wired up.
export default function App() {
  return (
    <main className="container" style={{ paddingTop: 48, paddingBottom: 48 }}>
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
      <p style={{ fontSize: 20, fontWeight: 600, color: 'var(--ink-soft)' }}>
        Encuentra las parejas: cada palabra con su imagen.
      </p>
      <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 16, listStyle: 'none', padding: 0 }}>
        {builtInThemes.map((theme) => (
          <li
            key={theme.id}
            style={{
              background: theme.tint,
              border: 'var(--border)',
              borderRadius: 'var(--radius-theme)',
              boxShadow: 'var(--shadow-md)',
              padding: 12,
            }}
          >
            <img src={imageUrl(theme.words[0].image)} alt="" width={64} height={64} />
            <strong>{theme.name}</strong>
          </li>
        ))}
      </ul>
    </main>
  )
}
