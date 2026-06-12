// src/pages/RegisterPage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function RegisterPage() {
    const [form, setForm] = useState({ email: '', username: '', password: '' })
    const [loading, setLoading] = useState(false)
    const setAuth = useAuthStore(s => s.setAuth)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data } = await register(form)
            setAuth(
                { id: data.userId, email: data.email, username: data.username },
                data.accessToken,
                data.refreshToken
            )
            navigate('/dashboard')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center" style={{background:'var(--bg-primary)'}}>
            <div style={{background:'var(--bg-secondary)',border:'1px solid var(--border)'}}
                 className="w-full max-w-md p-8 rounded-2xl">
                <h1 className="text-2xl font-semibold mb-2" style={{color:'var(--text-primary)'}}>
                    Create account
                </h1>
                <p className="mb-8 text-sm" style={{color:'var(--text-secondary)'}}>
                    Start managing tasks with your team
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {[
                        { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
                        { key: 'username', label: 'Username', type: 'text', placeholder: 'yourname' },
                        { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
                    ].map(({ key, label, type, placeholder }) => (
                        <div key={key}>
                            <label className="text-sm mb-1 block" style={{color:'var(--text-secondary)'}}>{label}</label>
                            <input
                                type={type}
                                value={form[key]}
                                onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
                                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                style={{background:'var(--bg-card)',border:'1px solid var(--border)',
                                    color:'var(--text-primary)'}}
                                placeholder={placeholder}
                                required
                            />
                        </div>
                    ))}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 rounded-lg text-sm font-medium mt-2 transition-all"
                        style={{background: loading ? 'var(--border)' : 'var(--accent)',
                            color:'#fff', cursor: loading ? 'not-allowed' : 'pointer'}}
                    >
                        {loading ? 'Creating account…' : 'Create account'}
                    </button>
                </form>

                <p className="text-center text-sm mt-6" style={{color:'var(--text-muted)'}}>
                    Already have an account?{' '}
                    <Link to="/login" style={{color:'var(--accent)'}}>Sign in</Link>
                </p>
            </div>
        </div>
    )
}