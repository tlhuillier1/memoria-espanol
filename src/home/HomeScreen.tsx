import { useRef, useState } from 'react'
import { GradePicker } from '../components/GradePicker'
import { Icon } from '../components/Icon'
import type { Grade, Theme } from '../types'
import { themeCountLabel } from './texts'
import { ThemeCard } from './ThemeCard'
import { WordCountDialog } from './WordCountDialog'
import './home.css'

interface HomeScreenProps {
  grade: Grade
  themes: Theme[]
  /** Built-in themes that have a modified copy (they can be restored). */
  modifiedIds: ReadonlySet<string>
  /** Status after saving a theme; cleared by the next action. */
  notice: string
  onGradeChange: (grade: Grade) => void
  onPlay: (theme: Theme, wordCount: number) => void
  onCreate: () => void
  onEdit: (theme: Theme) => void
  /** Deletes a custom theme, or restores the original of a modified built-in one. */
  onRemove: (theme: Theme) => void
  onDismissNotice: () => void
}

export function HomeScreen(props: HomeScreenProps) {
  const { grade, themes, notice, onDismissNotice } = props
  const [picking, setPicking] = useState<Theme | null>(null)
  const sectionTitleRef = useRef<HTMLHeadingElement>(null)
  const gradeThemes = themes.filter((t) => t.grade === grade)

  const handleRemove = (theme: Theme) => {
    props.onRemove(theme)
    // A deleted card (and its focused « Sí » button) disappears: keep focus in the list.
    // A restored built-in theme keeps its card, which moves focus itself.
    if (!theme.builtIn) sectionTitleRef.current?.focus()
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
        {gradeThemes.length === 0 && <p className="home__empty">Todavía no hay temas para {grade}.</p>}
        <div className="theme-grid">
          {gradeThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              modified={props.modifiedIds.has(theme.id)}
              onPlay={() => setPicking(theme)}
              onEdit={() => props.onEdit(theme)}
              onRemove={() => handleRemove(theme)}
            />
          ))}
          <button type="button" className="create-card" onClick={props.onCreate}>
            <span className="create-card__icon">
              <Icon name="plus" size={30} strokeWidth={2.6} />
            </span>
            <span className="create-card__title">Crear un tema</span>
            <span className="create-card__subtitle">Para {grade}, con tus propias fotos</span>
          </button>
        </div>
      </section>

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
