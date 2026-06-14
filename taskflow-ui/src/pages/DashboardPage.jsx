// src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBoards, createBoard } from '../api/boards'
import { useAuthStore } from '../store/authStore'
import { logout } from '../api/auth'
import toast from 'react-hot-toast'
import { Plus, LogOut, Zap, Layout, ChevronDown } from 'lucide-react'

function UserMenu({ user, onLogout }) {
    const [open, setOpen] = useState(false)
    return (
        <div style={{ position: 'relative' }}>
            <button onClick={() => setOpen(v => !v)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 16px', borderRadius: 12, border: '1px solid var(--border)',
                        background: 'var(--bg-hover)', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--accent)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 600
                }}>
                    {user?.username?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>
                    {user?.username}
                </span>
                <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
            </button>

            {open && (
                <div style={{
                    position: 'absolute', right: 0, top: 54, width: 200,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '6px', zIndex: 50,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
                }}>
                    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
                        {/* Swapped Email for Username as requested */}
                        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                            @{user?.username}
                        </p>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Workspace Member</p>
                    </div>
                    <button onClick={() => { setOpen(false); onLogout() }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                                padding: '10px 14px', borderRadius: 8, border: 'none',
                                background: 'transparent', color: 'var(--danger)',
                                fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <LogOut size={16} /> Sign out
                    </button>
                </div>
            )}
        </div>
    )
}

export default function DashboardPage() {
    const [boards, setBoards] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [newBoard, setNewBoard] = useState({ name: '', description: '' })
    const [creating, setCreating] = useState(false)

    const user = useAuthStore(s => s.user)
    const clearAuth = useAuthStore(s => s.clearAuth)
    const navigate = useNavigate()

    useEffect(() => {
        getBoards()
            .then(r => setBoards(r.data.data || []))
            .catch(() => toast.error('Failed to load boards'))
            .finally(() => setLoading(false))
    }, [])

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!newBoard.name.trim()) return
        setCreating(true)
        try {
            const { data } = await createBoard(newBoard)
            setBoards(b => [data.data, ...b])
            setShowCreate(false)
            setNewBoard({ name: '', description: '' })
            toast.success('Board created!')
        } catch {
            toast.error('Failed to create board')
        } finally {
            setCreating(false)
        }
    }

    const handleLogout = async () => {
        const refreshToken = localStorage.getItem('refreshToken')
        try { await logout(refreshToken) } catch {}
        clearAuth()
        navigate('/login')
    }

    const BOARD_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6']

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <nav style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', padding: '0 40px', height: 72,
                background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
                position: 'sticky', top: 0, zIndex: 40
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'var(--accent)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                    }}>
                        <Zap size={20} color="#fff" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>TaskFlow</span>
                </div>
                <UserMenu user={user} onLogout={handleLogout} />
            </nav>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 40px' }}>
                <div style={{ display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: 40 }}>
                    <div>
                        {/* Changed Good Morning to Welcome */}
                        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                            Welcome, {user?.username} 👋
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
                            You have {boards.length} board{boards.length !== 1 ? 's' : ''} in your workspace.
                        </p>
                    </div>
                    <button onClick={() => setShowCreate(true)} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '12px 20px', borderRadius: 12, border: 'none',
                        background: 'var(--accent)', color: '#fff',
                        fontSize: 15, fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                    }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)'; }}>
                        <Plus size={18} /> Create new board
                    </button>
                </div>

                {loading ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24
                    }}>
                        {[1,2,3,4].map(i => (
                            <div key={i} style={{
                                height: 160, borderRadius: 16,
                                background: 'var(--bg-card)', animation: 'pulse 1.5s infinite'
                            }} />
                        ))}
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24
                    }}>
                        {boards.map((board, i) => (
                            <button key={board.id}
                                    onClick={() => navigate(`/board/${board.id}`)}
                                    style={{
                                        textAlign: 'left', padding: '24px',
                                        borderRadius: 16, border: '1px solid var(--border)',
                                        background: 'var(--bg-card)', cursor: 'pointer',
                                        transition: 'all 0.2s', display: 'flex', flexDirection: 'column'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = 'var(--accent)';
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.2)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'var(--border)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12, marginBottom: 16,
                                    background: BOARD_COLORS[i % BOARD_COLORS.length],
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Layout size={20} color="#fff" />
                                </div>
                                <h3 style={{ fontWeight: 600, marginBottom: 8, fontSize: 18, color: 'var(--text-primary)' }}>
                                    {board.name}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: '1.5',
                                    overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                    {board.description || 'No description provided for this board.'}
                                </p>
                            </button>
                        ))}

                        <button onClick={() => setShowCreate(true)} style={{
                            textAlign: 'left', padding: '24px', borderRadius: 16,
                            border: '2px dashed var(--border)', background: 'rgba(255,255,255,0.02)',
                            cursor: 'pointer', transition: 'all 0.2s',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', gap: 12,
                            minHeight: 180
                        }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 12, border: '1px dashed var(--border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'var(--bg-card)'
                            }}>
                                <Plus size={20} style={{ color: 'var(--text-primary)' }} />
                            </div>
                            <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>
                                Create new board
                            </span>
                        </button>
                    </div>
                )}
            </div>

            {showCreate && (
                <div style={{
                    position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100
                }}
                     onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
                    <div style={{
                        width: '100%', maxWidth: 440, borderRadius: 16,
                        background: 'var(--bg-card)', border: '1px solid var(--border)', padding: 32,
                        boxShadow: '0 24px 48px rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease-out'
                    }}>
                        <h2 style={{ fontWeight: 600, marginBottom: 24, fontSize: 20, color: 'var(--text-primary)' }}>
                            Create a new board
                        </h2>
                        <form onSubmit={handleCreate}
                              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>Board Title</label>
                                <input value={newBoard.name}
                                       onChange={e => setNewBoard(b => ({ ...b, name: e.target.value }))}
                                       placeholder="e.g. Website Redesign" required autoFocus
                                       style={{
                                           width: '100%', padding: '12px 16px', borderRadius: 10,
                                           background: 'var(--bg-input)', color: 'var(--text-primary)',
                                           border: '1px solid var(--border)', fontSize: 15, outline: 'none'
                                       }}
                                       onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                       onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>Description (Optional)</label>
                                <textarea value={newBoard.description}
                                          onChange={e => setNewBoard(b => ({ ...b, description: e.target.value }))}
                                          placeholder="What is this board for?" rows={3}
                                          style={{
                                              width: '100%', padding: '12px 16px', borderRadius: 10, resize: 'none',
                                              background: 'var(--bg-input)', color: 'var(--text-primary)',
                                              border: '1px solid var(--border)', fontSize: 15, outline: 'none'
                                          }}
                                          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                          onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                                <button type="button" onClick={() => setShowCreate(false)} style={{
                                    flex: 1, padding: '12px', borderRadius: 10,
                                    background: 'transparent', border: '1px solid var(--border)',
                                    color: 'var(--text-primary)', fontSize: 15, fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s'
                                }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={creating} style={{
                                    flex: 1, padding: '12px', borderRadius: 10, border: 'none',
                                    background: 'var(--accent)', color: '#fff',
                                    fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s',
                                    opacity: creating ? 0.7 : 1
                                }}>
                                    {creating ? 'Creating...' : 'Create board'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}