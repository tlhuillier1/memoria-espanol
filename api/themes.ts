// /api/themes — every theme created by the teacher, in creation order, and the ids of the
// themes (built-in or created) she has hidden from the students (public).
import { db } from '../server/db.js'
import { json } from '../server/http.js'
import { toApiTheme, type ThemeRow } from '../server/themes.js'

export async function GET(): Promise<Response> {
  const sql = db()
  const [rows, hiddenRows] = (await sql.transaction([
    sql`select id, grade, name, words from themes order by created_at, id`,
    sql`select theme_id from hidden_themes order by hidden_at, theme_id`,
  ])) as unknown as [ThemeRow[], { theme_id: string }[]]
  return json({ themes: rows.map(toApiTheme), hidden: hiddenRows.map((r) => r.theme_id) })
}
