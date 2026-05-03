import { create } from 'zustand'

// Simulated ML predictions — in production these come from the FastAPI microservice
const generateFocusPrediction = () => {
  const hour = new Date().getHours()
  // Peak focus: 9-11am and 2-4pm
  let baseScore = 65
  if ((hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16)) baseScore = 82
  else if (hour >= 22 || hour <= 6) baseScore = 40
  else if (hour >= 17 && hour <= 19) baseScore = 55

  return {
    score: baseScore + Math.floor(Math.random() * 10) - 5,
    level: baseScore >= 75 ? 'HIGH' : baseScore >= 55 ? 'MEDIUM' : 'LOW',
    factors: [
      { name: 'Time of Day', impact: baseScore >= 75 ? 'positive' : 'negative', detail: `Current hour: ${hour}:00` },
      { name: 'Session Streak', impact: 'positive', detail: '3 sessions completed today' },
      { name: 'Break Pattern', impact: baseScore >= 55 ? 'positive' : 'negative', detail: 'Last break 45 min ago' },
    ],
    recommendation: baseScore >= 75
      ? 'You\'re in your peak focus zone! Tackle your most challenging task now.'
      : baseScore >= 55
      ? 'Moderate focus detected. Good for routine tasks and code reviews.'
      : 'Low focus period. Consider taking a break or doing light planning work.',
  }
}

const generateBurnoutRisk = () => {
  // Simulated based on rolling 7-day patterns
  const riskScore = Math.floor(Math.random() * 30) + 15 // 15-45 range for demo
  return {
    score: riskScore,
    level: riskScore >= 70 ? 'CRITICAL' : riskScore >= 50 ? 'HIGH' : riskScore >= 30 ? 'MODERATE' : 'LOW',
    trend: 'stable', // up, down, stable
    metrics: {
      weeklyHours: 32.5,
      avgSessionLength: 1.8,
      lateNightRatio: 0.12,
      weekendRatio: 0.08,
      taskCompletionRate: 0.78,
    },
    recommendations: [
      'Your coding hours are within a healthy range this week.',
      'Consider scheduling short breaks every 90 minutes.',
      'Your late-night coding ratio is low — great sleep habits!',
    ],
  }
}

const generatePeakHours = () => {
  const grid = []
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      let intensity = 0
      // Simulate realistic coding patterns
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

const generateTaskETAs = (tasks) => {
  return tasks
    .filter((t) => t.status !== 'DONE')
    .map((t) => ({
      taskId: t.id,
      title: t.title,
      predictedHours: t.estimatedHrs ? t.estimatedHrs * (0.8 + Math.random() * 0.4) : Math.random() * 8 + 2,
      confidence: Math.random() * 0.3 + 0.6,
      basedOnSimilar: Math.floor(Math.random() * 5) + 2,
    }))
}

export const useInsightsStore = create((set, get) => ({
  focusPrediction: null,
  burnoutRisk: null,
  peakHours: null,
  taskETAs: [],
  isLoading: false,
  lastUpdated: null,

  fetchInsights: (tasks = []) => {
    set({ isLoading: true })
    // Simulate API call delay
    setTimeout(() => {
      set({
        focusPrediction: generateFocusPrediction(),
        burnoutRisk: generateBurnoutRisk(),
        peakHours: generatePeakHours(),
        taskETAs: generateTaskETAs(tasks),
        isLoading: false,
        lastUpdated: new Date().toISOString(),
      })
    }, 800)
  },

  refreshFocusScore: () => {
    set({ focusPrediction: generateFocusPrediction() })
  },
}))
