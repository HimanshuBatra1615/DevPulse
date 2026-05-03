// API Client wrapper for fetch to automatically handle JSON and Authorization
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    // Setup headers
    const headers = new Headers(options.headers || {})
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json')
    }

    // Attach JWT if available
    const token = localStorage.getItem('token')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    const config = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)
      
      // Handle unauthorized (token expired, etc.)
      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        throw new Error('Unauthorized')
      }

      // Handle empty responses
      if (response.status === 204) return null

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'API Request Failed')
      }

      return data
    } catch (err) {
      console.error(`[API Error] ${endpoint}:`, err)
      throw err
    }
  }

  get(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'GET' })
  }

  post(endpoint, body, options) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  put(endpoint, body, options) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  patch(endpoint, body, options) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  }

  delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  }
}

export const api = new ApiClient(BASE_URL)
