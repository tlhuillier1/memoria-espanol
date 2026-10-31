// Small helpers shared by the API functions in api/ (Web Request / Response).

export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json; charset=utf-8')
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'no-store')
  return new Response(JSON.stringify(data), { ...init, headers })
}

export function noContent(headers?: HeadersInit): Response {
  return new Response(null, { status: 204, headers })
}

export function error(status: number, message: string): Response {
  return json({ error: message }, { status })
}

export const unauthorized = () => error(401, 'Teacher session required')

/** Parses a JSON body; null when the content type or the JSON is wrong. */
export async function readJson(request: Request): Promise<unknown> {
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) return null
  try {
    return await request.json()
  } catch {
    return null
  }
}

/** Last path segment, e.g. the id in /api/themes/<id>. */
export function lastSegment(request: Request): string {
  return decodeURIComponent(new URL(request.url).pathname.split('/').pop() ?? '')
}

/** Client address set by the Vercel proxy (not spoofable there); used to throttle logins. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0].trim() || 'unknown'
}

export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable ${name}`)
  return value
}
