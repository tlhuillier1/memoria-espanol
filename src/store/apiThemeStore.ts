import type { Theme, ThemeWord } from '../types'
import { apiFetch, jsonBody } from './api'
import type { ThemeStore } from './ThemeStore'

/** Theme as sent by api/themes: photos are already URLs (api/images/<sha256>). */
type ApiTheme = Pick<Theme, 'id' | 'grade' | 'name' | 'words'>

const toTheme = (theme: ApiTheme): Theme => ({ ...theme, builtIn: false })

/** Sends a photo just imported in the editor (data URL) and returns its stored URL. */
async function uploadImage(dataUrl: string): Promise<string> {
  const blob = await (await fetch(dataUrl)).blob()
  const response = await apiFetch('images', { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body: blob })
  return ((await response.json()) as { image: string }).image
}

const storedWord = async (word: ThemeWord): Promise<ThemeWord> =>
  word.image.startsWith('data:') ? { ...word, image: await uploadImage(word.image) } : word

/** Themes in the Neon database, through the functions of api/. Reading is public; writing needs the teacher session. */
export function createApiThemeStore(): ThemeStore {
  const list = async () => {
    const response = await apiFetch('themes')
    return ((await response.json()) as { themes: ApiTheme[] }).themes.map(toTheme)
  }
  return {
    list,
    get: async (id) => (await list()).find((t) => t.id === id),
    save: async (theme) => {
      const words = await Promise.all(theme.words.map(storedWord))
      const body = { grade: theme.grade, name: theme.name, words }
      const response = await apiFetch(`themes/${theme.id}`, { method: 'PUT', ...jsonBody(body) })
      return toTheme((await response.json()) as ApiTheme)
    },
    remove: async (id) => {
      await apiFetch(`themes/${id}`, { method: 'DELETE' })
    },
  }
}
