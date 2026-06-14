// src/components/board/ActivityFeed.jsx
import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import api from '../../api/axios'
import { X, Activity, Clock } from 'lucide-react'
import Avatar from '../ui/Avatar' // 🟢 Api kalin hadapu Avatar eka

const ACTION_LABELS = {
    BOARD_CREATED:       { label: 'created the board',      color: '#10b981' },
    BOARD_UPDATED:       { label: 'updated board settings', color: '#64748b' },
    MEMBER_ADDED:        { label: 'added member',           color: '#8b5cf6' },
    MEMBER_REMOVED:      { label: 'removed member',         color: '#ef4444' },
    MEMBER_ROLE_UPDATED: { label: 'changed role for',       color: '#f59e0b' },
    COLUMN_CREATED:      { label: 'added column',           color: '#3b82f6' },
    COLUMN_UPDATED:      { label: 'renamed column',         color: '#8b5cf6' },
    COLUMN_DELETED:      { label: 'deleted column',         color: '#ef4444' },
    CARD_CREATED:        { label: 'added card',             color: '#10b981' },
    CARD_MOVED:          { label: 'moved card',             color: '#6366f1' },
    CARD_UPDATED:        { label: 'updated card',           color: '#f59e0b' },
    CARD_DELETED:        { label: 'deleted card',           color: '#ef4444' },
}

// Helper to extract the right target name from the payload based on the action
const getTargetName = (action, payload) => {
    if (!payload) return null;
    if (action.includes('CARD')) return payload.cardTitle;
    if (action.includes('COLUMN')) return payload.name;
    if (action.includes('MEMBER')) return payload.username || 'a user';
    if (action.includes('BOARD')) return payload.name;
    return null;
}

function ActivityItem({ item }) {
    const meta = ACTION_LABELS[item.action] || { label: item.action.toLowerCase().replace(/_/g, ' '), color: '#94a3b8' }
    const targetName = getTargetName(item.action, item.payload)

    return (
        <div style={{
            display: 'flex', gap: '14px', padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            transition: 'background 0.2s', animation: 'fadeIn 0.3s ease-out'
        }}
             onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
             onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

            <div style={{ marginTop: '2px' }}>
                <Avatar username={item.username} size={32} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', lineHeight: '1.5', margin: '0 0 6px 0', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        {item.username}
                    </span>
                    {' '}
                    <span style={{ color: meta.color, fontWeight: 500 }}>
                        {meta.label}
                    </span>
                    {' '}
                    {targetName && (
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontStyle: 'italic' }}>
                            "{targetName}"
                        </span>
                    )}
                </p>
                <p style={{
                    fontSize: '12px', color: 'var(--text-muted)', margin: 0,
                    display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    <Clock size={12} />
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </p>
            </div>
        </div>
    )
}

export default function ActivityFeed({ boardId, onClose, newEvents }) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)

    useEffect(() => {
        api.get(`/boards/${boardId}/activity?page=0`)
            .then(r => {
                setItems(r.data.data)
                setHasMore(r.data.data.length === 30)
            })
            .finally(() => setLoading(false))
    }, [boardId])

    useEffect(() => {
        if (newEvents.length > 0) {
            const latest = newEvents[newEvents.length - 1]
            const meta = ACTION_LABELS[latest.type]
            if (!meta) return
            const synthetic = {
                id: latest.timestamp + Math.random(), // Unique ID for React mapping
                username: latest.actorUsername,
                action: latest.type,
                payload: latest.payload,
                createdAt: latest.timestamp,
            }
            setItems(prev => [synthetic, ...prev])
        }
    }, [newEvents])

    const loadMore = () => {
        const next = page + 1
        api.get(`/boards/${boardId}/activity?page=${next}`)
            .then(r => {
                setItems(prev => [...prev, ...r.data.data])
                setHasMore(r.data.data.length === 30)
                setPage(next)
            })
    }

    return (
        <div style={{
            width: 360, background: 'var(--bg-secondary)',
            borderLeft: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', height: '100%',
            boxShadow: '-8px 0 24px rgba(0,0,0,0.1)', zIndex: 30
        }}>
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0,
                background: 'var(--bg-card)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        background: 'rgba(99, 102, 241, 0.1)', padding: '8px',
                        borderRadius: '10px', display: 'flex'
                    }}>
                        <Activity size={18} style={{ color: 'var(--accent)' }} />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)' }}>
                        Board Activity
                    </span>
                </div>
                <button onClick={onClose}
                        style={{
                            padding: '8px', borderRadius: '10px', border: '1px solid transparent',
                            background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
                            transition: 'all 0.2s', display: 'flex'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.color = 'var(--text-primary)'
                            e.currentTarget.style.background = 'var(--bg-hover)'
                            e.currentTarget.style.borderColor = 'var(--border)'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.color = 'var(--text-muted)'
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.borderColor = 'transparent'
                        }}>
                    <X size={18} />
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
                        <div style={{
                            width: '24px', height: '24px', borderRadius: '50%', border: '3px solid var(--border)',
                            borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite'
                        }} />
                    </div>
                ) : items.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <Activity size={40} style={{ color: 'var(--border)', margin: '0 auto 16px' }} />
                        <p style={{ fontSize: '15px', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
                            No activity yet
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                            Actions performed on this board will appear here.
                        </p>
                    </div>
                ) : (
                    <div style={{ paddingBottom: '20px' }}>
                        {items.map(item => (
                            <ActivityItem key={item.id} item={item} />
                        ))}
                        {hasMore && (
                            <div style={{ padding: '20px' }}>
                                <button onClick={loadMore}
                                        style={{
                                            width: '100%', padding: '10px', borderRadius: '10px',
                                            border: '1px solid var(--border)', background: 'var(--bg-card)',
                                            color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500,
                                            cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}>
                                    Load older activity
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}