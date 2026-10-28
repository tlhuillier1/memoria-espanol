import { describe, expect, it } from 'vitest'
import { splitArticle } from './words'

describe('splitArticle', () => {
  it('splits a known article from the noun', () => {
    expect(splitArticle('la manzana')).toEqual({ article: 'la', noun: 'manzana' })
    expect(splitArticle('los zapatos rojos')).toEqual({ article: 'los', noun: 'zapatos rojos' })
  })

  it('is case-insensitive and trims spaces', () => {
    expect(splitArticle('  Unas tijeras ')).toEqual({ article: 'Unas', noun: 'tijeras' })
  })

  it('keeps the whole text as the noun without a known article', () => {
    expect(splitArticle('lápiz')).toEqual({ article: '', noun: 'lápiz' })
    expect(splitArticle('lavar')).toEqual({ article: '', noun: 'lavar' })
  })
})
