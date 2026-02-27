import { supabase } from './supabase'

const TOKEN_KEY = 'fintrack_token'
const USERS_KEY = 'fintrack_users'

// --- Token helpers (used by localStorage fallback only) ---
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// --- Local user storage (fallback when Supabase unavailable) ---
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

// --- Auth functions: Supabase first, localStorage fallback ---

export async function register(name, email, password) {
  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw new Error(error.message)
    const user = data.user
    return { id: user.id, name: user.user_metadata.name, email: user.email }
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
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    const user = data.user
    return { id: user.id, name: user.user_metadata.name, email: user.email }
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
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      return { id: user.id, name: user.user_metadata.name, email: user.email }
    }
    return null
  }

  // Fallback: localStorage
  const token = getToken()
  if (!token) return null
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
  if (supabase) {
    const updates = {}
    if (data.name) updates.data = { name: data.name }
    if (data.email) updates.email = data.email

    if (data.name || data.email) {
      const { error } = await supabase.auth.updateUser(updates)
      if (error) throw new Error(error.message)
    }

    if (data.newPassword) {
      const { error } = await supabase.auth.updateUser({ password: data.newPassword })
      if (error) throw new Error(error.message)
    }

    const { data: { user } } = await supabase.auth.getUser()
    return { id: user.id, name: user.user_metadata.name, email: user.email }
  }

  // Fallback: localStorage
  const token = getToken()
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

export async function logout() {
  if (supabase) {
    await supabase.auth.signOut()
  }
  removeToken()
}
