// /api/themes/<uuid> — create or replace (PUT) and delete (DELETE) a theme; teacher only.
//
// Photos the theme stops using are deleted in the same statement, unless another theme uses them.
// In a statement with data-modifying CTEs every part sees the rows as they were before it, so
// "another theme" must explicitly exclude this one (`t.id <> id`).
import { deleteOrphanImages } from '../../server/cleanup.js'
import { db } from '../../server/db.js'
import { error, json, lastSegment, noContent, readJson, unauthorized } from '../../server/http.js'
import { isTeacher } from '../../server/session.js'
import { isThemeId, parseThemeInput, toApiTheme } from '../../server/themes.js'

export async function PUT(request: Request): Promise<Response> {
  if (!isTeacher(request)) return unauthorized()
  const id = lastSegment(request)
  if (!isThemeId(id)) return error(400, 'Invalid theme id')
  const theme = parseThemeInput(await readJson(request))
  if (!theme) return error(400, 'Invalid theme')

  const sql = db()
  const imageIds = [...new Set(theme.words.map((w) => w.imageId))]
  const [{ found }] = (await sql`select count(*)::int as found from images where id = any(${imageIds})`) as {
    found: number
  }[]
  if (found !== imageIds.length) return error(400, 'Unknown image')

  // A modified theme keeps its creation date, hence its place in the list.
  // Photos removed or replaced by this change go at once.
  await sql`
    with previous as (
      select words from themes where id = ${id}
    ), saved as (
      insert into themes (id, grade, name, words)
      values (${id}, ${theme.grade}, ${theme.name}, ${JSON.stringify(theme.words)}::jsonb)
      on conflict (id) do update
        set grade = excluded.grade, name = excluded.name, words = excluded.words, updated_at = now()
    )
    delete from images i
    using previous p, jsonb_array_elements(p.words) w
    where i.id = w ->> 'imageId'
      and i.id <> all(${imageIds})
      and not exists (
        select 1 from themes t, jsonb_array_elements(t.words) o
        where o ->> 'imageId' = i.id and t.id <> ${id}
      )`
  await deleteOrphanImages()
  return json(toApiTheme({ id, ...theme }))
}

export async function DELETE(request: Request): Promise<Response> {
  if (!isTeacher(request)) return unauthorized()
  const id = lastSegment(request)
  if (!isThemeId(id)) return error(400, 'Invalid theme id')

  // The theme and its photos go together.
  await db()`
    with removed as (
      delete from themes where id = ${id} returning words
    )
    delete from images i
    using removed r, jsonb_array_elements(r.words) w
    where i.id = w ->> 'imageId'
      and not exists (
        select 1 from themes t, jsonb_array_elements(t.words) o
        where o ->> 'imageId' = i.id and t.id <> ${id}
      )`
  await deleteOrphanImages()
  return noContent()
}
