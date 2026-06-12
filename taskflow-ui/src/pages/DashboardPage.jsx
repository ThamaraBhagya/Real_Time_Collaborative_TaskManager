// src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBoards, createBoard } from '../api/boards'
import { useAuthStore } from '../store/authStore'
import { logout } from '../api/auth'
import toast from 'react-hot-toast'
import { Plus, LogOut, Layout } from 'lucide-react'

export default function DashboardPage() {
    const [boards, setBoards] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [newBoard, setNewBoard] = useState({ name: '', description: '' })
    const user = useAuthStore(s => s.user)
    const clearAuth = useAuthStore(s => s.clearAuth)
    const navigate = useNavigate()

    useEffect(() => {
        getBoards()
            .then(r => setBoards(r.data.data))
            .catch(() => toast.error('Failed to load boards'))
            .finally(() => setLoading(false))
    }, [])

    const handleCreate = async (e) => {
        e.preventDefault()
        try {
            const { data } = await createBoard(newBoard)
            setBoards(b => [...b, data.data])
            setShowCreate(false)
            setNewBoard({ name: '', description: '' })
            toast.success('Board created!')
        } catch {
            toast.error('Failed to create board')
        }
    }

    const handleLogout = async () => {
        const refreshToken = localStorage.getItem('refreshToken')
        try { await logout(refreshToken) } catch {}
        clearAuth()
        navigate('/login')
    }

    return (
        <div className="min-h-screen" style={{background:'var(--bg-primary)'}}>
            {/* Navbar */}
            <nav className="flex items-center justify-between px-8 py-4"
                 style={{borderBottom:'1px solid var(--border)',background:'var(--bg-secondary)'}}>
                <div className="flex items-center gap-2">
                    <Layout size={20} style={{color:'var(--accent)'}}/>
                    <span className="font-semibold text-lg">TaskFlow</span>
                </div>
                <div className="flex items-center gap-4">
          <span className="text-sm" style={{color:'var(--text-secondary)'}}>
            {user?.username}
          </span>
                    <button onClick={handleLogout} className="flex items-center gap-1 text-sm"
                            style={{color:'var(--text-muted)'}}>
                        <LogOut size={16}/> Sign out
                    </button>
                </div>
            </nav>

            <div className="px-8 py-8 max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-semibold">Your boards</h1>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{background:'var(--accent)',color:'#fff'}}
                    >
                        <Plus size={16}/> New board
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1,2,3].map(i => (
                            <div key={i} className="h-32 rounded-xl animate-pulse"
                                 style={{background:'var(--bg-secondary)'}}/>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {boards.map(board => (
                            <button key={board.id} onClick={() => navigate(`/board/${board.id}`)}
                                    className="text-left p-6 rounded-xl transition-all group"
                                    style={{background:'var(--bg-secondary)',
                                        border:'1px solid var(--border)'}}
                                    onMouseEnter={e => e.currentTarget.style.borderColor='var(--border-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
                                <div className="w-8 h-8 rounded-lg mb-4 flex items-center justify-center"
                                     style={{background:'var(--accent)'}}>
                                    <Layout size={16} color="#fff"/>
                                </div>
                                <h3 className="font-medium mb-1">{board.name}</h3>
                                <p className="text-xs" style={{color:'var(--text-muted)'}}>
                                    {board.description || 'No description'}
                                </p>
                            </button>
                        ))}

                        {/* Create board tile */}
                        <button onClick={() => setShowCreate(true)}
                                className="text-left p-6 rounded-xl transition-all"
                                style={{border:'2px dashed var(--border)',background:'transparent'}}
                                onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
                            <div className="flex flex-col items-center justify-center h-full gap-2 py-4">
                                <Plus size={24} style={{color:'var(--text-muted)'}}/>
                                <span className="text-sm" style={{color:'var(--text-muted)'}}>
                  Create new board
                </span>
                            </div>
                        </button>
                    </div>
                )}
            </div>

            {/* Create board modal */}
            {showCreate && (
                <div className="fixed inset-0 flex items-center justify-center z-50"
                     style={{background:'rgba(0,0,0,0.6)'}}>
                    <div className="w-full max-w-md p-6 rounded-2xl"
                         style={{background:'var(--bg-secondary)',border:'1px solid var(--border)'}}>
                        <h2 className="text-lg font-semibold mb-4">New board</h2>
                        <form onSubmit={handleCreate} className="flex flex-col gap-4">
                            <input
                                value={newBoard.name}
                                onChange={e => setNewBoard(b => ({...b, name: e.target.value}))}
                                placeholder="Board name"
                                required
                                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                style={{background:'var(--bg-card)',border:'1px solid var(--border)',
                                    color:'var(--text-primary)'}}
                            />
                            <input
                                value={newBoard.description}
                                onChange={e => setNewBoard(b => ({...b, description: e.target.value}))}
                                placeholder="Description (optional)"
                                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                style={{background:'var(--bg-card)',border:'1px solid var(--border)',
                                    color:'var(--text-primary)'}}
                            />
                            <div className="flex gap-3 justify-end">
                                <button type="button" onClick={() => setShowCreate(false)}
                                        className="px-4 py-2 rounded-lg text-sm"
                                        style={{color:'var(--text-secondary)'}}>
                                    Cancel
                                </button>
                                <button type="submit"
                                        className="px-4 py-2 rounded-lg text-sm font-medium"
                                        style={{background:'var(--accent)',color:'#fff'}}>
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}