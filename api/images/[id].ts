// /api/images/<sha256> — one photo (public). Its URL changes with its content, so it is cached for a year
// by browsers and by the Vercel CDN: the database is read once per photo, not once per student.
import { db } from '../../server/db.js'
import { error, lastSegment } from '../../server/http.js'
import { isImageId } from '../../server/themes.js'

export async function GET(request: Request): Promise<Response> {
  const id = lastSegment(request)
  if (!isImageId(id)) return error(404, 'Not found')
  const rows = (await db()`select encode(data, 'base64') as data from images where id = ${id}`) as { data: string }[]
  if (rows.length === 0) return error(404, 'Not found')

  return new Response(Buffer.from(rows[0].data, 'base64'), {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
    },
  })
}
