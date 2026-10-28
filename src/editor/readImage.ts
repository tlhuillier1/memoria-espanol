// Photo import — spec §4: max 360 px on the longest side, white background, JPEG quality 0.82.

export const MAX_IMAGE_SIDE = 360
const JPEG_QUALITY = 0.82

/** Scales (width, height) down to fit within `max` on the longest side; never scales up. */
export function fitWithin(width: number, height: number, max = MAX_IMAGE_SIDE): { width: number; height: number } {
  const ratio = Math.min(1, max / Math.max(width, height))
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  }
}

/** Loads an image with onload/onerror: `img.decode()` can stay pending while the page isn't rendering. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Unreadable image'))
    img.src = src
  })
}

/** Decodes an image file and returns a resized JPEG data URL. Rejects if the browser cannot read it. */
export async function readImage(file: File): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    const { width, height } = fitWithin(img.naturalWidth, img.naturalHeight)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D unavailable')
    // White background so transparent PNGs don't turn black in JPEG.
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
  } finally {
    URL.revokeObjectURL(url)
  }
}
