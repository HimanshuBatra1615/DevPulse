import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (email, password) => {
    // Mock login — in production this calls the Spring Boot API
    const mockUser = {
      id: 1,
      username: 'himanshu',
      email: email || 'himanshu@devpulse.io',
      avatarUrl: null,
      role: 'USER',
      createdAt: '2024-01-15T10:00:00Z',
    }
    set({ user: mockUser, token: 'mock-jwt-token', isAuthenticated: true })
  },

  loginWithGithub: () => {
    const mockUser = {
      id: 1,
      username: 'himanshu-dev',
      email: 'himanshu@github.com',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
      role: 'USER',
      githubId: '12345',
      createdAt: '2024-01-15T10:00:00Z',
    }
    set({ user: mockUser, token: 'mock-github-jwt', isAuthenticated: true })
  },

  logout: () => {
    set({ user: null, token: null, isAuthenticated: false })
  },

  updateUser: (updates) => {
    set((state) => ({ user: { ...state.user, ...updates } }))
  },
}))
