export function setToken(token) {
  localStorage.setItem('token', token)
}

export function getToken() {
  return localStorage.getItem('token')
}

export function clearToken() {
  localStorage.removeItem('token')
}

export function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

export function getCurrentUser() {
  const token = getToken()
  if (!token) return null
  return decodeToken(token)
}

// Demo-only: stands in for the real backend-issued JWT until auth is wired up.
export function createDemoToken(user) {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const payload = btoa(JSON.stringify(user))
  return `${header}.${payload}.demo`
}
