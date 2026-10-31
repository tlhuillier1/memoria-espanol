import { createHash } from 'node:crypto'

/** The editor sends 360 px JPEGs of a few dozen KB (src/editor/readImage.ts); anything far bigger is refused. */
export const MAX_IMAGE_BYTES = 1024 * 1024

export const imageId = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')

/** JPEG files start with the SOI marker FF D8 FF. */
export function isJpeg(bytes: Uint8Array): boolean {
  return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
}
