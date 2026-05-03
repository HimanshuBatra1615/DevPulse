import { create } from 'zustand'
import { api } from '../api/client'

export const useTaskStore = create((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async (filters = {}) => {
    set({ isLoading: true, error: null })
    try {
      let url = '/api/tasks?'
      if (filters.status) url += `status=${filters.status}&`
      if (filters.priority) url += `priority=${filters.priority}&`
      
      const tasks = await api.get(url)
      set({ tasks: tasks || [], isLoading: false })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  addTask: async (taskData) => {
    try {
      const newTask = await api.post('/api/tasks', taskData)
      set((state) => ({ tasks: [...state.tasks, newTask] }))
      return newTask
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  updateTaskStatus: async (taskId, newStatus) => {
    try {
      const updatedTask = await api.patch(`/api/tasks/${taskId}/status`, { status: newStatus })
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
      }))
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  updateTask: async (taskId, updates) => {
    try {
      const updatedTask = await api.put(`/api/tasks/${taskId}`, updates)
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
      }))
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  deleteTask: async (taskId) => {
    try {
      await api.delete(`/api/tasks/${taskId}`)
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
      }))
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  moveTask: async (id, newStatus) => {
    // This maps exactly to updateTaskStatus
    return get().updateTaskStatus(id, newStatus)
  },

  getTasksByStatus: (status) => {
    return get().tasks.filter((t) => t.status === status)
  },

  getTasksByProject: (project) => {
    return get().tasks.filter((t) => t.projectTag === project)
  },
}))
