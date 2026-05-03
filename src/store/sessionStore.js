import { create } from 'zustand'
import { api } from '../api/client'

export const useSessionStore = create((set, get) => ({
  sessions: [],
  activeSession: null,
  elapsedSeconds: 0,
  timerInterval: null,
  isLoading: false,
  error: null,

  fetchSessions: async () => {
    set({ isLoading: true, error: null })
    try {
      const active = await api.get('/api/sessions/active')
      const history = await api.get('/api/sessions/history')
      
      let currentInterval = get().timerInterval
      let elapsedSeconds = 0
      
      if (active) {
        // Calculate elapsed time from active.startedAt
        const startedAt = new Date(active.startedAt)
        elapsedSeconds = Math.floor((Date.now() - startedAt.getTime()) / 1000)
        
        if (!currentInterval && active.status === 'ACTIVE') {
          currentInterval = setInterval(() => {
            set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 }))
          }, 1000)
        }
      }

      set({
        sessions: history || [],
        activeSession: active || null,
        elapsedSeconds,
        timerInterval: currentInterval,
        isLoading: false
      })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  startSession: async (projectTag, language, notes, linkedTaskIds = []) => {
    try {
      const newSession = await api.post('/api/sessions/start', {
        projectTag, language, notes
      })
      
      const interval = setInterval(() => {
        set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 }))
      }, 1000)

      set({ activeSession: newSession, elapsedSeconds: 0, timerInterval: interval })
      return newSession
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  stopSession: async () => {
    const { activeSession, timerInterval, sessions } = get()
    if (!activeSession) return

    try {
      const endedSession = await api.post(`/api/sessions/${activeSession.id}/stop`)
      clearInterval(timerInterval)

      set({
        sessions: [endedSession, ...sessions],
        activeSession: null,
        elapsedSeconds: 0,
        timerInterval: null,
      })
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  pauseSession: async () => {
    const { activeSession, timerInterval } = get()
    if (!activeSession) return

    try {
      const pausedSession = await api.post(`/api/sessions/${activeSession.id}/pause`)
      clearInterval(timerInterval)
      
      set({
        activeSession: pausedSession,
        timerInterval: null,
      })
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  resumeSession: async () => {
    const { activeSession } = get()
    if (!activeSession || activeSession.status !== 'PAUSED') return

    try {
      const resumedSession = await api.post(`/api/sessions/${activeSession.id}/resume`)
      
      const interval = setInterval(() => {
        set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 }))
      }, 1000)

      set({
        activeSession: resumedSession,
        timerInterval: interval,
      })
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  loadMockSessions: () => {
    // Deprecated. We load real sessions now.
    get().fetchSessions()
  },
}))
