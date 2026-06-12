// src/components/board/AddCardForm.jsx
import { useState } from 'react'
import { createCard } from '../../api/cards'
import { useBoardStore } from '../../store/boardStore'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

export default function AddCardForm({ columnId, onClose }) {
    const [title, setTitle] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title.trim()) return
        setLoading(true)
        try {
            await createCard(columnId, { title: title.trim() })
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
        <form onSubmit={handleSubmit} className="mt-2">
      <textarea
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Card title…"
          autoFocus
          rows={2}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
          style={{background:'var(--bg-card)',border:'1px solid var(--accent)',
              color:'var(--text-primary)'}}
          onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e) }
              if (e.key === 'Escape') onClose()
          }}
      />
            <div className="flex gap-2 mt-2">
                <button type="submit" disabled={loading}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{background:'var(--accent)',color:'#fff'}}>
                    {loading ? 'Adding…' : 'Add card'}
                </button>
                <button type="button" onClick={onClose}
                        className="p-1.5 rounded-lg"
                        style={{color:'var(--text-muted)'}}>
                    <X size={14}/>
                </button>
            </div>
        </form>
    )
}