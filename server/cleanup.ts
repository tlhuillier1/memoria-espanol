import { db } from './db.js'

/**
 * Deletes uploads that never made it into a theme (save interrupted, network cut…).
 * Photos of a deleted or modified theme are removed at once by api/themes/[id].ts; this
 * sweep only catches the rest. The one-hour grace keeps photos just uploaded for a theme
 * that is being saved: between the upload and the PUT, they belong to no theme yet.
 */
export async function deleteOrphanImages(): Promise<void> {
  await db()`
    delete from images i
    where i.created_at < now() - interval '1 hour'
      and not exists (
        select 1 from themes t, jsonb_array_elements(t.words) w
        where w ->> 'imageId' = i.id
      )`
}
