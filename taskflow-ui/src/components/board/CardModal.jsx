// src/components/board/CardModal.jsx
import { useState } from 'react'
import { updateCard, deleteCard } from '../../api/cards'
import PriorityBadge from '../ui/PriorityBadge'
import toast from 'react-hot-toast'
import { X, Trash2 } from 'lucide-react'

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

export default function CardModal({ card, onClose }) {
    const [form, setForm] = useState({
        title: card.title,
        description: card.description || '',
        priority: card.priority,
    })
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        try {
            await updateCard(card.id, form)
            // WS event syncs the board
            toast.success('Card updated')
            onClose()
        } catch {
            toast.error('Failed to update card')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Delete this card?')) return
        try {
            await deleteCard(card.id)
            toast.success('Card deleted')
            onClose()
        } catch {
            toast.error('Failed to delete card')
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50"
             style={{background:'rgba(0,0,0,0.7)'}}
             onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-lg rounded-2xl p-6"
                 style={{background:'var(--bg-secondary)',border:'1px solid var(--border)'}}>

                <div className="flex items-center justify-between mb-4">
                    <PriorityBadge priority={form.priority}/>
                    <div className="flex items-center gap-2">
                        <button onClick={handleDelete} className="p-2 rounded-lg transition-all"
                                style={{color:'var(--danger)'}}>
                            <Trash2 size={16}/>
                        </button>
                        <button onClick={onClose} className="p-2 rounded-lg"
                                style={{color:'var(--text-muted)'}}>
                            <X size={16}/>
                        </button>
                    </div>
                </div>

                <input
                    value={form.title}
                    onChange={e => setForm(f => ({...f, title: e.target.value}))}
                    className="w-full text-lg font-medium mb-4 bg-transparent outline-none border-b pb-2"
                    style={{color:'var(--text-primary)',borderColor:'var(--border)'}}
                />

                <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({...f, description: e.target.value}))}
                    placeholder="Add a description…"
                    rows={4}
                    className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none mb-4"
                    style={{background:'var(--bg-card)',border:'1px solid var(--border)',
                        color:'var(--text-primary)'}}
                />

                <div className="mb-6">
                    <label className="text-xs mb-2 block" style={{color:'var(--text-secondary)'}}>
                        Priority
                    </label>
                    <div className="flex gap-2">
                        {PRIORITIES.map(p => (
                            <button key={p}
                                    onClick={() => setForm(f => ({...f, priority: p}))}
                                    className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                                    style={{
                                        background: form.priority === p ? 'var(--accent)' : 'var(--bg-card)',
                                        color: form.priority === p ? '#fff' : 'var(--text-muted)',
                                        border: '1px solid var(--border)'
                                    }}>
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm"
                            style={{color:'var(--text-secondary)'}}>
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                            className="px-4 py-2 rounded-lg text-sm font-medium"
                            style={{background:'var(--accent)',color:'#fff'}}>
                        {saving ? 'Saving…' : 'Save changes'}
                    </button>
                </div>
            </div>
        </div>
    )
}