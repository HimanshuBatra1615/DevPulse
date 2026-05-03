import { create } from 'zustand'

const generateId = () => Math.random().toString(36).substr(2, 9)

export const useSessionStore = create((set, get) => ({
  sessions: [],
  activeSession: null,
  elapsedSeconds: 0,
  timerInterval: null,

  startSession: (projectTag, language, notes, linkedTaskIds = []) => {
    const session = {
      id: generateId(),
      projectTag,
      language,
      notes,
      startedAt: new Date().toISOString(),
      endedAt: null,
      durationMins: 0,
      status: 'ACTIVE',
      linkedTaskIds,
      events: [{ type: 'STARTED', at: new Date().toISOString() }],
      focusScore: null,
    }
    
    const interval = setInterval(() => {
      set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 }))
    }, 1000)

    set({ activeSession: session, elapsedSeconds: 0, timerInterval: interval })
  },

  stopSession: () => {
    const { activeSession, timerInterval, elapsedSeconds, sessions } = get()
    if (!activeSession) return

    clearInterval(timerInterval)
    const ended = {
      ...activeSession,
      endedAt: new Date().toISOString(),
      durationMins: Math.round(elapsedSeconds / 60),
      status: 'COMPLETED',
      focusScore: Math.floor(Math.random() * 40) + 60,
      events: [...activeSession.events, { type: 'STOPPED', at: new Date().toISOString() }],
    }

    set({
      sessions: [ended, ...sessions],
      activeSession: null,
      elapsedSeconds: 0,
      timerInterval: null,
    })
  },

  pauseSession: () => {
    const { activeSession, timerInterval } = get()
    if (!activeSession) return

    clearInterval(timerInterval)
    set((state) => ({
      activeSession: {
        ...state.activeSession,
        status: 'PAUSED',
        events: [...state.activeSession.events, { type: 'PAUSED', at: new Date().toISOString() }],
      },
      timerInterval: null,
    }))
  },

  resumeSession: () => {
    const { activeSession } = get()
    if (!activeSession || activeSession.status !== 'PAUSED') return

    const interval = setInterval(() => {
      set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 }))
    }, 1000)

    set((state) => ({
      activeSession: {
        ...state.activeSession,
        status: 'ACTIVE',
        events: [...state.activeSession.events, { type: 'RESUMED', at: new Date().toISOString() }],
      },
      timerInterval: interval,
    }))
  },

  loadMockSessions: () => {
    const languages = ['JavaScript', 'Python', 'Java', 'TypeScript', 'Go', 'Rust']
    const projects = ['DevPulse', 'ML Pipeline', 'API Gateway', 'Mobile App', 'Data Engine']
    const mockSessions = []

    for (let i = 0; i < 90; i++) {
      const daysAgo = Math.floor(Math.random() * 365)
      const date = new Date()
      date.setDate(date.getDate() - daysAgo)
      const hour = Math.floor(Math.random() * 14) + 8
      date.setHours(hour, Math.floor(Math.random() * 60))
      const duration = Math.floor(Math.random() * 180) + 15

      mockSessions.push({
        id: generateId(),
        projectTag: projects[Math.floor(Math.random() * projects.length)],
        language: languages[Math.floor(Math.random() * languages.length)],
        notes: '',
        startedAt: date.toISOString(),
        endedAt: new Date(date.getTime() + duration * 60000).toISOString(),
        durationMins: duration,
        status: 'COMPLETED',
        linkedTaskIds: [],
        focusScore: Math.floor(Math.random() * 40) + 55,
        events: [
          { type: 'STARTED', at: date.toISOString() },
          { type: 'STOPPED', at: new Date(date.getTime() + duration * 60000).toISOString() },
        ],
      })
    }

    mockSessions.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
    set({ sessions: mockSessions })
  },
}))
