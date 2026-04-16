export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  category: 'hardware' | 'network' | 'access_rights' | 'software' | 'billing' | 'consultation' | 'security' | 'other';
  ai_response?: string;
  ai_method?: string;
  created_at: string;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  category?: 'hardware' | 'network' | 'access_rights' | 'software' | 'billing' | 'consultation' | 'security' | 'other';
  ai_response?: string;
}

export interface UpdateStatusPayload {
  status: 'open' | 'in_progress' | 'closed';
}
