// src/components/board/KanbanCard.jsx
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar } from 'lucide-react'
import { format, isPast } from 'date-fns'
import Avatar from '../ui/Avatar'

const PRIORITIES = {
    LOW:    { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
    MEDIUM: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
    HIGH:   { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
    URGENT: { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
}

export default function KanbanCard({ card, onClick }) {
    const { attributes, listeners, setNodeRef,
        transform, transition, isDragging } = useSortable({
        id: card.id,
        data: { type: 'card', card }
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 2 : 1,
    }

    const priority = PRIORITIES[card.priority] || PRIORITIES.MEDIUM
    const isOverdue = card.dueDate && isPast(new Date(card.dueDate))

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}
             onClick={() => onClick(card)}>

            <div style={{
                background: 'var(--bg-card)',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                marginBottom: '14px',
                padding: '16px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease',
                display: 'flex', flexDirection: 'column', gap: '12px'
            }}
                 onMouseEnter={e => {
                     e.currentTarget.style.borderColor = 'var(--accent)'
                     e.currentTarget.style.transform = 'translateY(-2px)'
                     e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
                 }}
                 onMouseLeave={e => {
                     e.currentTarget.style.borderColor = 'var(--border)'
                     e.currentTarget.style.transform = 'none'
                     e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)'
                 }}>


                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                        fontSize: '11px', fontWeight: 700, padding: '4px 8px',
                        borderRadius: '6px', background: priority.bg, color: priority.color,
                        letterSpacing: '0.04em'
                    }}>
                        {card.priority}
                    </span>

                    {card.dueDate && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '4px 8px', borderRadius: '6px',
                            background: isOverdue ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-hover)',
                            color: isOverdue ? 'var(--danger)' : 'var(--text-muted)',
                            fontSize: '11px', fontWeight: 600, marginLeft: 'auto'
                        }}>
                            <Calendar size={12} />
                            <span>{format(new Date(card.dueDate), 'MMM d')}</span>
                        </div>
                    )}
                </div>


                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <p style={{
                        fontSize: '15px', fontWeight: 600, lineHeight: '1.4',
                        color: 'var(--text-primary)', margin: 0,
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        wordBreak: 'break-word'
                    }}>
                        {card.title}
                    </p>


                    {card.description && card.description.trim().length > 0 && (
                        <div style={{
                            fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0 0',
                            lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word'
                        }}>
                            {card.description}
                        </div>
                    )}
                </div>

                {/* 👤 Bottom Row: Assignee */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                    marginTop: '4px'
                }}>
                    {card.assigneeUsername && (
                        <div title={`Assigned to ${card.assigneeUsername}`} style={{ display: 'flex' }}>
                            <Avatar username={card.assigneeUsername} avatarUrl={card.assigneeAvatarUrl} size={28} />
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}