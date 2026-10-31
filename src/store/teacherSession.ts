import { ApiError, apiFetch, jsonBody } from './api'

/** Whether this browser holds a valid teacher session (HttpOnly cookie, checked by the server). */
export async function fetchTeacher(): Promise<boolean> {
  const response = await apiFetch('session')
  return ((await response.json()) as { teacher: boolean }).teacher
}

export type LoginResult = 'ok' | 'wrongPassword' | 'tooManyAttempts' | 'unreachable'

export async function login(password: string): Promise<LoginResult> {
  try {
    await apiFetch('session', { method: 'POST', ...jsonBody({ password }) })
    return 'ok'
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 0
    if (status === 401) return 'wrongPassword'
    if (status === 429) return 'tooManyAttempts'
    return 'unreachable'
  }
}

export async function logout(): Promise<void> {
  await apiFetch('session', { method: 'DELETE' })
}
