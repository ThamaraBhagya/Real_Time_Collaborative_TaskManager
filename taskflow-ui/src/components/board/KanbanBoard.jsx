// src/components/board/KanbanBoard.jsx
import { useState } from 'react'
import {
    DndContext, DragOverlay, PointerSensor,
    useSensor, useSensors, closestCorners
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import KanbanColumn from './KanbanColumn'
import KanbanCard from './KanbanCard'
import CardModal from './CardModal'
import { moveCard } from '../../api/cards'
import { useBoardStore } from '../../store/boardStore'
import toast from 'react-hot-toast'

export default function KanbanBoard({ board }) {
    const [activeCard, setActiveCard] = useState(null)
    const [selectedCard, setSelectedCard] = useState(null)
    const setBoard = useBoardStore(s => s.setBoard)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 } // prevent accidental drags
        })
    )

    const findColumnOfCard = (cardId) =>
        board.columns.find(col => col.cards?.some(c => c.id === cardId))

    const handleDragStart = ({ active }) => {
        if (active.data.current?.type === 'card') {
            setActiveCard(active.data.current.card)
        }
    }

    const handleDragEnd = async ({ active, over }) => {
        setActiveCard(null)
        if (!over) return

        const cardId = active.id
        const sourceColumn = findColumnOfCard(cardId)
        if (!sourceColumn) return

        // Dropped on a column or a card?
        const overIsColumn = over.data.current?.type === 'column'
        const targetColumnId = overIsColumn
            ? over.id
            : findColumnOfCard(over.id)?.id

        if (!targetColumnId) return

        const targetColumn = board.columns.find(c => c.id === targetColumnId)
        const cards = [...(targetColumn.cards || [])].sort((a, b) => a.position - b.position)

        let newPosition
        if (overIsColumn) {
            newPosition = cards.filter(c => c.id !== cardId).length
        } else {
            const overIndex = cards.findIndex(c => c.id === over.id)
            newPosition = overIndex >= 0 ? overIndex : cards.length
        }

        // Optimistic update — update UI immediately, API call in background
        const updatedBoard = structuredClone(board)
        const srcCol = updatedBoard.columns.find(c => c.id === sourceColumn.id)
        const card = srcCol.cards.find(c => c.id === cardId)
        srcCol.cards = srcCol.cards.filter(c => c.id !== cardId)
        const tgtCol = updatedBoard.columns.find(c => c.id === targetColumnId)
        tgtCol.cards.splice(newPosition, 0, { ...card, columnId: targetColumnId, position: newPosition })
        setBoard(updatedBoard)

        try {
            await moveCard(cardId, { targetColumnId, newPosition })
            // WS event will sync all other clients
        } catch {
            toast.error('Failed to move card')
            setBoard(board) // revert on error
        }
    }

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4 p-6 overflow-x-auto min-h-full">
                    {[...(board.columns || [])]
                        .sort((a, b) => a.position - b.position)
                        .map(column => (
                            <KanbanColumn
                                key={column.id}
                                column={column}
                                onCardClick={setSelectedCard}
                            />
                        ))}
                </div>

                {/* Ghost card shown while dragging */}
                <DragOverlay>
                    {activeCard && (
                        <div style={{transform:'rotate(2deg)', opacity:0.9}}>
                            <KanbanCard card={activeCard} onClick={() => {}}/>
                        </div>
                    )}
                </DragOverlay>
            </DndContext>

            {selectedCard && (
                <CardModal
                    card={selectedCard}
                    onClose={() => setSelectedCard(null)}
                />
            )}
        </>
    )
}