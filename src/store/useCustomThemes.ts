import { useCallback, useEffect, useState } from 'react'
import type { Theme } from '../types'
import type { ThemeStore } from './ThemeStore'

/**
 * Stored themes (custom themes and modified built-in ones) held in React state and mirrored to the store.
 * The UI updates first, so a theme stays usable for the session even if the store write fails (spec §5).
 */
export function useCustomThemes(store: ThemeStore) {
  const [themes, setThemes] = useState<Theme[]>([])

  useEffect(() => {
    let alive = true
    store
      .list()
      .then((list) => {
        if (alive) setThemes(list)
      })
      .catch(() => {
        // Storage unavailable (private mode, blocked site data): start with no custom themes.
      })
    return () => {
      alive = false
    }
  }, [store])

  /** Returns false when the theme could not be persisted. */
  const save = useCallback(
    async (theme: Theme): Promise<boolean> => {
      setThemes((list) => (list.some((t) => t.id === theme.id) ? list.map((t) => (t.id === theme.id ? theme : t)) : [...list, theme]))
      try {
        await store.save(theme)
        return true
      } catch {
        return false
      }
    },
    [store],
  )

  const remove = useCallback(
    async (id: string) => {
      setThemes((list) => list.filter((t) => t.id !== id))
      try {
        await store.remove(id)
      } catch {
        // Already gone from the screen; nothing more to do.
      }
    },
    [store],
  )

  return { themes, save, remove }
}
