// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import BoardPage from './pages/BoardPage'
import ProtectedRoute from './components/auth/ProtectedRoute'

export default function App() {
  return (
      <BrowserRouter>
        <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
              }
            }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/register" element={<RegisterPage/>}/>
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage/></ProtectedRoute>
          }/>
          <Route path="/board/:boardId" element={
            <ProtectedRoute><BoardPage/></ProtectedRoute>
          }/>
          <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
        </Routes>
      </BrowserRouter>
  )
}