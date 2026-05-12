import { auth } from '../firebase'

const BASE_URL = 'http://localhost:8080'

async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const user = auth.currentUser
  const token = user ? await user.getIdToken() : null

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (response.status === 401) {
    await auth.signOut()
    window.location.href = '/login'
  }

  return response
}

export const api = {
  get: (path: string) => authFetch(path),
  post: (path: string, body: unknown) =>
    authFetch(path, { method: 'POST', body: JSON.stringify(body) }),
}
