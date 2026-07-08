// src/pages/LoginPage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react'

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
                data.accessToken, data.refreshToken
            )
            navigate('/dashboard')
        } catch {
            toast.error('Invalid email or password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden'
        }}>

            <div style={{
                position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px',
                background: 'var(--accent)', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%', zIndex: 0
            }} />
            <div style={{
                position: 'absolute', bottom: '-10%', right: '-5%', width: '400px', height: '400px',
                background: 'var(--accent)', filter: 'blur(150px)', opacity: 0.1, borderRadius: '50%', zIndex: 0
            }} />

            <div style={{
                width: '100%', maxWidth: 420, margin: 'auto', padding: '0 24px', zIndex: 10,
                animation: 'fadeIn 0.4s ease-out'
            }}>
                {/*  Header Section */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'linear-gradient(135deg, var(--accent) 0%, rgba(99, 102, 241, 0.8) 100%)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 20, boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
                    }}>
                        <Zap size={28} color="#fff" fill="#fff" />
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                        Welcome back
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
                        Sign in to your TaskFlow workspace
                    </p>
                </div>

                {/*  Login Card */}
                <div style={{
                    background: 'var(--bg-card)', borderRadius: 24,
                    border: '1px solid var(--border)', padding: '32px 28px',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* Email Input */}
                        <div>
                            <label style={{
                                display: 'block', fontSize: 13, fontWeight: 600,
                                color: 'var(--text-secondary)', marginBottom: 8
                            }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                    <Mail size={18} />
                                </div>
                                <input type="email"
                                       value={form.email}
                                       onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                       placeholder="you@example.com" required autoFocus
                                       style={{
                                           width: '100%', padding: '12px 14px 12px 42px', borderRadius: 12,
                                           background: 'var(--bg-input)', color: 'var(--text-primary)',
                                           border: '1px solid var(--border)', fontSize: 15, outline: 'none',
                                           transition: 'all 0.2s'
                                       }}
                                       onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)'; }}
                                       onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label style={{
                                display: 'block', fontSize: 13, fontWeight: 600,
                                color: 'var(--text-secondary)', marginBottom: 8
                            }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                    <Lock size={18} />
                                </div>
                                <input type="password"
                                       value={form.password}
                                       onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                       placeholder="••••••••" required
                                       style={{
                                           width: '100%', padding: '12px 14px 12px 42px', borderRadius: 12,
                                           background: 'var(--bg-input)', color: 'var(--text-primary)',
                                           border: '1px solid var(--border)', fontSize: 15, outline: 'none',
                                           transition: 'all 0.2s', fontFamily: 'monospace'
                                       }}
                                       onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)'; }}
                                       onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                            background: loading ? 'var(--bg-hover)' : 'var(--accent)',
                            color: loading ? 'var(--text-muted)' : '#fff',
                            fontSize: 15, fontWeight: 600, marginTop: 8,
                            transition: 'all 0.2s', cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            boxShadow: loading ? 'none' : '0 8px 20px rgba(99, 102, 241, 0.3)'
                        }}
                                onMouseEnter={e => { if(!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(99, 102, 241, 0.4)'; } }}
                                onMouseLeave={e => { if(!loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.3)'; } }}>
                            {loading ? 'Signing in...' : (
                                <>Sign in <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>
                </div>

                {/*  Footer Link */}
                <p style={{
                    textAlign: 'center', marginTop: 32,
                    fontSize: 14, color: 'var(--text-muted)'
                }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{
                        color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600,
                        transition: 'color 0.2s'
                    }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}>
                        Create workspace
                    </Link>
                </p>
            </div>
        </div>
    )
}