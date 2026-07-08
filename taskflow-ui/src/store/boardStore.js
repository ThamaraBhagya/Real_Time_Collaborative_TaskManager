// src/store/boardStore.js
import { create } from 'zustand'

export const useBoardStore = create((set, get) => ({
    board: null,
    loading: false,
    recentEvents: [],

    isDeleted: false,


    setBoard: (board) => set({ board, isDeleted: false }),

    pushEvent: (event) => set(state => ({
        recentEvents: [...state.recentEvents.slice(-50), event]
    })),

    applyEvent: (event) => {
        const board = get().board
        if (!board || board.id !== event.boardId) return

        if (event.type === 'BOARD_DELETED') {
            set({ board: null, isDeleted: true })
            return
        }

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

                    for (const col of b.columns) {
                        col.cards = col.cards.filter(c => c.id !== event.payload.id)
                    }

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
                    // Avoid duplicate if REST response already added it optimistically
                    const exists = b.columns.some(c => c.id === event.payload.id)
                    if (!exists) b.columns.push({ ...event.payload, cards: [] })
                    break
                }

                case 'COLUMN_UPDATED': {
                    const col = b.columns.find(c => c.id === event.payload.id)
                    if (col) col.name = event.payload.name
                    break
                }

                case 'COLUMN_DELETED': {
                    b.columns = b.columns.filter(c => c.id !== event.payload)
                    break
                }

                case 'MEMBER_ADDED': {
                    const alreadyMember = b.members.some(m => m.userId === event.payload.userId)
                    if (!alreadyMember) b.members.push(event.payload)
                    break
                }

                case 'MEMBER_REMOVED': {
                    b.members = b.members.filter(m => m.userId !== event.payload)
                    break
                }

                case 'MEMBER_ROLE_UPDATED': {
                    const member = b.members.find(m => m.userId === event.payload.userId)
                    if (member) member.role = event.payload.role
                    break
                }

                case 'BOARD_UPDATED': {
                    b.name = event.payload.name ?? b.name
                    b.description = event.payload.description ?? b.description
                    break
                }
            }

            return { board: b }
        })
    }
}))