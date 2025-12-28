import axios from "axios"

const BASE_URL = import.meta.env.VITE_BASE_URL

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send refresh cookie
})

// Attach access token automatically
api.interceptors.request.use((config) => {
  const token = (window as any).__ACCESS_TOKEN__
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
