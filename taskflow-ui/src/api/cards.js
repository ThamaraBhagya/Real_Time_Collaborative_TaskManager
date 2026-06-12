// src/api/cards.js
import api from './axios'
export const createCard = (columnId, data) => api.post(`/columns/${columnId}/cards`, data)
export const updateCard = (cardId, data) => api.patch(`/cards/${cardId}`, data)
export const moveCard = (cardId, data) => api.patch(`/cards/${cardId}/move`, data)
export const deleteCard = (cardId) => api.delete(`/cards/${cardId}`)