import { useEffect, useRef, useState } from 'react'
import { ThemeImage } from '../components/ThemeImage'
import type { Theme } from '../types'
import { themeSubtitle } from './texts'

const DELETE_ERROR = 'No se ha podido eliminar el tema. Inténtalo de nuevo.'

interface ThemeCardProps {
  theme: Theme
  /** Teacher mode: show « Modificar » / « Eliminar » on created themes. */
  editable: boolean
  onPlay: () => void
  onEdit: () => void
  /** Resolves false when the deletion failed (the card then stays, with a message). */
  onDelete: () => Promise<boolean>
}

export function ThemeCard({ theme, editable, onPlay, onEdit, onDelete }: ThemeCardProps) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteFailed, setDeleteFailed] = useState(false)
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

  return (
    <article className="theme-card">
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
        {!theme.builtIn && <span className="badge">De la profe</span>}
      </div>

      <button type="button" className="btn btn--primary push" onClick={onPlay} aria-label={`Jugar: ${theme.name}`}>
        Jugar
      </button>

      {editable &&
        !theme.builtIn &&
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
    </article>
  )
}
