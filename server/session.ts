// Teacher session: one shared password (TEACHER_PASSWORD), then a signed cookie.
// The cookie holds only an expiry date and its HMAC (SESSION_SECRET), so no session table is needed.
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { requireEnv } from './http.js'

export const COOKIE_NAME = 'memoria_teacher'
/** Sliding: every visit of the teacher renews it. */
export const SESSION_DAYS = 30
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000

const sign = (payload: string, secret: string) => createHmac('sha256', secret).update(payload).digest('base64url')

/** Changing the password also invalidates every open session. */
const signingKey = () => `${requireEnv('SESSION_SECRET')}:${requireEnv('TEACHER_PASSWORD')}`

export function createToken(now: number, secret: string): string {
  const expires = String(now + SESSION_MS)
  return `${expires}.${sign(expires, secret)}`
}

export function isValidToken(token: string | undefined, now: number, secret: string): boolean {
  if (!token) return false
  const [expires, signature] = token.split('.')
  if (!expires || !signature || !(Number(expires) > now)) return false
  return safeEqual(signature, sign(expires, secret))
}

/** Constant-time comparison of two strings of any length. */
export function safeEqual(a: string, b: string): boolean {
  const hash = (s: string) => createHash('sha256').update(s).digest()
  return timingSafeEqual(hash(a), hash(b))
}

export function readCookie(header: string | null, name: string): string | undefined {
  for (const part of header?.split(';') ?? []) {
    const [key, ...value] = part.trim().split('=')
    if (key === name) return value.join('=')
  }
  return undefined
}

export function isTeacher(request: Request): boolean {
  return isValidToken(readCookie(request.headers.get('Cookie'), COOKIE_NAME), Date.now(), signingKey())
}

export function checkPassword(password: string): boolean {
  return safeEqual(password, requireEnv('TEACHER_PASSWORD'))
}

/** HttpOnly (out of reach of scripts) and SameSite=Strict (no cross-site writes). */
export function sessionCookie(): string {
  const token = createToken(Date.now(), signingKey())
  return `${COOKIE_NAME}=${token}; Path=/; Max-Age=${SESSION_MS / 1000}; HttpOnly; Secure; SameSite=Strict`
}

export function clearedCookie(): string {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`
}
