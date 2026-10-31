import { useEffect, useRef, useState, type FormEvent, type MouseEvent, type SyntheticEvent } from 'react'
import type { LoginResult } from '../store/teacherSession'

const LOGIN_ERRORS: Record<Exclude<LoginResult, 'ok'>, string> = {
  wrongPassword: 'Contraseña incorrecta.',
  tooManyAttempts: 'Demasiados intentos. Espera 15 minutos y vuelve a intentarlo.',
  unreachable: 'No se ha podido conectar. Comprueba la conexión e inténtalo de nuevo.',
}

interface LoginDialogProps {
  onCancel: () => void
  /** Resolves with the outcome; the dialog closes itself only through onCancel or the parent on success. */
  onLogin: (password: string) => Promise<LoginResult>
}

/** Teacher password prompt, on the native modal <dialog> like the word-count dialog. */
export function LoginDialog({ onCancel, onLogin }: LoginDialogProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const opener = useRef(document.activeElement as HTMLElement | null)

  useEffect(() => {
    const dialog = dialogRef.current
    const returnFocusTo = opener.current
    if (!dialog) return
    dialog.showModal()
    inputRef.current?.focus()
    return () => {
      dialog.close()
      returnFocusTo?.focus()
    }
  }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!password || busy) return
    setBusy(true)
    const result = await onLogin(password)
    if (result === 'ok') return // the parent unmounts the dialog
    setBusy(false)
    setError(LOGIN_ERRORS[result])
    inputRef.current?.select()
  }

  const handleCancelEvent = (event: SyntheticEvent) => {
    event.preventDefault() // Escape: let React unmount the dialog
    onCancel()
  }

  const handleBackdropClick = (event: MouseEvent) => {
    if (event.target === dialogRef.current) onCancel()
  }

  return (
    <dialog
      ref={dialogRef}
      className="dialog login-dialog"
      aria-labelledby="login-dialog-title"
      onCancel={handleCancelEvent}
      onClick={handleBackdropClick}
    >
      <form className="dialog__box" onSubmit={submit} noValidate>
        <div className="dialog__heading">
          <h2 id="login-dialog-title">Acceso profesora</h2>
        </div>

        <div className="field">
          <label htmlFor="teacher-password" className="field__label">
            Contraseña
          </label>
          <input
            ref={inputRef}
            id="teacher-password"
            className="text-input"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
            autoComplete="current-password"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'login-error' : undefined}
          />
        </div>

        {error && (
          <p id="login-error" role="alert" className="error-banner">
            {error}
          </p>
        )}

        <div className="button-row dialog__actions">
          <button type="button" className="btn btn--secondary push" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary push" disabled={!password || busy}>
            Entrar
          </button>
        </div>
      </form>
    </dialog>
  )
}
