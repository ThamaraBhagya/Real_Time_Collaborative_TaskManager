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


        if (err.response?.status === 401 && !original._retry) {
            original._retry = true

            try {
                const refresh = localStorage.getItem('refreshToken')
                if (!refresh) throw new Error('No refresh token')

                const { data } = await axios.post('/api/auth/refresh', { refreshToken: refresh })

                localStorage.setItem('accessToken', data.accessToken)
                original.headers.Authorization = `Bearer ${data.accessToken}`

                return api(original)
            } catch {

                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                useAuthStore.getState().clearAuth()
                window.location.href = '/login'
            }
        }
        return Promise.reject(err)
    }
)

export default api