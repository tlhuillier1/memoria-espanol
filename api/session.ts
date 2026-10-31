// /api/session — teacher login (POST), status (GET), logout (DELETE).
import { db } from '../server/db.js'
import { clientIp, error, json, noContent, readJson } from '../server/http.js'
import { checkPassword, clearedCookie, isTeacher, sessionCookie } from '../server/session.js'

/** After this many wrong passwords from one address, wait LOCKOUT_MINUTES. */
const MAX_FAILURES = 10
const LOCKOUT_MINUTES = 15

export function GET(request: Request): Response {
  const teacher = isTeacher(request)
  // Renewing the cookie on each visit keeps an active teacher logged in.
  return json({ teacher }, { headers: teacher ? { 'Set-Cookie': sessionCookie() } : {} })
}

export async function POST(request: Request): Promise<Response> {
  const body = await readJson(request)
  const password = typeof body === 'object' && body !== null && 'password' in body ? body.password : undefined
  if (typeof password !== 'string') return error(400, 'Password required')

  const sql = db()
  const ip = clientIp(request)
  const [{ failures }] = (await sql`
    select count(*)::int as failures from login_failures
    where ip = ${ip} and at > now() - make_interval(mins => ${LOCKOUT_MINUTES})`) as { failures: number }[]
  if (failures >= MAX_FAILURES) return error(429, 'Too many attempts')

  if (!checkPassword(password)) {
    await sql.transaction([
      sql`insert into login_failures (ip) values (${ip})`,
      sql`delete from login_failures where at < now() - interval '1 day'`,
    ])
    return error(401, 'Wrong password')
  }

  await sql`delete from login_failures where ip = ${ip}`
  return noContent({ 'Set-Cookie': sessionCookie() })
}

export function DELETE(): Response {
  return noContent({ 'Set-Cookie': clearedCookie() })
}
