import { describe, expect, it } from 'vitest'
import { createToken, isValidToken, readCookie, safeEqual } from './session.js'

describe('teacher session token', () => {
  const now = Date.UTC(2026, 9, 31)
  const day = 24 * 60 * 60 * 1000

  it('is valid for 30 days with the same secret', () => {
    const token = createToken(now, 'secret')
    expect(isValidToken(token, now + 29 * day, 'secret')).toBe(true)
    expect(isValidToken(token, now + 31 * day, 'secret')).toBe(false)
  })

  it('is refused with another secret or a forged expiry', () => {
    const token = createToken(now, 'secret')
    expect(isValidToken(token, now, 'other')).toBe(false)
    const [, signature] = token.split('.')
    expect(isValidToken(`${now + 365 * day}.${signature}`, now, 'secret')).toBe(false)
    expect(isValidToken('garbage', now, 'secret')).toBe(false)
    expect(isValidToken(undefined, now, 'secret')).toBe(false)
  })
})

describe('readCookie', () => {
  it('finds a cookie among others', () => {
    expect(readCookie('a=1; memoria_teacher=x.y=; b=2', 'memoria_teacher')).toBe('x.y=')
    expect(readCookie('a=1', 'memoria_teacher')).toBeUndefined()
    expect(readCookie(null, 'memoria_teacher')).toBeUndefined()
  })
})

describe('safeEqual', () => {
  it('compares strings of any length', () => {
    expect(safeEqual('abc', 'abc')).toBe(true)
    expect(safeEqual('abc', 'abcd')).toBe(false)
  })
})
