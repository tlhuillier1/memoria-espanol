import { useRef, useState } from 'react'
import { GradePicker } from '../components/GradePicker'
import { Icon } from '../components/Icon'
import type { LoginResult } from '../store/teacherSession'
import type { LoadStatus } from '../store/useCustomThemes'
import type { Grade, Theme } from '../types'
import { LoginDialog } from './LoginDialog'
import { themeCountLabel } from './texts'
import { ThemeCard } from './ThemeCard'
import { WordCountDialog } from './WordCountDialog'
import './home.css'

interface HomeScreenProps {
  grade: Grade
  themes: Theme[]
  /** Loading of the teacher's themes (the built-in ones are always there). */
  loadStatus: LoadStatus
  /** Teacher mode: creating, modifying and deleting themes. */
  teacher: boolean
  /** Status after saving a theme; cleared by the next action. */
  notice: string
  onGradeChange: (grade: Grade) => void
  onPlay: (theme: Theme, wordCount: number) => void
  onCreate: () => void
  onEdit: (theme: Theme) => void
  /** Resolves false when the theme could not be deleted. */
  onDelete: (theme: Theme) => Promise<boolean>
  onLogin: (password: string) => Promise<LoginResult>
  onLogout: () => void
  onDismissNotice: () => void
}

export function HomeScreen(props: HomeScreenProps) {
  const { grade, themes, loadStatus, teacher, notice, onDismissNotice } = props
  const [picking, setPicking] = useState<Theme | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)
  const sectionTitleRef = useRef<HTMLHeadingElement>(null)
  const gradeThemes = themes.filter((t) => t.grade === grade)

  const handleDelete = async (theme: Theme) => {
    const deleted = await props.onDelete(theme)
    // The card (and the focused « Sí » button) disappears: keep focus in the list.
    if (deleted) sectionTitleRef.current?.focus()
    return deleted
  }

  const handleLogin = async (password: string) => {
    const result = await props.onLogin(password)
    if (result === 'ok') setLoggingIn(false)
    return result
  }

  return (
    // Any action on the page hides the status message (spec §2.1); keyboard activation also fires click.
    <main className="container screen home" onClickCapture={() => notice && onDismissNotice()}>
      <header className="home__header">
        <div className="home__intro">
          <h1 className="home__title">
            <span className="home__title-mark">¡</span>Memoria<span className="home__title-mark">!</span>
          </h1>
          <p className="home__subtitle">Encuentra las parejas: cada palabra con su imagen.</p>
        </div>
        <nav className="home__grades" aria-labelledby="grade-label">
          <span id="grade-label" className="eyebrow eyebrow--section">
            Clase
          </span>
          <GradePicker
            value={grade}
            onChange={props.onGradeChange}
            detail={(g) => themeCountLabel(themes.filter((t) => t.grade === g).length)}
          />
        </nav>
      </header>

      <div role="status" className={notice ? 'status-banner' : undefined}>
        {notice}
      </div>

      <section className="home__themes" aria-labelledby="themes-title">
        <h2 id="themes-title" ref={sectionTitleRef} tabIndex={-1} className="eyebrow eyebrow--section">
          Temas de {grade}
        </h2>
        {loadStatus === 'error' && (
          <p role="alert" className="error-banner">
            No se han podido cargar los temas de la profesora. Comprueba la conexión y recarga la página.
          </p>
        )}
        {gradeThemes.length === 0 &&
          (loadStatus === 'loading' ? (
            <p className="home__empty">Cargando los temas…</p>
          ) : (
            <p className="home__empty">Todavía no hay temas para {grade}.</p>
          ))}
        <div className="theme-grid">
          {gradeThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              editable={teacher}
              onPlay={() => setPicking(theme)}
              onEdit={() => props.onEdit(theme)}
              onDelete={() => handleDelete(theme)}
            />
          ))}
          {teacher && (
            <button type="button" className="create-card" onClick={props.onCreate}>
              <span className="create-card__icon">
                <Icon name="plus" size={30} strokeWidth={2.6} />
              </span>
              <span className="create-card__title">Crear un tema</span>
              <span className="create-card__subtitle">Para {grade}, con tus propias fotos</span>
            </button>
          )}
        </div>
      </section>

      <footer className="home__footer">
        {teacher && <span>Modo profesora</span>}
        {/* One button whose label changes, so keyboard focus stays on it after logging in or out. */}
        <button
          type="button"
          className="text-action text-action--quiet"
          onClick={teacher ? props.onLogout : () => setLoggingIn(true)}
        >
          {teacher ? 'Salir' : 'Profesora'}
        </button>
      </footer>

      {loggingIn && <LoginDialog onCancel={() => setLoggingIn(false)} onLogin={handleLogin} />}

      {picking && (
        <WordCountDialog
          theme={picking}
          onCancel={() => setPicking(null)}
          onConfirm={(count) => props.onPlay(picking, count)}
        />
      )}
    </main>
  )
}
