import { useEffect, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { ThemeImage } from '../components/ThemeImage'
import type { Theme } from '../types'
import { themeSubtitle, visibilityError } from './texts'

const DELETE_ERROR = 'No se ha podido eliminar el tema. Inténtalo de nuevo.'

interface ThemeCardProps {
  theme: Theme
  /** Teacher mode: « Ocultar » / « Mostrar » on every theme, « Modificar » / « Eliminar » on created ones. */
  editable: boolean
  /** Hidden from the students (only the teacher sees the card, greyed out). */
  hidden: boolean
  onPlay: () => void
  onEdit: () => void
  /** Resolves false when the deletion failed (the card then stays, with a message). */
  onDelete: () => Promise<boolean>
  /** Hides (true) or shows (false) the theme; resolves false when that failed. */
  onSetHidden: (hidden: boolean) => Promise<boolean>
}

export function ThemeCard({ theme, editable, hidden, onPlay, onEdit, onDelete, onSetHidden }: ThemeCardProps) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteFailed, setDeleteFailed] = useState(false)
  const [togglingVisibility, setTogglingVisibility] = useState(false)
  /** The change that failed (true = hiding), or null. */
  const [visibilityFailed, setVisibilityFailed] = useState<boolean | null>(null)
  const noRef = useRef<HTMLButtonElement>(null)
  const deleteRef = useRef<HTMLButtonElement>(null)
  const hasOpenedConfirm = useRef(false)

  // Keep keyboard focus on the inline confirmation, then back on « Eliminar » after « No ».
  useEffect(() => {
    if (confirming) {
      hasOpenedConfirm.current = true
      noRef.current?.focus()
    } else if (hasOpenedConfirm.current) {
      deleteRef.current?.focus()
    }
  }, [confirming])

  const confirmDelete = async () => {
    setDeleting(true)
    setDeleteFailed(false)
    // On success the card disappears; otherwise it stays with the confirmation open.
    if (!(await onDelete())) {
      setDeleting(false)
      setDeleteFailed(true)
    }
  }

  // One button whose label changes, so keyboard focus stays on it (aria-disabled rather than
  // disabled while saving: a disabled button would lose the focus).
  const toggleVisibility = async () => {
    if (togglingVisibility) return
    const hide = !hidden
    setTogglingVisibility(true)
    setVisibilityFailed(null)
    const done = await onSetHidden(hide)
    setTogglingVisibility(false)
    if (!done) setVisibilityFailed(hide)
  }

  const visibilityButton = (
    <button
      type="button"
      className="text-action"
      onClick={toggleVisibility}
      aria-disabled={togglingVisibility}
      aria-label={`${hidden ? 'Mostrar' : 'Ocultar'}: ${theme.name}`}
    >
      {hidden ? 'Mostrar' : 'Ocultar'}
    </button>
  )

  return (
    <article className={hidden ? 'theme-card theme-card--hidden' : 'theme-card'}>
      <div className="theme-card__preview" style={{ background: theme.tint ?? 'var(--custom-soft)' }}>
        {theme.words.slice(0, 3).map((word, index) => (
          <span key={index} className="thumb theme-card__thumb">
            <ThemeImage src={word.image} pictoSize="80%" />
          </span>
        ))}
      </div>

      <div className="theme-card__heading">
        <div>
          <h3 className="theme-card__name">{theme.name}</h3>
          <p className="theme-card__subtitle">{themeSubtitle(theme)}</p>
        </div>
        {(hidden || !theme.builtIn) && (
          <div className="theme-card__badges">
            {hidden && (
              <span className="badge badge--hidden">
                <Icon name="eye-off" size={14} strokeWidth={2.4} />
                Oculto
              </span>
            )}
            {!theme.builtIn && <span className="badge">De la profe</span>}
          </div>
        )}
      </div>

      <button type="button" className="btn btn--primary push" onClick={onPlay} aria-label={`Jugar: ${theme.name}`}>
        Jugar
      </button>

      {editable && (
        <div className="theme-card__teacher">
          {!theme.builtIn &&
            (confirming ? (
              <div className="theme-card__confirm" aria-busy={deleting}>
                <span>¿Eliminar este tema?</span>
                <button type="button" className="confirm-button confirm-button--yes" onClick={confirmDelete} disabled={deleting}>
                  Sí
                </button>
                <button
                  type="button"
                  ref={noRef}
                  className="confirm-button confirm-button--no"
                  onClick={() => {
                    setConfirming(false)
                    setDeleteFailed(false)
                  }}
                  disabled={deleting}
                >
                  No
                </button>
                {deleteFailed && (
                  <p role="alert" className="theme-card__error">
                    {DELETE_ERROR}
                  </p>
                )}
              </div>
            ) : (
              <div className="theme-card__actions">
                <button type="button" className="text-action" onClick={onEdit} aria-label={`Modificar: ${theme.name}`}>
                  Modificar
                </button>
                <button
                  type="button"
                  ref={deleteRef}
                  className="text-action text-action--danger"
                  onClick={() => setConfirming(true)}
                  aria-label={`Eliminar: ${theme.name}`}
                >
                  Eliminar
                </button>
              </div>
            ))}

          {/* Same place on every card, built-in or created. */}
          <div className="theme-card__actions">{visibilityButton}</div>
          {visibilityFailed !== null && (
            <p role="alert" className="theme-card__error">
              {visibilityError(visibilityFailed)}
            </p>
          )}
        </div>
      )}
    </article>
  )
}
