// /api/hidden/<theme id> — hide a theme from the students (PUT) or show it again (DELETE); teacher only.
// Works for built-in themes ('frutas') as well as created ones (UUID). The list of hidden ids
// is public: it comes with GET /api/themes, and the student screens leave those themes out.
import { db } from '../../server/db.js'
import { error, lastSegment, noContent, unauthorized } from '../../server/http.js'
import { isTeacher } from '../../server/session.js'
import { hideableThemeKind } from '../../server/themes.js'

export async function PUT(request: Request): Promise<Response> {
  if (!isTeacher(request)) return unauthorized()
  const id = lastSegment(request)
  const kind = hideableThemeKind(id)
  if (!kind) return error(400, 'Invalid theme id')

  const sql = db()
  if (kind === 'created') {
    // Only an existing theme, inserted in the same statement so a deletion in between cannot leave a stray row.
    const rows = (await sql`
      insert into hidden_themes (theme_id)
      select ${id} where exists (select 1 from themes where id = ${id}::uuid)
      on conflict (theme_id) do nothing
      returning theme_id`) as unknown[]
    if (rows.length === 0) {
      const [{ hidden }] = (await sql`select count(*)::int as hidden from hidden_themes where theme_id = ${id}`) as {
        hidden: number
      }[]
      if (hidden === 0) return error(404, 'Unknown theme')
    }
  } else {
    await sql`insert into hidden_themes (theme_id) values (${id}) on conflict (theme_id) do nothing`
  }
  return noContent()
}

export async function DELETE(request: Request): Promise<Response> {
  if (!isTeacher(request)) return unauthorized()
  const id = lastSegment(request)
  if (!hideableThemeKind(id)) return error(400, 'Invalid theme id')

  await db()`delete from hidden_themes where theme_id = ${id}`
  return noContent()
}
