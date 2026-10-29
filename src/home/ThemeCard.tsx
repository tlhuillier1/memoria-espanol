import { useEffect, useRef, useState } from 'react'
import { ThemeImage } from '../components/ThemeImage'
import type { Theme } from '../types'
import { themeSubtitle } from './texts'

interface ThemeCardProps {
  theme: Theme
  /** Built-in theme with a modified copy: it can be restored. */
  modified: boolean
  onPlay: () => void
  onEdit: () => void
  /** Deletes a custom theme, or restores the original of a modified built-in one. */
  onRemove: () => void
}

/** Second action next to « Modificar », confirmed inline: delete a custom theme, restore a modified built-in one. */
function removeAction(theme: Theme, modified: boolean) {
  if (!theme.builtIn) return { label: 'Eliminar', question: '¿Eliminar este tema?' }
  if (modified) return { label: 'Restaurar', question: '¿Volver al tema original?' }
  return null
}

export function ThemeCard({ theme, modified, onPlay, onEdit, onRemove }: ThemeCardProps) {
  const [confirming, setConfirming] = useState(false)
  const noRef = useRef<HTMLButtonElement>(null)
  const editRef = useRef<HTMLButtonElement>(null)
  const removeRef = useRef<HTMLButtonElement>(null)
  const hasOpenedConfirm = useRef(false)
  const action = removeAction(theme, modified)

  // Keep keyboard focus on the inline confirmation, then back on its action after « No »
  // (or on « Modificar » once a restored theme no longer offers « Restaurar »).
  useEffect(() => {
    if (confirming) {
      hasOpenedConfirm.current = true
      noRef.current?.focus()
    } else if (hasOpenedConfirm.current) {
      const target = removeRef.current ?? editRef.current
      target?.focus()
    }
  }, [confirming])

  const confirm = () => {
    setConfirming(false)
    onRemove()
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
        {!theme.builtIn && <span className="badge">Mi tema</span>}
        {theme.builtIn && modified && <span className="badge">Modificado</span>}
      </div>

      <button type="button" className="btn btn--primary push" onClick={onPlay} aria-label={`Jugar: ${theme.name}`}>
        Jugar
      </button>

      {action && confirming ? (
        <div className="theme-card__confirm">
          <span>{action.question}</span>
          <button type="button" className="confirm-button confirm-button--yes" onClick={confirm}>
            Sí
          </button>
          <button type="button" ref={noRef} className="confirm-button confirm-button--no" onClick={() => setConfirming(false)}>
            No
          </button>
        </div>
      ) : (
        <div className="theme-card__actions">
          <button type="button" ref={editRef} className="text-action" onClick={onEdit} aria-label={`Modificar: ${theme.name}`}>
            Modificar
          </button>
          {action && (
            <button
              type="button"
              ref={removeRef}
              className="text-action text-action--danger"
              onClick={() => setConfirming(true)}
              aria-label={`${action.label}: ${theme.name}`}
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </article>
  )
}
