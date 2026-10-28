/** Resolves an image of a theme: data/blob URLs pass through, asset paths get the site base. */
export function imageUrl(image: string): string {
  if (/^(data:|blob:|https?:)/.test(image)) return image
  return import.meta.env.BASE_URL + image.replace(/^\//, '')
}
