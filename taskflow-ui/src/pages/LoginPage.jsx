// src/pages/LoginPage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const setAuth = useAuthStore(s => s.setAuth)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data } = await login(form)
            setAuth(
                { id: data.userId, email: data.email, username: data.username },
                data.accessToken,
                data.refreshToken
            )
            navigate('/dashboard')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center" style={{background:'var(--bg-primary)'}}>
            <div style={{background:'var(--bg-secondary)',border:'1px solid var(--border)'}}
                 className="w-full max-w-md p-8 rounded-2xl">
                <h1 className="text-2xl font-semibold mb-2" style={{color:'var(--text-primary)'}}>
                    Welcome back
                </h1>
                <p className="mb-8 text-sm" style={{color:'var(--text-secondary)'}}>
                    Sign in to your TaskFlow workspace
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm mb-1 block" style={{color:'var(--text-secondary)'}}>Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => setForm(f => ({...f, email: e.target.value}))}
                            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                            style={{background:'var(--bg-card)',border:'1px solid var(--border)',
                                color:'var(--text-primary)'}}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm mb-1 block" style={{color:'var(--text-secondary)'}}>Password</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={e => setForm(f => ({...f, password: e.target.value}))}
                            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                            style={{background:'var(--bg-card)',border:'1px solid var(--border)',
                                color:'var(--text-primary)'}}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 rounded-lg text-sm font-medium mt-2 transition-all"
                        style={{background: loading ? 'var(--border)' : 'var(--accent)',
                            color:'#fff', cursor: loading ? 'not-allowed' : 'pointer'}}
                    >
                        {loading ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>

                <p className="text-center text-sm mt-6" style={{color:'var(--text-muted)'}}>
                    No account?{' '}
                    <Link to="/register" style={{color:'var(--accent)'}}>Create one</Link>
                </p>
            </div>
        </div>
    )
}