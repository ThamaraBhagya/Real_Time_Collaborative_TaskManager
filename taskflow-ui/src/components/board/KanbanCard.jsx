// src/components/board/KanbanCard.jsx
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PriorityBadge from '../ui/PriorityBadge'
import { Calendar, User } from 'lucide-react'
import { format } from 'date-fns'

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
    }

    const isOverdue = card.dueDate && new Date(card.dueDate) < new Date()

    return (
        <div
            ref={setNodeRef}
            style={{...style, background:'var(--bg-card)',
                border:'1px solid var(--border)'}}
            className="p-3 rounded-xl mb-2 group hover:border-[var(--border-hover)] transition-all"
            {...attributes}
            {...listeners}
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm leading-snug"
                   style={{color:'var(--text-primary)'}}
                   onClick={(e) => { e.stopPropagation(); onClick(card) }}>
                    {card.title}
                </p>
                <PriorityBadge priority={card.priority}/>
            </div>

            {card.description && (
                <p className="text-xs mb-2 line-clamp-2"
                   style={{color:'var(--text-muted)'}}>
                    {card.description}
                </p>
            )}

            <div className="flex items-center justify-between mt-2">
                {card.assigneeUsername ? (
                    <div className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                             style={{background:'var(--accent)'}}>
                            {card.assigneeUsername[0].toUpperCase()}
                        </div>
                        <span className="text-xs" style={{color:'var(--text-muted)'}}>
              {card.assigneeUsername}
            </span>
                    </div>
                ) : <span/>}

                {card.dueDate && (
                    <div className="flex items-center gap-1"
                         style={{color: isOverdue ? 'var(--danger)' : 'var(--text-muted)'}}>
                        <Calendar size={11}/>
                        <span className="text-xs">
              {format(new Date(card.dueDate), 'MMM d')}
            </span>
                    </div>
                )}
            </div>
        </div>
    )
}