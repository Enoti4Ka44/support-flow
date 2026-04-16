import axios from 'axios';
import type { Ticket, CreateTicketPayload, UpdateStatusPayload } from '../types/ticket';

const api = axios.create({
  baseURL: '/api',
});

export const ticketApi = {
  getAll: async (): Promise<Ticket[]> => {
    const { data } = await api.get('/tickets');
    return data;
  },

  getById: async (id: number): Promise<Ticket> => {
    const { data } = await api.get(`/tickets/${id}`);
    return data;
  },

  create: async (payload: CreateTicketPayload): Promise<Ticket> => {
    const { data } = await api.post('/tickets', payload);
    return data;
  },

  updateStatus: async (id: number, payload: UpdateStatusPayload): Promise<Ticket> => {
    const { data } = await api.patch(`/tickets/${id}/status`, payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/tickets/${id}`);
  },
};
