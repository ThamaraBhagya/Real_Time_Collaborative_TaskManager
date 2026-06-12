// src/components/auth/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function ProtectedRoute({ children }) {
    const user = useAuthStore(s => s.user)
    return user ? children : <Navigate to="/login" replace/>
}