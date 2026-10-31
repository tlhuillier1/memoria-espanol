import { db } from './db.js'

/**
 * Deletes photos no theme uses any more (replaced, or their theme deleted).
 * The one-hour grace keeps photos just uploaded for a theme that is being saved.
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
