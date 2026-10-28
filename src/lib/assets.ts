/** Resolves an image of a theme: data/blob URLs pass through, asset paths get the site base. */
export function imageUrl(image: string): string {
  if (/^(data:|blob:|https?:)/.test(image)) return image
  return import.meta.env.BASE_URL + image.replace(/^\//, '')
}

/** Built-in pictos are SVG drawings shown whole (contain); imported photos fill their frame (cover). */
export function isPicto(image: string): boolean {
  return /\.svg$/i.test(image) || image.startsWith('data:image/svg')
}
