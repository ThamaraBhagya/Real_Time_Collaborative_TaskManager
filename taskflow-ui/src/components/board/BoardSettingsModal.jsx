// src/components/board/BoardSettingsModal.jsx
import { useState } from 'react'
import { updateBoard, deleteBoard } from '../../api/boards'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { X, Settings, Trash2, AlertTriangle, Layout } from 'lucide-react'
import ConfirmModal from '../common/ConfirmModal'

export default function BoardSettingsModal({ board, onClose, onUpdate }) {
    const [form, setForm] = useState({
        name: board.name,
        description: board.description || ''
    })
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const navigate = useNavigate()

    const handleSave = async () => {
        if (!form.name.trim()) return
        setSaving(true)
        try {
            await updateBoard(board.id, form)
            toast.success('Board updated successfully')
            onUpdate()
            onClose()
        } catch {
            toast.error('Failed to update board')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            await deleteBoard(board.id)
            toast.success('Board deleted successfully')
            onClose() // Settings modal eka wahanawa
            navigate('/dashboard')
        } catch (error) {

            if (error.response && error.response.status === 403) {
                toast.error('Only Admins can delete this board!')
            } else {
                toast.error('Failed to delete board')
            }
            setDeleting(false)
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 50
        }}
             onClick={e => e.target === e.currentTarget && onClose()}>

            <div style={{
                width: '100%', maxWidth: '480px', borderRadius: '20px', overflow: 'hidden',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease-out'
            }}>

                {/* 📝 Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px 24px', borderBottom: '1px solid var(--border)',
                    background: 'var(--bg-secondary)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            background: 'rgba(99, 102, 241, 0.1)', padding: '8px',
                            borderRadius: '10px', display: 'flex'
                        }}>
                            <Settings size={18} style={{ color: 'var(--accent)' }} />
                        </div>
                        <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            Board Settings
                        </span>
                    </div>
                    <button onClick={onClose}
                            style={{
                                padding: '8px', borderRadius: '10px', border: '1px solid transparent',
                                background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
                                transition: 'all 0.2s', display: 'flex'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.color = 'var(--text-primary)';
                                e.currentTarget.style.background = 'var(--bg-hover)';
                                e.currentTarget.style.borderColor = 'var(--border)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.color = 'var(--text-muted)';
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = 'transparent';
                            }}>
                        <X size={18} />
                    </button>
                </div>

                {/* ⚙️ Body */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Board Name */}
                    <div>
                        <label style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px'
                        }}>
                            <Layout size={14} /> Board Name
                        </label>
                        <input value={form.name}
                               onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                               placeholder="e.g. Q3 Marketing Plan"
                               style={{
                                   width: '100%', padding: '12px 16px', borderRadius: '10px',
                                   background: 'var(--bg-input)', color: 'var(--text-primary)',
                                   border: '1px solid var(--border)', fontSize: '14px', outline: 'none',
                                   transition: 'all 0.2s', fontWeight: 500
                               }}
                               onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)'; }}
                               onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                    </div>

                    {/* Description */}
                    <div>
                        <label style={{
                            display: 'block', fontSize: '13px', fontWeight: 600,
                            color: 'var(--text-secondary)', marginBottom: '8px'
                        }}>
                            Description (Optional)
                        </label>
                        <textarea value={form.description}
                                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                  rows={3} placeholder="What is this board for?"
                                  style={{
                                      width: '100%', padding: '12px 16px', borderRadius: '10px', resize: 'vertical',
                                      background: 'var(--bg-input)', color: 'var(--text-primary)',
                                      border: '1px solid var(--border)', fontSize: '14px', outline: 'none',
                                      transition: 'all 0.2s', lineHeight: '1.5'
                                  }}
                                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)'; }}
                                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                    </div>

                    {/* Save Button */}
                    <button onClick={handleSave} disabled={saving || !form.name.trim()}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                                background: 'var(--accent)', color: '#fff', marginTop: '4px',
                                fontSize: '14px', fontWeight: 600, cursor: (saving || !form.name.trim()) ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s', opacity: (saving || !form.name.trim()) ? 0.7 : 1,
                                boxShadow: (saving || !form.name.trim()) ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.3)'
                            }}
                            onMouseEnter={e => { if(!saving && form.name.trim()) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)'; } }}
                            onMouseLeave={e => { if(!saving && form.name.trim()) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)'; } }}>
                        {saving ? 'Saving changes...' : 'Save changes'}
                    </button>

                    <div style={{ margin: '8px 0', borderTop: '1px solid var(--border)' }} />


                    <div style={{
                        borderRadius: '12px', padding: '20px',
                        background: 'rgba(239,68,68,0.04)',
                        border: '1px solid rgba(239,68,68,0.15)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--danger)' }}>
                                Danger Zone
                            </span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
                            Deleting a board removes all columns, cards, and activity permanently. This action cannot be undone.
                        </p>
                        <button onClick={() => setShowDeleteConfirm(true)} disabled={deleting}
                                style={{
                                    width: '100%', padding: '10px', borderRadius: '8px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    background: 'rgba(239,68,68,0.1)', color: 'var(--danger)',
                                    border: '1px solid rgba(239,68,68,0.2)', fontSize: '13px', fontWeight: 600,
                                    cursor: deleting ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                                    opacity: deleting ? 0.7 : 1
                                }}
                                onMouseEnter={e => { if(!deleting) { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; } }}
                                onMouseLeave={e => { if(!deleting) { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; } }}>
                            <Trash2 size={16} />
                            {deleting ? 'Deleting board...' : 'Delete this board'}
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Board"
                message={`Are you sure you want to delete the board "${board.name}"? All columns, cards, and activity history will be permanently destroyed. This cannot be undone.`}
                confirmText="Delete Board"
            />
        </div>
    )
}