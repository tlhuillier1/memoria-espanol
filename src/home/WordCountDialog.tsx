import { useEffect, useRef, useState, type MouseEvent, type SyntheticEvent } from 'react'
import { Icon } from '../components/Icon'
import { MIN_WORDS, clampWordCount, defaultWordCount } from '../game/engine'
import type { Theme } from '../types'
import { pickerSummary } from './texts'

interface WordCountDialogProps {
  theme: Theme
  onCancel: () => void
  onConfirm: (wordCount: number) => void
}

/**
 * « How many words? » dialog (spec §2.2), built on the native modal <dialog>:
 * the rest of the page is inert (focus trap) and Escape fires `cancel`.
 */
export function WordCountDialog({ theme, onCancel, onConfirm }: WordCountDialogProps) {
  const available = theme.words.length
  const [count, setCount] = useState(() => defaultWordCount(available))
  const dialogRef = useRef<HTMLDialogElement>(null)
  const rangeRef = useRef<HTMLInputElement>(null)
  // The « Jugar » button that opened the dialog, to give focus back on close.
  const opener = useRef(document.activeElement as HTMLElement | null)

  useEffect(() => {
    const dialog = dialogRef.current
    const returnFocusTo = opener.current
    if (!dialog) return
    dialog.showModal()
    rangeRef.current?.focus()
    return () => {
      dialog.close()
      returnFocusTo?.focus()
    }
  }, [])

  const update = (value: number) => setCount(clampWordCount(value, available))

  const handleCancelEvent = (event: SyntheticEvent) => {
    event.preventDefault() // Escape: let React unmount the dialog
    onCancel()
  }

  const handleBackdropClick = (event: MouseEvent) => {
    // The dialog itself has no padding: a click whose target is the <dialog> landed on the backdrop.
    if (event.target === dialogRef.current) onCancel()
  }

  return (
    <dialog
      ref={dialogRef}
      className="word-dialog"
      aria-labelledby="word-dialog-title"
      aria-describedby="word-dialog-summary"
      onCancel={handleCancelEvent}
      onClick={handleBackdropClick}
    >
      <div className="word-dialog__box">
        <div className="word-dialog__heading">
          <span className="eyebrow eyebrow--section">
            {theme.name} · {theme.grade}
          </span>
          <h2 id="word-dialog-title">¿Con cuántas palabras quieres jugar?</h2>
        </div>

        <div className="word-dialog__counter">
          <button
            type="button"
            className="icon-button icon-button--large push"
            onClick={() => update(count - 1)}
            disabled={count <= MIN_WORDS}
            aria-label="Una palabra menos"
          >
            <Icon name="minus" size={28} strokeWidth={2.6} />
          </button>
          <div className="word-dialog__value">
            <span aria-live="polite" className="word-dialog__number">
              {count}
            </span>
            <span className="word-dialog__unit">palabras</span>
          </div>
          <button
            type="button"
            className="icon-button icon-button--large push"
            onClick={() => update(count + 1)}
            disabled={count >= available}
            aria-label="Una palabra más"
          >
            <Icon name="plus" size={28} strokeWidth={2.6} />
          </button>
        </div>

        <div className="word-dialog__range">
          <input
            ref={rangeRef}
            type="range"
            min={MIN_WORDS}
            max={available}
            step={1}
            value={count}
            onChange={(e) => update(Number(e.target.value))}
            aria-label="Número de palabras"
          />
          <div className="word-dialog__bounds" aria-hidden="true">
            <span>{MIN_WORDS}</span>
            <span>{available}</span>
          </div>
        </div>

        <p id="word-dialog-summary" className="word-dialog__summary">
          {pickerSummary(count, available)}
        </p>

        <div className="button-row word-dialog__actions">
          <button type="button" className="btn btn--secondary push" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="btn btn--primary push" onClick={() => onConfirm(count)}>
            ¡A jugar!
          </button>
        </div>
      </div>
    </dialog>
  )
}
