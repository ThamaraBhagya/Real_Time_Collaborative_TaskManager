// src/api/boards.js
import api from './axios'
export const getBoards = () => api.get('/boards')
export const getBoard = (id) => api.get(`/boards/${id}`)
export const createBoard = (data) => api.post('/boards', data)
export const addMember = (boardId, data) => api.post(`/boards/${boardId}/members`, data)
export const addColumn = (boardId, data) => api.post(`/boards/${boardId}/columns`, data)
export const updateBoard = (boardId, data) =>
    api.patch(`/boards/${boardId}`, data)

export const deleteBoard = (boardId) =>
    api.delete(`/boards/${boardId}`)

export const removeMember = (boardId, userId) =>
    api.delete(`/boards/${boardId}/members/${userId}`)

export const updateMemberRole = (boardId, userId, role) =>
    api.patch(`/boards/${boardId}/members/${userId}`, { role })

export const renameColumn = (id, name) => api.patch(`/boards/columns/${id}`, { name })
export const deleteColumn = (id) => api.delete(`/boards/columns/${id}`)