/** A failed call to the site's API; status 0 when the server could not be reached. */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`API request failed (${status})`)
    this.status = status
  }
}

/** Calls api/<path> next to the site (relative, like every URL of the app). */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  let response: Response
  try {
    response = await fetch(`${import.meta.env.BASE_URL}api/${path}`, { credentials: 'same-origin', ...init })
  } catch {
    throw new ApiError(0)
  }
  if (!response.ok) throw new ApiError(response.status)
  return response
}

export const jsonBody = (data: unknown): RequestInit => ({
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
})
