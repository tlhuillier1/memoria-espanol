// /api/images — upload one photo of a theme (teacher only). Body: the JPEG bytes.
import { db } from '../server/db.js'
import { error, json, unauthorized } from '../server/http.js'
import { MAX_IMAGE_BYTES, imageId, isJpeg } from '../server/images.js'
import { isTeacher } from '../server/session.js'
import { imagePath } from '../server/themes.js'

export async function POST(request: Request): Promise<Response> {
  if (!isTeacher(request)) return unauthorized()
  if (request.headers.get('Content-Type') !== 'image/jpeg') return error(415, 'JPEG expected')

  const bytes = new Uint8Array(await request.arrayBuffer())
  if (bytes.length > MAX_IMAGE_BYTES) return error(413, 'Image too large')
  if (!isJpeg(bytes)) return error(400, 'Not a JPEG image')

  // Same bytes, same id: uploading a photo twice stores it once.
  const id = imageId(bytes)
  await db()`
    insert into images (id, data) values (${id}, decode(${Buffer.from(bytes).toString('base64')}, 'base64'))
    on conflict (id) do nothing`
  return json({ image: imagePath(id) }, { status: 201 })
}
