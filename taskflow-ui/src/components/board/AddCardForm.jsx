// src/components/board/AddCardForm.jsx
import { useState, useRef, useEffect } from 'react'
import { createCard } from '../../api/cards'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

export default function AddCardForm({ columnId, onClose }) {
    const [title, setTitle] = useState('')
    const [loading, setLoading] = useState(false)
    const textareaRef = useRef(null)

    // Auto-resize textarea logic
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
        }
    }, [title])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title.trim()) return
        setLoading(true)
        try {
            await createCard(columnId, {
                title: title.trim()
            })
            // WS event will add it to store automatically
            setTitle('')
            onClose()
        } catch {
            toast.error('Failed to create card')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '8px', animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{
                background: 'var(--bg-card)',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid var(--accent)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }}>
                <textarea
                    ref={textareaRef}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    autoFocus
                    rows={1}
                    style={{
                        width: '100%', background: 'transparent', border: 'none',
                        color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500,
                        resize: 'none', outline: 'none', lineHeight: '1.5',
                        minHeight: '22px', overflow: 'hidden'
                    }}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if(title.trim()) handleSubmit(e);
                        }
                        if (e.key === 'Escape') onClose()
                    }}
                />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                <button type="submit" disabled={loading || !title.trim()}
                        style={{
                            padding: '8px 16px', borderRadius: '8px', border: 'none',
                            background: title.trim() ? 'var(--accent)' : 'var(--bg-hover)',
                            color: title.trim() ? '#fff' : 'var(--text-muted)',
                            fontSize: '13px', fontWeight: 600, cursor: title.trim() ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s', boxShadow: title.trim() ? '0 4px 12px rgba(99,102,241,0.3)' : 'none'
                        }}
                        onMouseEnter={e => { if(title.trim()) e.currentTarget.style.transform = 'translateY(-1px)' }}
                        onMouseLeave={e => { if(title.trim()) e.currentTarget.style.transform = 'translateY(0)' }}>
                    {loading ? 'Adding...' : 'Add card'}
                </button>
                <button type="button" onClick={onClose}
                        title="Cancel"
                        style={{
                            padding: '8px', borderRadius: '8px', border: 'none',
                            background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                    <X size={16} />
                </button>
            </div>
        </form>
    )
}