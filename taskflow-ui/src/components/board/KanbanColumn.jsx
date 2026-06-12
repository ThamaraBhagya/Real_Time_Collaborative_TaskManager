// src/components/board/KanbanColumn.jsx
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanCard from './KanbanCard'
import AddCardForm from './AddCardForm'
import { useState } from 'react'
import { Plus, MoreHorizontal } from 'lucide-react'

export default function KanbanColumn({ column, onCardClick }) {
    const [adding, setAdding] = useState(false)

    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
        data: { type: 'column', column }
    })

    const cards = [...(column.cards || [])].sort((a, b) => a.position - b.position)

    return (
        <div className="flex-shrink-0 w-72 flex flex-col rounded-xl"
             style={{background:'var(--bg-secondary)',
                 border: isOver ? '1px solid var(--accent)' : '1px solid var(--border)'}}>

            {/* Column header */}
            <div className="flex items-center justify-between px-4 py-3"
                 style={{borderBottom:'1px solid var(--border)'}}>
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{column.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{background:'var(--bg-card)',color:'var(--text-muted)'}}>
            {cards.length}
          </span>
                </div>
                <button className="p-1 rounded opacity-0 group-hover:opacity-100"
                        style={{color:'var(--text-muted)'}}>
                    <MoreHorizontal size={14}/>
                </button>
            </div>

            {/* Cards */}
            <div ref={setNodeRef}
                 className="flex-1 overflow-y-auto px-3 py-3"
                 style={{minHeight: '60px', maxHeight: 'calc(100vh - 240px)'}}>
                <SortableContext
                    items={cards.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {cards.map(card => (
                        <KanbanCard key={card.id} card={card} onClick={onCardClick}/>
                    ))}
                </SortableContext>

                {adding && (
                    <AddCardForm columnId={column.id} onClose={() => setAdding(false)}/>
                )}
            </div>

            {/* Add card button */}
            {!adding && (
                <button onClick={() => setAdding(true)}
                        className="flex items-center gap-2 px-4 py-3 text-sm w-full transition-all"
                        style={{color:'var(--text-muted)',
                            borderTop:'1px solid var(--border)'}}
                        onMouseEnter={e => e.currentTarget.style.color='var(--text-primary)'}
                        onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}>
                    <Plus size={14}/> Add card
                </button>
            )}
        </div>
    )
}