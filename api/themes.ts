// /api/themes — every theme created by the teacher, in creation order (public).
import { db } from '../server/db.js'
import { json } from '../server/http.js'
import { toApiTheme, type ThemeRow } from '../server/themes.js'

export async function GET(): Promise<Response> {
  const rows = (await db()`select id, grade, name, words from themes order by created_at, id`) as ThemeRow[]
  return json({ themes: rows.map(toApiTheme) })
}
