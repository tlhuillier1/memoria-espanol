import { useCallback, useEffect, useState } from 'react'
import type { Theme } from '../types'
import type { ThemeStore } from './ThemeStore'

export type LoadStatus = 'loading' | 'ready' | 'error'

/**
 * Themes created by the teacher, loaded from the store.
 * Writes go to the store first: the list only changes once the database has the change.
 */
export function useCustomThemes(store: ThemeStore) {
  const [themes, setThemes] = useState<Theme[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')

  useEffect(() => {
    let alive = true
    store
      .list()
      .then((list) => {
        if (!alive) return
        setThemes(list)
        setStatus('ready')
      })
      .catch(() => {
        // Offline or server down: the built-in themes stay playable.
        if (alive) setStatus('error')
      })
    return () => {
      alive = false
    }
  }, [store])

  /** Rejects with an ApiError when the theme could not be saved. */
  const save = useCallback(
    async (theme: Theme): Promise<Theme> => {
      const saved = await store.save(theme)
      setThemes((list) => (list.some((t) => t.id === saved.id) ? list.map((t) => (t.id === saved.id ? saved : t)) : [...list, saved]))
      return saved
    },
    [store],
  )

  /** Rejects with an ApiError when the theme could not be deleted. */
  const remove = useCallback(
    async (id: string) => {
      await store.remove(id)
      setThemes((list) => list.filter((t) => t.id !== id))
    },
    [store],
  )

  return { themes, status, save, remove }
}
