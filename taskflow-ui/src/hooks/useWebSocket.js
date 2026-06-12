// src/hooks/useWebSocket.js
import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useBoardStore } from '../store/boardStore'
import { useAuthStore } from '../store/authStore'

export function useWebSocket(boardId) {
    const clientRef = useRef(null)
    const applyEvent = useBoardStore(s => s.applyEvent)
    const accessToken = useAuthStore(s => s.accessToken)
    const pushEvent = useBoardStore(s => s.pushEvent)

    useEffect(() => {
        if (!boardId || !accessToken) return

        const client = new Client({
            webSocketFactory: () =>
                new SockJS(`/ws?token=${accessToken}`),

            onConnect: () => {
                // Subscribe to board events
                client.subscribe(`/topic/board/${boardId}`, (msg) => {
                    try {
                        const event = JSON.parse(msg.body)
                        applyEvent(event)
                        pushEvent(event)
                    } catch (e) {
                        console.error('WS parse error', e)
                    }
                })
            },

            onStompError: (frame) => {
                console.error('STOMP error:', frame)
            },

            reconnectDelay: 3000,
        })

        client.activate()
        clientRef.current = client

        return () => {
            client.deactivate()
        }
    }, [boardId, accessToken])

    return clientRef
}