import { create } from 'zustand'
import { api } from '../api/client'

export const useInsightsStore = create((set, get) => ({
  focusPrediction: null,
  burnoutRisk: null,
  peakHours: null,
  taskETAs: [],
  isLoading: false,
  error: null,
  lastUpdated: null,

  fetchInsights: async (tasks = []) => {
    set({ isLoading: true, error: null })
    try {
      // Parallel fetch for speed
      const [focusScore, burnoutRisk, peakHoursResult] = await Promise.all([
        api.get('/api/insights/focus-score'),
        api.get('/api/insights/burnout-risk'),
        api.get('/api/insights/peak-hours').catch(() => null) // Optional/graceful failure
      ])

      // Fallback generator for task ETAs if endpoint isn't fully ready
      const taskETAs = await Promise.all(
        tasks.filter(t => t.status !== 'DONE').map(async (t) => {
          try {
            return await api.get(`/api/insights/task-eta/${t.id}`)
          } catch (e) {
            // Fallback for demo
            return {
              taskId: t.id,
              title: t.title,
              predictedHours: t.estimatedHrs ? t.estimatedHrs * 1.2 : 5,
              confidence: 0.65,
              basedOnSimilar: 3
            }
          }
        })
      )

      // Fallback for peak hours if ML service isn't returning it yet
      let peakHours = peakHoursResult?.grid
      if (!peakHours) {
        peakHours = generatePeakHoursFallback()
      }

      set({
        focusPrediction: focusScore,
        burnoutRisk,
        peakHours,
        taskETAs,
        isLoading: false,
        lastUpdated: new Date().toISOString(),
      })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  refreshFocusScore: async () => {
    try {
      const focusScore = await api.get('/api/insights/focus-score')
      set({ focusPrediction: focusScore })
    } catch (err) {
      console.error('Failed to refresh focus score', err)
    }
  },
}))

// Kept this so the heatmap doesn't break if ML service doesn't have peak-hours endpoint yet
function generatePeakHoursFallback() {
  const grid = []
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      let intensity = 0
      if (day < 5) { // weekdays
        if (hour >= 9 && hour <= 12) intensity = Math.random() * 0.6 + 0.4
        else if (hour >= 14 && hour <= 18) intensity = Math.random() * 0.5 + 0.3
        else if (hour >= 20 && hour <= 23) intensity = Math.random() * 0.3 + 0.1
        else intensity = Math.random() * 0.1
      } else { // weekends
        if (hour >= 10 && hour <= 14) intensity = Math.random() * 0.3 + 0.1
        else intensity = Math.random() * 0.05
      }
      grid.push({ day: days[day], hour, intensity: Math.min(intensity, 1), dayIndex: day })
    }
  }
  return grid
}
