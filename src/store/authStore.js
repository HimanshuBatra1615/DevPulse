import { create } from 'zustand'
import { api } from '../api/client'

// Load initial state from localStorage
const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
const storedToken = localStorage.getItem('token') || null

export const useAuthStore = create((set) => ({
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!storedToken,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.post('/api/auth/login', { email, password })
      localStorage.setItem('token', data.accessToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      set({ user: data.user, token: data.accessToken, isAuthenticated: true, isLoading: false })
      return { success: true }
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return { success: false, error: err.message }
    }
  },

  register: async (username, email, password) => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.post('/api/auth/register', { username, email, password })
      localStorage.setItem('token', data.accessToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      set({ user: data.user, token: data.accessToken, isAuthenticated: true, isLoading: false })
      return { success: true }
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return { success: false, error: err.message }
    }
  },

  loginWithGithub: () => {
    // GitHub OAuth flow would redirect here. For now, mock fallback or error.
    console.error("GitHub login not fully integrated with backend yet.")
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const user = await api.get('/api/auth/me')
      localStorage.setItem('user', JSON.stringify(user))
      set({ user, isAuthenticated: true })
    } catch (err) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      set({ user: null, token: null, isAuthenticated: false })
    }
  },

  updateUser: (updates) => {
    set((state) => {
      const newUser = { ...state.user, ...updates }
      localStorage.setItem('user', JSON.stringify(newUser))
      return { user: newUser }
    })
  },
}))
