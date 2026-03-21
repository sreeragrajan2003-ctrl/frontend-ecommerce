import axios from 'axios'

// Create one axios instance with our Django backend URL
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
})

// Before every request, check if a token exists in localStorage
// If yes, attach it to the Authorization header automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api