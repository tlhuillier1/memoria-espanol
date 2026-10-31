import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { BackButton } from '../components/BackButton'
import { GradePicker } from '../components/GradePicker'
import { Icon } from '../components/Icon'
import { ThemeImage } from '../components/ThemeImage'
import type { Grade, Theme } from '../types'
import {
  FORM_ERRORS,
  MIN_ROWS,
  draftFromTheme,
  emptyDraft,
  emptyRow,
  readyCount,
  validateDraft,
  type Draft,
  type DraftRow,
} from './draft'
import { readImage } from './readImage'
import './editor.css'

interface EditorScreenProps {
  /** Theme to modify; absent when creating a new one. */
  theme?: Theme
  /** Preselected grade for a new theme (the active one on the home screen). */
  grade: Grade
  onCancel: () => void
  /** Saves to the database; resolves with an error message when it failed (the form then stays open). */
  onSave: (theme: Theme) => Promise<string | null>
}

/** Create / modify a custom theme — spec §2.5. */
export function EditorScreen({ theme, grade, onCancel, onSave }: EditorScreenProps) {
  const [draft, setDraft] = useState<Draft>(() => (theme ? draftFromTheme(theme) : emptyDraft(grade)))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const addButtonRef = useRef<HTMLButtonElement>(null)
  const wordInputs = useRef(new Map<string, HTMLInputElement>())
  // Row whose word field should get focus after the next render (added row, or neighbour of a removed one).
  const pendingFocus = useRef<string | null>(null)
  const ready = readyCount(draft.rows)

  useEffect(() => nameRef.current?.focus(), [])

  useEffect(() => {
    const key = pendingFocus.current
    if (key === null) return
    pendingFocus.current = null
    const input = wordInputs.current.get(key)
    if (input) input.focus()
    else addButtonRef.current?.focus()
  })

  /** Every change to the form clears the error message (spec §5). */
  const change = (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }))
    setError('')
  }

  const updateRow = (key: string, patch: Partial<DraftRow>) => {
    setDraft((d) => ({ ...d, rows: d.rows.map((r) => (r.key === key ? { ...r, ...patch } : r)) }))
    setError('')
  }

  const addRow = () => {
    const row = emptyRow()
    change({ rows: [...draft.rows, row] })
    pendingFocus.current = row.key
  }

  const removeRow = (index: number) => {
    const rows = draft.rows.filter((_, i) => i !== index)
    change({ rows })
    // Focus the row that took its place, else the previous one, else « Añadir una palabra ».
    pendingFocus.current = (rows[index] ?? rows[index - 1])?.key ?? ''
  }

  const pickPhoto = (key: string, event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target
    const file = input.files?.[0]
    input.value = '' // allow choosing the same file again
    if (!file) return
    readImage(file)
      .then((image) => updateRow(key, { image }))
      .catch(() => setError(FORM_ERRORS.unreadableImage))
  }

  const save = async () => {
    if (saving) return
    const result = validateDraft(draft)
    if (!result.ok) return setError(result.error)
    setSaving(true)
    // On success the app leaves this screen; on failure the draft stays as it is.
    const saveError = await onSave(result.theme)
    if (saveError) {
      setSaving(false)
      setError(saveError)
    }
  }

  return (
    <main className="container screen editor">
      <div className="editor__header">
        <BackButton onClick={onCancel} />
        <h1 className="screen-title">{theme ? 'Modificar el tema' : 'Crear un tema'}</h1>
      </div>

      <form
        className="editor__panel"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
      >
        <div className="editor__top">
          <div className="field editor__name">
            <label htmlFor="theme-name" className="field__label">
              Nombre del tema
            </label>
            <input
              ref={nameRef}
              id="theme-name"
              className="text-input text-input--large"
              type="text"
              value={draft.name}
              onChange={(e) => change({ name: e.target.value })}
              placeholder="Ej.: La ropa"
              autoComplete="off"
            />
          </div>
          <div className="field" role="group" aria-labelledby="theme-grade">
            <span id="theme-grade" className="field__label">
              Clase
            </span>
            <GradePicker size="small" value={draft.grade} onChange={(g) => change({ grade: g })} />
          </div>
        </div>

        <div className="editor__words-head">
          <div className="editor__words-title">
            <h2 className="field__label">Palabras e imágenes</h2>
            <span className={`editor__ready${ready >= MIN_ROWS ? ' is-valid' : ''}`}>
              {ready === 1 ? '1 lista' : `${ready} listas`} · mínimo {MIN_ROWS}
            </span>
          </div>
          <p className="editor__help">
            Escribe cada palabra con su artículo (el, la, los, las). Puedes añadir tantas palabras como quieras: al jugar, se
            elige cuántas y el juego las sortea.
          </p>
        </div>

        <ol className="word-rows">
          {draft.rows.map((row, index) => {
            const number = index + 1
            const inputId = `word-${row.key}`
            return (
              <li key={row.key} className="word-row">
                <label className="photo-slot">
                  <input
                    type="file"
                    accept="image/*"
                    className="visually-hidden"
                    onChange={(e) => pickPhoto(row.key, e)}
                  />
                  <span className="visually-hidden">
                    {row.image ? `Cambiar la foto de la palabra ${number}` : `Añadir una foto para la palabra ${number}`}
                  </span>
                  {row.image ? (
                    <ThemeImage src={row.image} pictoSize="100%" />
                  ) : (
                    <span className="photo-slot__empty" aria-hidden="true">
                      <Icon name="image" size={28} strokeWidth={2} />
                      Añadir foto
                    </span>
                  )}
                </label>
                <div className="field word-row__field">
                  <label htmlFor={inputId} className="field__label field__label--small">
                    Palabra {number}
                  </label>
                  <input
                    ref={(el) => {
                      if (el) wordInputs.current.set(row.key, el)
                      else wordInputs.current.delete(row.key)
                    }}
                    id={inputId}
                    className="text-input"
                    type="text"
                    value={row.word}
                    onChange={(e) => updateRow(row.key, { word: e.target.value })}
                    placeholder="el perro"
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    lang="es"
                  />
                </div>
                <button
                  type="button"
                  className="word-row__remove"
                  onClick={() => removeRow(index)}
                  aria-label={`Quitar la palabra ${number}`}
                >
                  <Icon name="trash" size={22} />
                </button>
              </li>
            )
          })}
        </ol>

        <button type="button" ref={addButtonRef} className="add-row" onClick={addRow}>
          <Icon name="plus" size={20} strokeWidth={2.6} />
          Añadir una palabra
        </button>

        {error && (
          <p role="alert" className="error-banner">
            {error}
          </p>
        )}

        <div className="button-row editor__actions">
          <button type="button" className="btn btn--secondary push" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary push" disabled={saving} aria-busy={saving}>
            {saving ? 'Guardando…' : 'Guardar el tema'}
          </button>
        </div>
      </form>
    </main>
  )
}
