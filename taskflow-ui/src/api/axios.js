// src/api/axios.js
import axios from 'axios'
import { useAuthStore } from '../store/authStore' // 🟢 ADDED IMPORT

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

api.interceptors.response.use(
    res => res,
    async err => {
        const original = err.config

        // Error eka 401 Unauthorized nam saha kalin try karala nathnam vitharai
        if (err.response?.status === 401 && !original._retry) {
            original._retry = true

            try {
                const refresh = localStorage.getItem('refreshToken')
                if (!refresh) throw new Error('No refresh token') // Refresh token ekath nathnam kelinma catch ekata yawanawa

                const { data } = await axios.post('/api/auth/refresh', { refreshToken: refresh })

                localStorage.setItem('accessToken', data.accessToken)
                original.headers.Authorization = `Bearer ${data.accessToken}`

                return api(original) // Failed wunu request eka aayeth yawanawa
            } catch {
                // 🟢 THE FIX: State ekai LocalStorage ekai dekam clear karanawa
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                useAuthStore.getState().clearAuth() // Zustand store eka clear karanawa
                window.location.href = '/login'
            }
        }
        return Promise.reject(err)
    }
)

export default api