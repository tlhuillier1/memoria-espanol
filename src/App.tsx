import { useLayoutEffect, useState } from 'react'
import { savedNotice } from './editor/draft'
import { EditorScreen } from './editor/EditorScreen'
import { GameScreen } from './game/GameScreen'
import { HomeScreen } from './home/HomeScreen'
import { themeStore } from './store'
import { loadGrade, saveGrade } from './store/gradePreference'
import { builtInThemes, mergeThemes } from './store/ThemeStore'
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
  const customThemes = useCustomThemes(themeStore)
  const themes = mergeThemes(builtInThemes, customThemes.themes)
  const modifiedIds = new Set(customThemes.themes.filter((t) => t.builtIn).map((t) => t.id))
  const goHome = () => setScreen({ name: 'home' })

  // Each screen starts at the top (the home page may have been scrolled down to « Crear un tema »).
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [screen])

  const changeGrade = (next: Grade) => {
    setGrade(next)
    saveGrade(next)
  }

  /** Back to the home screen on the theme's grade, with the status message (spec §2.5). */
  const saveTheme = async (theme: Theme) => {
    changeGrade(theme.grade)
    goHome()
    const persisted = await customThemes.save(theme)
    setNotice(savedNotice(theme, persisted))
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
          modifiedIds={modifiedIds}
          notice={notice}
          onGradeChange={changeGrade}
          onPlay={(theme, wordCount) => setScreen({ name: 'game', theme, wordCount })}
          onCreate={() => setScreen({ name: 'editor' })}
          onEdit={(theme) => setScreen({ name: 'editor', theme })}
          onRemove={(theme) => customThemes.remove(theme.id)}
          onDismissNotice={() => setNotice('')}
        />
      )
  }
}
