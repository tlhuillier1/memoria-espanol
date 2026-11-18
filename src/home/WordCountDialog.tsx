import { useEffect, useRef, useState, type MouseEvent, type SyntheticEvent } from 'react'
import { Icon } from '../components/Icon'
import { ThemeImage } from '../components/ThemeImage'
import { MIN_WORDS, clampWordCount, defaultWordCount } from '../game/engine'
import { allIndexes, canPlayChoice, toggleIndex, type WordChoice } from '../game/selection'
import type { Theme } from '../types'
import { choiceSummary, pickerSummary, selectedCountLabel } from './texts'

type Mode = WordChoice['mode']

const TITLES: Record<Mode, string> = {
  random: '¿Con cuántas palabras quieres jugar?',
  chosen: '¿Con qué palabras quieres jugar?',
}

interface WordCountDialogProps {
  theme: Theme
  onCancel: () => void
  onConfirm: (choice: WordChoice) => void
}

/**
 * Pre-game dialog (spec §2.2), built on the native modal <dialog>:
 * the rest of the page is inert (focus trap) and Escape fires `cancel`.
 * Two modes: « Al azar » (how many words, drawn at random) and « Elegir las palabras » (which words).
 */
export function WordCountDialog({ theme, onCancel, onConfirm }: WordCountDialogProps) {
  const available = theme.words.length
  const [mode, setMode] = useState<Mode>('random')
  const [count, setCount] = useState(() => defaultWordCount(available))
  // Both modes keep their value when switching back and forth.
  const [indexes, setIndexes] = useState(() => allIndexes(available))
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

  const canPlay = mode === 'random' || canPlayChoice(indexes.length)

  const confirm = () => {
    if (!canPlay) return
    onConfirm(mode === 'random' ? { mode, count } : { mode, indexes })
  }

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
      className="dialog"
      aria-labelledby="word-dialog-title"
      aria-describedby="word-dialog-summary"
      onCancel={handleCancelEvent}
      onClick={handleBackdropClick}
    >
      <div className="dialog__box">
        <div className="dialog__heading">
          <span className="eyebrow eyebrow--section">
            {theme.name} · {theme.grade}
          </span>
          <h2 id="word-dialog-title">{TITLES[mode]}</h2>
        </div>

        <div className="mode-switch" role="group" aria-label="Cómo elegir las palabras">
          <button
            type="button"
            className="mode-switch__button push"
            aria-pressed={mode === 'random'}
            onClick={() => setMode('random')}
          >
            Al azar
          </button>
          <button
            type="button"
            className="mode-switch__button push"
            aria-pressed={mode === 'chosen'}
            onClick={() => setMode('chosen')}
          >
            Elegir las palabras
          </button>
        </div>

        {mode === 'random' ? (
          <>
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
          </>
        ) : (
          <fieldset className="word-choice">
            <legend className="visually-hidden">Palabras del tema</legend>
            <div className="word-choice__head">
              <span aria-live="polite" className="word-choice__count">
                {selectedCountLabel(indexes.length, available)}
              </span>
              <div className="word-choice__bulk">
                <button
                  type="button"
                  className="text-action"
                  onClick={() => setIndexes(allIndexes(available))}
                  disabled={indexes.length === available}
                >
                  Todas
                </button>
                <button
                  type="button"
                  className="text-action"
                  onClick={() => setIndexes([])}
                  disabled={indexes.length === 0}
                >
                  Ninguna
                </button>
              </div>
            </div>
            <ul className="word-choice__list">
              {theme.words.map((word, index) => (
                <li key={index}>
                  <label className="word-option">
                    <input
                      type="checkbox"
                      className="word-option__check"
                      checked={indexes.includes(index)}
                      onChange={() => setIndexes((current) => toggleIndex(current, index))}
                    />
                    <span className="thumb word-option__thumb">
                      <ThemeImage src={word.image} pictoSize="80%" />
                    </span>
                    <span className="word-option__word">{word.word}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        )}

        <p
          id="word-dialog-summary"
          className={`word-dialog__summary${canPlay ? '' : ' word-dialog__summary--warning'}`}
        >
          {mode === 'random' ? pickerSummary(count, available) : choiceSummary(indexes.length, available)}
        </p>

        <div className="button-row dialog__actions">
          <button type="button" className="btn btn--secondary push" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="btn btn--primary push" onClick={confirm} disabled={!canPlay}>
            ¡A jugar!
          </button>
        </div>
      </div>
    </dialog>
  )
}
