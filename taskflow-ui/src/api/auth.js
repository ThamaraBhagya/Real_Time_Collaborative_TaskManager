// src/api/auth.js
import api from './axios'
export const login = (data) => api.post('/auth/login', data)
export const register = (data) => api.post('/auth/register', data)
export const logout = (refreshToken) => api.post('/auth/logout', { refreshToken })