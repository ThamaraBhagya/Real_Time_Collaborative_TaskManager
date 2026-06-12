// src/pages/BoardPage.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBoard, addColumn } from '../api/boards'
import { useBoardStore } from '../store/boardStore'
import { useWebSocket } from '../hooks/useWebSocket'
import KanbanBoard from '../components/board/KanbanBoard'
import ActivityFeed from '../components/board/ActivityFeed' // Make sure this file exists!
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, Users, Activity } from 'lucide-react'

export default function BoardPage() {
    const { boardId } = useParams()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [addingColumn, setAddingColumn] = useState(false)
    const [columnName, setColumnName] = useState('')
    const [showActivity, setShowActivity] = useState(false)

    const { board, setBoard, recentEvents } = useBoardStore(s => ({
        board: s.board,
        setBoard: s.setBoard,
        recentEvents: s.recentEvents
    }))

    // Connect to WebSocket for this board
    useWebSocket(boardId)

    useEffect(() => {
        getBoard(boardId)
            .then(r => setBoard(r.data.data))
            .catch(() => toast.error('Failed to load board'))
            .finally(() => setLoading(false))

        return () => setBoard(null)
    }, [boardId, setBoard])

    const handleAddColumn = async (e) => {
        e.preventDefault()
        if (!columnName.trim()) return
        try {
            await addColumn(boardId, { name: columnName.trim() })
            setColumnName('')
            setAddingColumn(false)
            // WS event adds column to store automatically
        } catch {
            toast.error('Failed to add column')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen"
                 style={{background:'var(--bg-primary)'}}>
                <div className="w-6 h-6 border-2 rounded-full animate-spin"
                     style={{borderColor:'var(--border)',borderTopColor:'var(--accent)'}}/>
            </div>
        )
    }

    if (!board) return null

    return (
        <div className="h-screen flex flex-col overflow-hidden"
             style={{background:'var(--bg-primary)'}}>

            {/* Board header */}
            <header className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                    style={{borderBottom:'1px solid var(--border)',
                        background:'var(--bg-secondary)'}}>

                {/* Left Side: Back Button & Title */}
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')}
                            className="p-2 rounded-lg transition-all"
                            style={{color:'var(--text-muted)'}}
                            onMouseEnter={e => e.currentTarget.style.color='var(--text-primary)'}
                            onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}>
                        <ArrowLeft size={18}/>
                    </button>
                    <div>
                        <h1 className="font-semibold">{board.name}</h1>
                        {board.description && (
                            <p className="text-xs" style={{color:'var(--text-muted)'}}>
                                {board.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Side: Members, Add Column, Activity Button */}
                <div className="flex items-center gap-4">

                    {/* Member avatars */}
                    <div className="flex -space-x-2">
                        {board.members?.slice(0, 4).map(m => (
                            <div key={m.userId}
                                 title={m.username}
                                 className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2"
                                 style={{background:'var(--accent)',color:'#fff',
                                     borderColor:'var(--bg-secondary)'}}>
                                {m.username[0].toUpperCase()}
                            </div>
                        ))}
                    </div>

                    {/* Add column Button/Form */}
                    {addingColumn ? (
                        <form onSubmit={handleAddColumn} className="flex items-center gap-2">
                            <input
                                value={columnName}
                                onChange={e => setColumnName(e.target.value)}
                                placeholder="Column name"
                                autoFocus
                                className="px-3 py-1.5 rounded-lg text-sm outline-none"
                                style={{background:'var(--bg-card)',border:'1px solid var(--accent)',
                                    color:'var(--text-primary)',width:'140px'}}
                                onKeyDown={e => e.key === 'Escape' && setAddingColumn(false)}
                            />
                            <button type="submit"
                                    className="px-3 py-1.5 rounded-lg text-sm font-medium"
                                    style={{background:'var(--accent)',color:'#fff'}}>
                                Add
                            </button>
                            <button type="button" onClick={() => setAddingColumn(false)}
                                    className="px-3 py-1.5 text-sm"
                                    style={{color:'var(--text-muted)'}}>
                                Cancel
                            </button>
                        </form>
                    ) : (
                        <button
                            onClick={() => setAddingColumn(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all"
                            style={{border:'1px solid var(--border)',color:'var(--text-secondary)'}}
                            onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
                            <Plus size={14}/> Add column
                        </button>
                    )}

                    {/* Activity Toggle Button */}
                    <button
                        onClick={() => setShowActivity(v => !v)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all"
                        style={{
                            border:'1px solid',
                            color: showActivity ? 'var(--accent)' : 'var(--text-secondary)',
                            borderColor: showActivity ? 'var(--accent)' : 'var(--border)',
                            background: showActivity ? 'var(--bg-hover)' : 'transparent'
                        }}
                    >
                        <Activity size={14}/> Activity
                    </button>
                </div>
            </header>

            {/* Board content & Activity Sidebar */}
            <div className="flex-1 overflow-hidden flex">

                {/* Main Kanban Board */}
                <div className="flex-1 overflow-hidden">
                    <KanbanBoard board={board}/>
                </div>

                {/* Activity Feed Sidebar */}
                {showActivity && (
                    <div className="w-80 border-l flex flex-col"
                         style={{background:'var(--bg-secondary)', borderColor:'var(--border)'}}>
                        <ActivityFeed
                            boardId={boardId}
                            onClose={() => setShowActivity(false)}
                            newEvents={recentEvents}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}