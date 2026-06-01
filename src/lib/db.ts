import type { Ticket, CreateTicketPayload, UpdateStatusPayload } from '@/types/ticket';

// In-memory store for the preview environment
const globalForDb = global as unknown as { tickets?: Ticket[] };

export const dbData = globalForDb.tickets || [];

if (process.env.NODE_ENV !== 'production') {
  globalForDb.tickets = dbData;
}
