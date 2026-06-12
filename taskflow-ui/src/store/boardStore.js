// src/store/boardStore.js
import { create } from 'zustand'

export const useBoardStore = create((set, get) => ({
    board: null,
    loading: false,

    recentEvents: [],
    pushEvent: (event) => set(state => ({
        recentEvents: [event, ...state.recentEvents].slice(0, 50) // Aluth ewa udata enna
    })),

    setBoard: (board) => set({ board }),

    // Called when a WebSocket event arrives
    applyEvent: (event) => {
        const board = get().board
        if (!board || board.id !== event.boardId) return

        set(state => {
            const b = structuredClone(state.board)

            switch (event.type) {
                case 'CARD_CREATED': {
                    const col = b.columns.find(c => c.id === event.payload.columnId)
                    if (col) col.cards.push(event.payload)
                    break
                }
                case 'CARD_UPDATED': {
                    for (const col of b.columns) {
                        const idx = col.cards.findIndex(c => c.id === event.payload.id)
                        if (idx !== -1) { col.cards[idx] = event.payload; break }
                    }
                    break
                }
                case 'CARD_MOVED': {
                    // Remove from old column
                    for (const col of b.columns) {
                        col.cards = col.cards.filter(c => c.id !== event.payload.id)
                    }
                    // Insert into new column at correct position
                    const targetCol = b.columns.find(c => c.id === event.payload.columnId)
                    if (targetCol) {
                        targetCol.cards.splice(event.payload.position, 0, event.payload)
                    }
                    break
                }
                case 'CARD_DELETED': {
                    for (const col of b.columns) {
                        col.cards = col.cards.filter(c => c.id !== event.payload)
                    }
                    break
                }
                case 'COLUMN_CREATED': {
                    b.columns.push({ ...event.payload, cards: [] })
                    break
                }
                case 'MEMBER_ADDED': {
                    b.members.push(event.payload)
                    break
                }
            }
            return { board: b }
        })
    }
}))