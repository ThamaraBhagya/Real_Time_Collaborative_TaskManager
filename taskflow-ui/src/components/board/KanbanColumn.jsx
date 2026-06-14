// src/components/board/KanbanColumn.jsx
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanCard from './KanbanCard'
import AddCardForm from './AddCardForm'
import { useState, useRef, useEffect } from 'react'
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { renameColumn, deleteColumn } from '../../api/boards'
import { useBoardStore } from '../../store/boardStore'
import toast from 'react-hot-toast'
import ConfirmModal from '../common/ConfirmModal'

export default function KanbanColumn({ column, onCardClick }) {
    const [adding, setAdding] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [renaming, setRenaming] = useState(false)
    const [newName, setNewName] = useState(column.name)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const renameRef = useRef(null)
    const { board, setBoard } = useBoardStore()

    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
        data: { type: 'column', column }
    })

    const cards = [...(column.cards || [])].sort((a, b) => a.position - b.position)

    useEffect(() => {
        if (renaming) renameRef.current?.focus()
    }, [renaming])

    const handleRename = async () => {
        if (!newName.trim() || newName === column.name) {
            setRenaming(false)
            return
        }
        try {
            await renameColumn(column.id, newName.trim())
            const updated = structuredClone(board)
            const col = updated.columns.find(c => c.id === column.id)
            if (col) col.name = newName.trim()
            setBoard(updated)
        } catch {
            toast.error('Failed to rename column')
        }
        setRenaming(false)
        setMenuOpen(false)
    }

    const handleDelete = async () => {
        try {
            await deleteColumn(column.id)
            const updated = structuredClone(board)
            updated.columns = updated.columns.filter(c => c.id !== column.id)
            setBoard(updated)
            toast.success('Column deleted successfully')
        } catch (error) {
            if (error.response && error.response.status === 403) {
                toast.error('Only Admins can delete columns!')
            } else {
                toast.error('Failed to delete column')
            }
        }
        setMenuOpen(false)
    }

    return (
        <div style={{
            flexShrink: 0, width: 300, display: 'flex', flexDirection: 'column',
            borderRadius: '16px', background: 'var(--bg-secondary)',
            border: `2px solid ${isOver ? 'var(--accent)' : 'transparent'}`, // Glowing effect when dropping
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)', // Subtle elevation
            transition: 'border-color 0.2s', maxHeight: 'calc(100vh - 120px)'
        }}>
            {/* 🏷️ Column Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 16px 12px 16px' // More breathing room
            }}>
                {renaming ? (
                    <input ref={renameRef} value={newName}
                           onChange={e => setNewName(e.target.value)}
                           onBlur={handleRename}
                           onKeyDown={e => {
                               if (e.key === 'Enter') handleRename()
                               if (e.key === 'Escape') { setRenaming(false); setNewName(column.name) }
                           }}
                           style={{
                               flex: 1, background: 'var(--bg-input)', border: '1px solid var(--accent)',
                               borderRadius: '8px', padding: '6px 10px', fontSize: '14px',
                               fontWeight: 600, color: 'var(--text-primary)', outline: 'none',
                               boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)'
                           }} />
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                            {column.name}
                        </span>
                        <span style={{
                            fontSize: '12px', padding: '2px 8px', borderRadius: '12px',
                            background: 'var(--bg-card)', color: 'var(--text-muted)', fontWeight: 600,
                            border: '1px solid var(--border)'
                        }}>
                            {cards.length}
                        </span>
                    </div>
                )}

                <div style={{ position: 'relative' }}>
                    <button onClick={() => setMenuOpen(v => !v)}
                            style={{
                                padding: '6px', borderRadius: '8px', border: '1px solid transparent',
                                background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}>
                        <MoreHorizontal size={18} />
                    </button>

                    {menuOpen && (
                        <>
                            {/* Invisible backdrop to auto-close menu */}
                            <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setMenuOpen(false)} />

                            <div style={{
                                position: 'absolute', right: 0, top: '100%', width: '180px', marginTop: '6px',
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: '12px', padding: '6px', zIndex: 30,
                                boxShadow: '0 12px 32px rgba(0,0,0,0.4)', animation: 'fadeIn 0.15s ease-out'
                            }}>
                                <p style={{ padding: '6px 10px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    Column Actions
                                </p>
                                <button onClick={() => { setRenaming(true); setMenuOpen(false) }}
                                        style={menuItemStyle}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                                    <Pencil size={14} /> Rename Column
                                </button>
                                <button onClick={() => { setShowDeleteConfirm(true); setMenuOpen(false) }}
                                        style={{ ...menuItemStyle, color: 'var(--danger)' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                                    <Trash2 size={14} /> Delete Column
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* 🗂️ Cards Area */}
            <div ref={setNodeRef}
                 style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px 12px' }}>
                <SortableContext items={cards.map(c => c.id)}
                                 strategy={verticalListSortingStrategy}>
                    {cards.map(card => (
                        <KanbanCard key={card.id} card={card} onClick={onCardClick} />
                    ))}
                </SortableContext>

                {/* Inline Add Card Form */}
                {adding && (
                    <AddCardForm columnId={column.id} onClose={() => setAdding(false)} />
                )}
            </div>

            {/* ➕ Add Card Button (Footer) */}
            {!adding && (
                <div style={{ padding: '0 12px 12px 12px' }}>
                    <button onClick={() => setAdding(true)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 14px', borderRadius: '10px', border: '1px solid transparent',
                                background: 'transparent', color: 'var(--text-muted)',
                                fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                                width: '100%', transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}>
                        <Plus size={16} /> Add a card
                    </button>
                </div>
            )}

            {/* 🛑 Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Column"
                message={`Are you sure you want to delete the column "${column.name}"? All cards inside this column will be permanently deleted.`}
                confirmText="Delete"
            />
        </div>
    )
}

const menuItemStyle = {
    display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
    padding: '8px 10px', borderRadius: '8px', border: 'none',
    background: 'transparent', color: 'var(--text-secondary)',
    fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.1s'
}