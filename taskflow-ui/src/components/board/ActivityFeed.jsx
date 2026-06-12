// src/components/board/ActivityFeed.jsx
import { useEffect, useState, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import api from '../../api/axios'
import { X, Activity } from 'lucide-react'

const ACTION_LABELS = {
    CARD_CREATED: { label: 'created card', color: '#10b981' },
    CARD_MOVED:   { label: 'moved card',   color: '#6366f1' },
    CARD_UPDATED: { label: 'updated card', color: '#f59e0b' },
    CARD_DELETED: { label: 'deleted card', color: '#ef4444' },
    COLUMN_CREATED:{ label: 'added column',color: '#3b82f6' },
    MEMBER_ADDED: { label: 'added member', color: '#8b5cf6' },
}

function ActivityItem({ item }) {
    const meta = ACTION_LABELS[item.action] || { label: item.action, color: '#94a3b8' }
    return (
        <div className="flex gap-3 py-3"
             style={{borderBottom:'1px solid var(--border)'}}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                 style={{background:'var(--accent)',color:'#fff'}}>
                {item.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug">
          <span style={{color:'var(--text-primary)',fontWeight:500}}>
            {item.username}
          </span>{' '}
                    <span style={{color: meta.color}}>{meta.label}</span>{' '}
                    {item.payload?.cardTitle && (
                        <span className="italic text-xs"
                              style={{color:'var(--text-secondary)'}}>
              "{item.payload.cardTitle}"
            </span>
                    )}
                </p>
                <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>
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

    // Prepend new real-time events as they arrive
    useEffect(() => {
        if (newEvents.length > 0) {
            const latest = newEvents[newEvents.length - 1]
            const meta = ACTION_LABELS[latest.type]
            if (!meta) return
            const synthetic = {
                id: latest.timestamp,
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
        <div className="flex flex-col h-full"
             style={{width:320,background:'var(--bg-secondary)',
                 borderLeft:'1px solid var(--border)'}}>
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
                 style={{borderBottom:'1px solid var(--border)'}}>
                <div className="flex items-center gap-2">
                    <Activity size={16} style={{color:'var(--accent)'}}/>
                    <span className="font-medium text-sm">Activity</span>
                </div>
                <button onClick={onClose} style={{color:'var(--text-muted)'}}>
                    <X size={16}/>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-5 h-5 border-2 rounded-full animate-spin"
                             style={{borderColor:'var(--border)',borderTopColor:'var(--accent)'}}/>
                    </div>
                ) : items.length === 0 ? (
                    <p className="text-sm py-8 text-center" style={{color:'var(--text-muted)'}}>
                        No activity yet
                    </p>
                ) : (
                    <>
                        {items.map(item => (
                            <ActivityItem key={item.id} item={item}/>
                        ))}
                        {hasMore && (
                            <button onClick={loadMore}
                                    className="w-full py-3 text-xs text-center"
                                    style={{color:'var(--text-muted)'}}>
                                Load more
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}