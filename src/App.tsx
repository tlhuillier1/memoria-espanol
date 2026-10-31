import { useEffect, useLayoutEffect, useState } from 'react'
import { SAVE_ERRORS, savedNotice } from './editor/draft'
import { EditorScreen } from './editor/EditorScreen'
import { GameScreen } from './game/GameScreen'
import { HomeScreen } from './home/HomeScreen'
import { themeStore } from './store'
import { ApiError } from './store/api'
import { loadGrade, saveGrade } from './store/gradePreference'
import { fetchTeacher, login, logout } from './store/teacherSession'
import { builtInThemes } from './store/ThemeStore'
import { useCustomThemes } from './store/useCustomThemes'
import type { Grade, Theme } from './types'

type Screen =
  | { name: 'home' }
  | { name: 'game'; theme: Theme; wordCount: number }
  | { name: 'editor'; theme?: Theme }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [grade, setGrade] = useState<Grade>(loadGrade)
  const [notice, setNotice] = useState('')
  const [teacher, setTeacher] = useState(false)
  const customThemes = useCustomThemes(themeStore)
  const themes = [...builtInThemes, ...customThemes.themes]
  const goHome = () => setScreen({ name: 'home' })

  useEffect(() => {
    fetchTeacher()
      .then(setTeacher)
      .catch(() => {
        // Server unreachable: stay in student mode.
      })
  }, [])

  // Each screen starts at the top (the home page may have been scrolled down to « Crear un tema »).
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [screen])

  const changeGrade = (next: Grade) => {
    setGrade(next)
    saveGrade(next)
  }

  /** A 401 means the teacher session is gone (expired, or the password was changed). */
  const sessionLost = (error: unknown) => {
    const lost = error instanceof ApiError && error.status === 401
    if (lost) setTeacher(false)
    return lost
  }

  /** Back to the home screen on the theme's grade, with the status message (spec §2.5); else an error for the form. */
  const saveTheme = async (theme: Theme): Promise<string | null> => {
    try {
      await customThemes.save(theme)
    } catch (error) {
      return sessionLost(error) ? SAVE_ERRORS.sessionExpired : SAVE_ERRORS.failed
    }
    changeGrade(theme.grade)
    goHome()
    setNotice(savedNotice(theme))
    return null
  }

  const deleteTheme = async (theme: Theme): Promise<boolean> => {
    try {
      await customThemes.remove(theme.id)
      return true
    } catch (error) {
      sessionLost(error)
      return false
    }
  }

  const logIn = async (password: string) => {
    const result = await login(password)
    if (result === 'ok') {
      setTeacher(true)
      setNotice('Modo profesora activado: puedes crear, modificar y eliminar temas.')
    }
    return result
  }

  const logOut = () => {
    setTeacher(false)
    setNotice('Has salido del modo profesora.')
    logout().catch(() => {
      // The cookie stays until it expires; the UI is already back in student mode.
    })
  }

  switch (screen.name) {
    case 'game':
      return <GameScreen theme={screen.theme} wordCount={screen.wordCount} onExit={goHome} />
    case 'editor':
      return <EditorScreen theme={screen.theme} grade={grade} onCancel={goHome} onSave={saveTheme} />
    case 'home':
      return (
        <HomeScreen
          grade={grade}
          themes={themes}
          loadStatus={customThemes.status}
          teacher={teacher}
          notice={notice}
          onGradeChange={changeGrade}
          onPlay={(theme, wordCount) => setScreen({ name: 'game', theme, wordCount })}
          onCreate={() => setScreen({ name: 'editor' })}
          onEdit={(theme) => setScreen({ name: 'editor', theme })}
          onDelete={deleteTheme}
          onLogin={logIn}
          onLogout={logOut}
          onDismissNotice={() => setNotice('')}
        />
      )
  }
}
