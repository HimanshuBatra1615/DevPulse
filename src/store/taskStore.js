import { create } from 'zustand'

const generateId = () => Math.random().toString(36).substr(2, 9)

const initialTasks = [
  { id: generateId(), title: 'Set up JWT authentication', description: 'Implement JWT token generation and validation with refresh token rotation', status: 'DONE', priority: 1, complexity: 'HIGH', deadline: '2026-04-28T23:59:00Z', estimatedHrs: 8, actualHrs: 6.5, projectTag: 'DevPulse', createdAt: '2026-04-20T10:00:00Z' },
  { id: generateId(), title: 'Build session tracking API', description: 'Event-sourced session CRUD with start/stop/pause/resume', status: 'DONE', priority: 1, complexity: 'HIGH', deadline: '2026-04-30T23:59:00Z', estimatedHrs: 12, actualHrs: 10, projectTag: 'DevPulse', createdAt: '2026-04-21T10:00:00Z' },
  { id: generateId(), title: 'WebSocket real-time timer', description: 'STOMP WebSocket for live session timer broadcast', status: 'IN_PROGRESS', priority: 2, complexity: 'MEDIUM', deadline: '2026-05-05T23:59:00Z', estimatedHrs: 6, actualHrs: null, projectTag: 'DevPulse', createdAt: '2026-04-25T10:00:00Z' },
  { id: generateId(), title: 'Redis caching layer', description: 'Cache dashboard stats with TTL and invalidation on session changes', status: 'IN_PROGRESS', priority: 2, complexity: 'MEDIUM', deadline: '2026-05-06T23:59:00Z', estimatedHrs: 5, actualHrs: null, projectTag: 'DevPulse', createdAt: '2026-04-26T10:00:00Z' },
  { id: generateId(), title: 'Focus score ML model', description: 'Train logistic regression on session features to predict focus quality', status: 'TODO', priority: 2, complexity: 'HIGH', deadline: '2026-05-10T23:59:00Z', estimatedHrs: 10, actualHrs: null, projectTag: 'ML Pipeline', createdAt: '2026-04-28T10:00:00Z' },
  { id: generateId(), title: 'Burnout detection service', description: 'Rolling 7-day window analysis with rule-based + RF classifier', status: 'TODO', priority: 3, complexity: 'HIGH', deadline: '2026-05-12T23:59:00Z', estimatedHrs: 8, actualHrs: null, projectTag: 'ML Pipeline', createdAt: '2026-04-28T10:00:00Z' },
  { id: generateId(), title: 'React analytics dashboard', description: 'Line charts, bar charts, heatmap with Recharts', status: 'TODO', priority: 2, complexity: 'MEDIUM', deadline: '2026-05-08T23:59:00Z', estimatedHrs: 8, actualHrs: null, projectTag: 'DevPulse', createdAt: '2026-04-29T10:00:00Z' },
  { id: generateId(), title: 'Docker Compose setup', description: 'Multi-service compose with PostgreSQL, Redis, backend, ML, frontend', status: 'TODO', priority: 3, complexity: 'LOW', deadline: '2026-05-15T23:59:00Z', estimatedHrs: 3, actualHrs: null, projectTag: 'DevPulse', createdAt: '2026-04-30T10:00:00Z' },
  { id: generateId(), title: 'API rate limiting', description: 'Implement token bucket rate limiter with Redis', status: 'TODO', priority: 4, complexity: 'MEDIUM', deadline: '2026-05-18T23:59:00Z', estimatedHrs: 4, actualHrs: null, projectTag: 'API Gateway', createdAt: '2026-05-01T10:00:00Z' },
  { id: generateId(), title: 'Write integration tests', description: 'Spring Boot integration tests with TestContainers', status: 'TODO', priority: 3, complexity: 'MEDIUM', deadline: '2026-05-20T23:59:00Z', estimatedHrs: 6, actualHrs: null, projectTag: 'DevPulse', createdAt: '2026-05-01T10:00:00Z' },
]

export const useTaskStore = create((set, get) => ({
  tasks: initialTasks,

  addTask: (task) => {
    const newTask = {
      id: generateId(),
      ...task,
      status: task.status || 'TODO',
      priority: task.priority || 3,
      complexity: task.complexity || 'MEDIUM',
      createdAt: new Date().toISOString(),
      actualHrs: null,
    }
    set((state) => ({ tasks: [...state.tasks, newTask] }))
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }))
  },

  deleteTask: (id) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
  },

  moveTask: (id, newStatus) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
    }))
  },

  getTasksByStatus: (status) => {
    return get().tasks.filter((t) => t.status === status)
  },

  getTasksByProject: (project) => {
    return get().tasks.filter((t) => t.projectTag === project)
  },
}))
