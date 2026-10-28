import { BackButton } from '../components/BackButton'
import type { Grade, Theme } from '../types'

interface EditorScreenProps {
  /** Theme to modify; absent when creating a new one. */
  theme?: Theme
  grade: Grade
  onExit: () => void
}

// Placeholder until the theme form (spec §2.5) is built.
export function EditorScreen({ theme, onExit }: EditorScreenProps) {
  return (
    <main className="container screen">
      <div className="game-header__title">
        <BackButton onClick={onExit} />
        <h1 className="screen-title">{theme ? 'Modificar el tema' : 'Crear un tema'}</h1>
      </div>
    </main>
  )
}
