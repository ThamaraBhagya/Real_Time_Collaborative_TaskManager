// src/pages/BoardPage.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBoard } from '../api/boards'
import { useBoardStore } from '../store/boardStore'
import { useWebSocket } from '../hooks/useWebSocket'
import KanbanBoard from '../components/board/KanbanBoard'
import InviteMemberModal from '../components/board/InviteMemberModal'
import MembersPanel from '../components/board/MembersPanel'
import BoardSettingsModal from '../components/board/BoardSettingsModal'
import ActivityFeed from '../components/board/ActivityFeed'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, UserPlus, Users, Settings, Activity, Zap } from 'lucide-react'

export default function BoardPage() {
    const { boardId } = useParams()
    const navigate = useNavigate()

    const board = useBoardStore(s => s.board)
    const setBoard = useBoardStore(s => s.setBoard)
    const recentEvents = useBoardStore(s => s.recentEvents)
    const isDeleted = useBoardStore(s => s.isDeleted)

    const [loading, setLoading] = useState(true)
    const [addingColumn, setAddingColumn] = useState(false)
    const [columnName, setColumnName] = useState('')

    const [showInvite,    setShowInvite]    = useState(false)
    const [showMembers,   setShowMembers]   = useState(false)
    const [showSettings,  setShowSettings]  = useState(false)
    const [showActivity,  setShowActivity]  = useState(false)

    useWebSocket(boardId)

    useEffect(() => {
        if (isDeleted) {
            toast.error('This board was deleted by the Admin!')
            navigate('/dashboard')
        }
    }, [isDeleted, navigate])

    const loadBoard = () => {
        getBoard(boardId)
            .then(r => setBoard(r.data.data))
            .catch(() => toast.error('Failed to load board'))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        loadBoard()
        return () => setBoard(null)
    }, [boardId])

    const handleAddColumn = async (e) => {
        e.preventDefault()
        if (!columnName.trim()) return
        try {
            const { addColumn } = await import('../api/boards')
            await addColumn(boardId, { name: columnName.trim() })
            setColumnName('')
            setAddingColumn(false)
        } catch {
            toast.error('Failed to add column')
        }
    }

    if (loading) return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100vh', background: 'var(--bg-primary)'
        }}>
            <div style={{
                width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--border)',
                borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite'
            }} />
        </div>
    )

    if (!board) {
        return (
            <div style={{
                height: '100vh', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg-primary)', color: 'var(--text-primary)'
            }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>👀</div>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Board Not Found</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 32 }}>
                    The board you are looking for might have been deleted or doesn't exist.
                </p>
                <button onClick={() => navigate('/dashboard')} style={{
                    padding: '12px 24px', borderRadius: 10, border: 'none',
                    background: 'var(--accent)', color: '#fff', cursor: 'pointer',
                    fontSize: 15, fontWeight: 600, transition: 'background 0.2s'
                }} onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>
                    Go back to Dashboard
                </button>
            </div>
        )
    }

    const iconBtn = (onClick, icon, title, active = false) => (
        <button title={title} onClick={onClick} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 38, height: 38, borderRadius: 10, border: '1px solid var(--border)',
            background: active ? 'var(--accent-light)' : 'var(--bg-hover)',
            color: active ? 'var(--accent)' : 'var(--text-secondary)',
            cursor: 'pointer', transition: 'all 0.2s'
        }}
                onMouseEnter={e => {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.borderColor = 'var(--accent)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.color = active ? 'var(--accent)' : 'var(--text-secondary)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                }}>
            {icon}
        </button>
    )

    return (
        <div style={{
            height: '100vh', display: 'flex', flexDirection: 'column',
            overflow: 'hidden', background: 'var(--bg-primary)'
        }}>
            <header style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 24px', height: 64, flexShrink: 0,
                background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button onClick={() => navigate('/dashboard')} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 36, height: 36, borderRadius: 10, border: 'none',
                        background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
                        transition: 'background 0.2s'
                    }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                        <ArrowLeft size={20} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: 'var(--accent)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Zap size={16} color="#fff" />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 18, color: 'var(--text-primary)' }}>{board.name}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', marginRight: 8 }}>
                        {board.members?.slice(0, 5).map(m => (
                            <div key={m.userId} title={m.username} style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'var(--accent)', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 13, fontWeight: 600, marginLeft: -8,
                                border: '2px solid var(--bg-secondary)'
                            }}>
                                {m.username[0].toUpperCase()}
                            </div>
                        ))}
                    </div>

                    {iconBtn(() => setShowInvite(true),   <UserPlus size={18} />, 'Invite member')}
                    {iconBtn(() => setShowMembers(true),  <Users size={18} />,    'Members')}
                    {iconBtn(() => setShowActivity(v => !v), <Activity size={18} />, 'Activity', showActivity)}
                    {iconBtn(() => setShowSettings(true), <Settings size={18} />, 'Settings')}

                    <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 8px' }} />

                    {addingColumn ? (
                        <form onSubmit={handleAddColumn}
                              style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input value={columnName}
                                   onChange={e => setColumnName(e.target.value)}
                                   placeholder="Column name" autoFocus
                                   onKeyDown={e => e.key === 'Escape' && setAddingColumn(false)}
                                   style={{
                                       padding: '8px 12px', borderRadius: 8, fontSize: 14,
                                       background: 'var(--bg-input)', border: '1px solid var(--accent)',
                                       color: 'var(--text-primary)', width: 160, outline: 'none'
                                   }} />
                            <button type="submit" style={{
                                padding: '8px 16px', borderRadius: 8, border: 'none',
                                background: 'var(--accent)', color: '#fff',
                                fontSize: 14, fontWeight: 500, cursor: 'pointer'
                            }}>Add</button>
                            <button type="button" onClick={() => setAddingColumn(false)} style={{
                                padding: '8px 12px', borderRadius: 8, border: 'none',
                                background: 'var(--bg-hover)', color: 'var(--text-secondary)',
                                fontSize: 14, cursor: 'pointer'
                            }}>Cancel</button>
                        </form>
                    ) : (
                        <button onClick={() => setAddingColumn(true)} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 16px', borderRadius: 10,
                            border: '1px dashed var(--border)', background: 'var(--bg-hover)',
                            color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'var(--accent)';
                                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                                    e.currentTarget.style.color = 'var(--accent)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.background = 'var(--bg-hover)';
                                    e.currentTarget.style.color = 'var(--text-primary)';
                                }}>
                            <Plus size={16} /> Add column
                        </button>
                    )}
                </div>
            </header>

            <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <KanbanBoard board={board} />
                </div>
                {showActivity && (
                    <ActivityFeed boardId={boardId} onClose={() => setShowActivity(false)}
                                  newEvents={recentEvents} />
                )}
            </div>

            {showInvite && (
                <InviteMemberModal boardId={boardId}
                                   onClose={() => setShowInvite(false)}
                                   onInvited={loadBoard} />
            )}
            {showMembers && (
                <MembersPanel board={board}
                              onClose={() => setShowMembers(false)}
                              onUpdate={loadBoard} />
            )}
            {showSettings && (
                <BoardSettingsModal board={board}
                                    onClose={() => setShowSettings(false)}
                                    onUpdate={loadBoard} />
            )}
        </div>
    )
}