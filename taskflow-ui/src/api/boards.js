// src/api/boards.js
import api from './axios'
export const getBoards = () => api.get('/boards')
export const getBoard = (id) => api.get(`/boards/${id}`)
export const createBoard = (data) => api.post('/boards', data)
export const addMember = (boardId, data) => api.post(`/boards/${boardId}/members`, data)
export const addColumn = (boardId, data) => api.post(`/boards/${boardId}/columns`, data)