// Validation of a theme sent by the editor, and its conversion to / from the database row.
// The client checks the same rules first (src/editor/draft.ts); these guard the database.

export const GRADES = ['5e', '4e', '3e'] as const
export type Grade = (typeof GRADES)[number]

export const MIN_WORDS = 2
export const MAX_WORDS = 100
export const MAX_NAME_LENGTH = 80
export const MAX_WORD_LENGTH = 60

const IMAGE_ID = /^[0-9a-f]{64}$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** URL of a stored photo, relative to the site root (resolved by imageUrl() on the client). */
export const imagePath = (imageId: string) => `api/images/${imageId}`

export interface ThemeInput {
  grade: Grade
  name: string
  words: { word: string; imageId: string }[]
}

export interface ThemeRow extends ThemeInput {
  id: string
}

/** Shape returned to the client; matches the fields of src/types.ts Theme it needs. */
export interface ApiTheme {
  id: string
  grade: Grade
  name: string
  words: { word: string; image: string }[]
}

export const isThemeId = (id: string) => UUID.test(id)
export const isImageId = (id: string) => IMAGE_ID.test(id)

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

/** Accepts `{ grade, name, words: [{ word, image: "api/images/<sha256>" }] }`; null when invalid. */
export function parseThemeInput(body: unknown): ThemeInput | null {
  if (!isObject(body)) return null
  const { grade, name, words } = body
  if (!GRADES.includes(grade as Grade)) return null
  if (typeof name !== 'string') return null
  const trimmedName = name.trim()
  if (!trimmedName || trimmedName.length > MAX_NAME_LENGTH) return null
  if (!Array.isArray(words) || words.length < MIN_WORDS || words.length > MAX_WORDS) return null

  const parsed: ThemeInput['words'] = []
  for (const entry of words) {
    if (!isObject(entry) || typeof entry.word !== 'string' || typeof entry.image !== 'string') return null
    const word = entry.word.trim()
    const imageId = entry.image.replace(/^\.?\/?api\/images\//, '')
    if (!word || word.length > MAX_WORD_LENGTH || !isImageId(imageId)) return null
    parsed.push({ word, imageId })
  }
  return { grade: grade as Grade, name: trimmedName, words: parsed }
}

export function toApiTheme(row: ThemeRow): ApiTheme {
  return {
    id: row.id,
    grade: row.grade,
    name: row.name,
    words: row.words.map((w) => ({ word: w.word, image: imagePath(w.imageId) })),
  }
}
