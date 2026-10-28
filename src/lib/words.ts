const ARTICLE_RE = /^(el|la|los|las|un|una|unos|unas)\s+(.+)$/i

/** Splits "la manzana" into { article: "la", noun: "manzana" } for word cards (spec §4). */
export function splitArticle(text: string): { article: string; noun: string } {
  const trimmed = text.trim()
  const match = ARTICLE_RE.exec(trimmed)
  return match ? { article: match[1], noun: match[2] } : { article: '', noun: trimmed }
}
