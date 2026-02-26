const API_URL = 'http://localhost:3001'
const TOKEN_KEY = 'fintrack_token'
const USERS_KEY = 'fintrack_users'

// --- Token helpers ---
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// --- Local user storage ---
function getLocalUsers() {
  const stored = localStorage.getItem(USERS_KEY)
  if (!stored) {
    const defaultUsers = [
      { id: '1', name: 'Admin', email: 'admin@fintrack.com', password: 'admin123' },
    ]
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers))
    return defaultUsers
  }
  return JSON.parse(stored)
}

function saveLocalUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// --- Try server, fall back to localStorage ---
async function isServerAvailable() {
  try {
    const res = await fetch(`${API_URL}/api/me`, { signal: AbortSignal.timeout(1500) })
    return res.status !== 0
  } catch {
    return false
  }
}

export async function register(name, email, password) {
  // Try server first
  try {
    const res = await fetch(`${API_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
      signal: AbortSignal.timeout(3000),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Registration failed')
    setToken(data.token)
    return data.user
  } catch (err) {
    if (err.message && !err.message.includes('fetch')) throw err
  }

  // Fallback: localStorage
  const users = getLocalUsers()
  if (users.find((u) => u.email === email)) {
    throw new Error('An account with this email already exists')
  }
  const user = { id: crypto.randomUUID(), name, email, password }
  users.push(user)
  saveLocalUsers(users)
  setToken(btoa(JSON.stringify({ id: user.id })))
  return { id: user.id, name: user.name, email: user.email }
}

export async function login(email, password) {
  // Try server first
  try {
    const res = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(3000),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')
    setToken(data.token)
    return data.user
  } catch (err) {
    if (err.message && !err.message.includes('fetch')) throw err
  }

  // Fallback: localStorage
  const users = getLocalUsers()
  const user = users.find((u) => u.email === email)
  if (!user || user.password !== password) {
    throw new Error('Invalid email or password')
  }
  setToken(btoa(JSON.stringify({ id: user.id })))
  return { id: user.id, name: user.name, email: user.email }
}

export async function getUser() {
  const token = getToken()
  if (!token) return null

  // Try server first
  try {
    const res = await fetch(`${API_URL}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(2000),
    })
    if (res.ok) return res.json()
  } catch {
    // Server unavailable, try local
  }

  // Fallback: decode localStorage token
  try {
    const { id } = JSON.parse(atob(token))
    const users = getLocalUsers()
    const user = users.find((u) => u.id === id)
    if (user) return { id: user.id, name: user.name, email: user.email }
  } catch {
    // Invalid token
  }

  removeToken()
  return null
}

export async function updateProfile(data) {
  const token = getToken()

  // Try server first
  try {
    const res = await fetch(`${API_URL}/api/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(3000),
    })
    if (res.ok) {
      const result = await res.json()
      return result
    }
    const err = await res.json()
    throw new Error(err.error || 'Update failed')
  } catch (err) {
    if (err.message && !err.message.includes('fetch')) throw err
  }

  // Fallback: localStorage
  try {
    const { id } = JSON.parse(atob(token))
    const users = getLocalUsers()
    const idx = users.findIndex((u) => u.id === id)
    if (idx === -1) throw new Error('User not found')

    if (data.newPassword) {
      if (!data.currentPassword || users[idx].password !== data.currentPassword) {
        throw new Error('Current password is incorrect')
      }
      users[idx].password = data.newPassword
    }
    if (data.name) users[idx].name = data.name
    if (data.email) users[idx].email = data.email
    saveLocalUsers(users)
    return { id: users[idx].id, name: users[idx].name, email: users[idx].email }
  } catch (err) {
    throw err
  }
}

export function logout() {
  removeToken()
}
