// src/components/board/CardModal.jsx
import { useState } from 'react'
import { updateCard, deleteCard } from '../../api/cards'
import { useBoardStore } from '../../store/boardStore'
import toast from 'react-hot-toast'
import { X, Trash2, User, Calendar, Flag, AlignLeft, CheckSquare } from 'lucide-react'
import ConfirmModal from '../common/ConfirmModal'

const PRIORITIES = [
    { value: 'LOW',    color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
    { value: 'MEDIUM', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    { value: 'HIGH',   color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    { value: 'URGENT', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
]

export default function CardModal({ card, onClose }) {
    const board = useBoardStore(s => s.board)
    const [form, setForm] = useState({
        title:       card.title,
        description: card.description || '',
        priority:    card.priority,
        assigneeId:  card.assigneeId || '',
        // 🟢 FIX: Slice to 10 characters to get YYYY-MM-DD format for pure date picker
        dueDate:     card.dueDate
            ? new Date(card.dueDate).toISOString().slice(0, 10) : '',
    })
    const [saving, setSaving] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const members = board?.members || []

    const handleSave = async () => {
        if (!form.title.trim()) return
        setSaving(true)
        try {
            await updateCard(card.id, {
                title:       form.title,
                description: form.description,
                priority:    form.priority,
                assigneeId:  form.assigneeId || null,
                // Append a default time or let backend handle the pure date string
                dueDate:     form.dueDate ? new Date(form.dueDate).toISOString() : null,
            })
            toast.success('Card updated successfully')
            onClose()
        } catch {
            toast.error('Failed to update card')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
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
             style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
             onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{
                width: '100%', maxWidth: 560, borderRadius: 20, overflow: 'hidden',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease-out',
                display: 'flex', flexDirection: 'column', maxHeight: '90vh'
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px 28px', borderBottom: '1px solid var(--border)',
                    background: 'var(--bg-secondary)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CheckSquare size={20} style={{ color: 'var(--accent)' }} />
                        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Edit Task</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button onClick={() => setShowDeleteConfirm(true)}
                                title="Delete Task"
                                style={{
                                    padding: '8px', borderRadius: '10px', border: '1px solid transparent',
                                    background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}>
                            <Trash2 size={18} />
                        </button>
                        <button onClick={onClose}
                                title="Close"
                                style={{
                                    padding: '8px', borderRadius: '10px', border: '1px solid var(--border)',
                                    background: 'var(--bg-hover)', color: 'var(--text-secondary)', cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div style={{ padding: '28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

                    {/* Title Section */}
                    <div>
                        <input value={form.title}
                               onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                               placeholder="Task Title"
                               style={{
                                   width: '100%', fontSize: 22, fontWeight: 600,
                                   background: 'transparent', border: 'none', borderBottom: '2px solid transparent',
                                   color: 'var(--text-primary)', padding: '4px 0 8px', outline: 'none',
                                   transition: 'border-color 0.2s'
                               }}
                               onFocus={e => e.target.style.borderBottomColor = 'var(--accent)'}
                               onBlur={e => e.target.style.borderBottomColor = 'transparent'}
                        />
                    </div>

                    {/* Description Section */}
                    <div>
                        <label style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12
                        }}>
                            <AlignLeft size={16} style={{ color: 'var(--text-muted)' }} /> Description
                        </label>
                        <textarea value={form.description}
                                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                  placeholder="Add a more detailed description..."
                                  rows={4}
                                  style={{
                                      width: '100%', padding: '14px 16px', borderRadius: 12, resize: 'vertical',
                                      background: 'var(--bg-input)', border: '1px solid var(--border)',
                                      color: 'var(--text-primary)', fontSize: 14, lineHeight: '1.6', outline: 'none',
                                      transition: 'border-color 0.2s'
                                  }}
                                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>

                    {/* Meta Section (Assignee & Date) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div>
                            <label style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8
                            }}>
                                <User size={14} /> Assignee
                            </label>
                            <select value={form.assigneeId}
                                    onChange={e => setForm(f => ({ ...f, assigneeId: e.target.value }))}
                                    style={{
                                        width: '100%', padding: '12px 14px', borderRadius: 10,
                                        background: 'var(--bg-input)', border: '1px solid var(--border)',
                                        color: form.assigneeId ? 'var(--text-primary)' : 'var(--text-muted)',
                                        fontSize: 14, cursor: 'pointer', outline: 'none', appearance: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--border)'}>
                                <option value="">Unassigned</option>
                                {members.map(m => (
                                    <option key={m.userId} value={m.userId}>{m.username}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8
                            }}>
                                <Calendar size={14} /> Due date
                            </label>
                            {/* 🟢 FIX: Changed to type="date" and added showPicker() */}
                            <input type="date"
                                   value={form.dueDate}
                                   onClick={e => e.target.showPicker && e.target.showPicker()}
                                   onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                                   style={{
                                       width: '100%', padding: '12px 14px', borderRadius: 10,
                                       background: 'var(--bg-input)', border: '1px solid var(--border)',
                                       color: form.dueDate ? 'var(--text-primary)' : 'var(--text-muted)',
                                       fontSize: 14, cursor: 'pointer', outline: 'none',
                                       transition: 'border-color 0.2s', fontFamily: 'inherit'
                                   }}
                                   onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                   onBlur={e => e.target.style.borderColor = 'var(--border)'}/>
                        </div>
                    </div>

                    {/* Priority Section */}
                    <div>
                        <label style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10
                        }}>
                            <Flag size={14} /> Priority
                        </label>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {PRIORITIES.map(p => {
                                const isSelected = form.priority === p.value;
                                return (
                                    <button key={p.value} onClick={() => setForm(f => ({ ...f, priority: p.value }))}
                                            style={{
                                                flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                                                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                                letterSpacing: '0.02em', transition: 'all 0.2s',
                                                background: isSelected ? p.bg : 'var(--bg-input)',
                                                color: isSelected ? p.color : 'var(--text-secondary)',
                                                boxShadow: isSelected ? `inset 0 0 0 1px ${p.color}` : 'inset 0 0 0 1px var(--border)'
                                            }}
                                            onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background = 'var(--bg-hover)' }}
                                            onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background = 'var(--bg-input)' }}>
                                        {p.value}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div style={{
                    padding: '20px 28px', borderTop: '1px solid var(--border)',
                    background: 'var(--bg-secondary)', display: 'flex', gap: 12
                }}>
                    <button onClick={onClose} style={{
                        flex: 1, padding: '12px', borderRadius: 10,
                        background: 'transparent', border: '1px solid var(--border)',
                        color: 'var(--text-primary)', fontSize: 15, fontWeight: 500, cursor: 'pointer',
                        transition: 'background 0.2s'
                    }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving} style={{
                        flex: 2, padding: '12px', borderRadius: 10, border: 'none',
                        background: 'var(--accent)', color: '#fff',
                        fontSize: 15, fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.2s', opacity: saving ? 0.7 : 1,
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                    }}
                            onMouseEnter={e => { if(!saving) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)'; } }}
                            onMouseLeave={e => { if(!saving) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)'; } }}>
                        {saving ? 'Saving...' : 'Save changes'}
                    </button>
                </div>
            </div>

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Task"
                message={`Are you sure you want to delete "${card.title}"? This action cannot be undone.`}
            />
        </div>
    )
}