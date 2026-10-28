import { useState } from 'react'
import { EditorScreen } from './editor/EditorScreen'
import { GameScreen } from './game/GameScreen'
import { HomeScreen } from './home/HomeScreen'
import { themeStore } from './store'
import { loadGrade, saveGrade } from './store/gradePreference'
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
  const customThemes = useCustomThemes(themeStore)
  const themes = [...builtInThemes, ...customThemes.themes]
  const goHome = () => setScreen({ name: 'home' })

  const changeGrade = (next: Grade) => {
    setGrade(next)
    saveGrade(next)
  }

  switch (screen.name) {
    case 'game':
      return <GameScreen theme={screen.theme} wordCount={screen.wordCount} onExit={goHome} />
    case 'editor':
      return <EditorScreen theme={screen.theme} grade={grade} onExit={goHome} />
    case 'home':
      return (
        <HomeScreen
          grade={grade}
          themes={themes}
          notice={notice}
          onGradeChange={changeGrade}
          onPlay={(theme, wordCount) => setScreen({ name: 'game', theme, wordCount })}
          onCreate={() => setScreen({ name: 'editor' })}
          onEdit={(theme) => setScreen({ name: 'editor', theme })}
          onDelete={(theme) => customThemes.remove(theme.id)}
          onDismissNotice={() => setNotice('')}
        />
      )
  }
}
