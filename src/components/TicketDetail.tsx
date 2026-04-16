import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketApi } from '../api/tickets';
import type { Ticket } from '../types/ticket';

const statusConfig = {
  open: { bg: 'bg-white/10', text: 'text-text-primary', label: 'Open' },
  in_progress: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'In Progress' },
  closed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Closed' },
};

const categoryLabels: Record<string, { label: string, colorClass: string }> = {
  hardware: { label: 'HARDWARE', colorClass: 'bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]/20' },
  network: { label: 'NETWORK', colorClass: 'bg-[#a371f7]/10 text-[#a371f7] border-[#a371f7]/20' },
  access_rights: { label: 'ACCESS', colorClass: 'bg-[#d29922]/10 text-[#d29922] border-[#d29922]/20' },
  software: { label: 'SOFTWARE', colorClass: 'bg-[#58a6ff]/10 text-[#58a6ff] border-[#58a6ff]/20' },
  billing: { label: 'BILLING', colorClass: 'bg-[#e3b341]/10 text-[#e3b341] border-[#e3b341]/20' },
  consultation: { label: 'CONSULT', colorClass: 'bg-[#8957e5]/10 text-[#8957e5] border-[#8957e5]/20' },
  security: { label: 'SECURITY', colorClass: 'bg-[#f85149]/10 text-[#f85149] border-[#f85149]/20' },
  other: { label: 'OTHER', colorClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20' }
};

export function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadTicket();
  }, [id]);

  const loadTicket = async () => {
    if (!id) return;
    try {
      const data = await ticketApi.getById(Number(id));
      setTicket(data);
    } catch {
      setError('Заявка не найдена');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: Ticket['status']) => {
    if (!ticket) return;
    setUpdating(true);
    try {
      const updated = await ticketApi.updateStatus(ticket.id, { status });
      setTicket(updated);
    } catch {
      setError('Не удалось обновить статус');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!ticket || !window.confirm('Удалить эту заявку?')) return;
    setUpdating(true);
    try {
      await ticketApi.delete(ticket.id);
      navigate('/tickets');
    } catch {
      setError('Не удалось удалить заявку');
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 flex-grow">
        <div className="w-10 h-10 border-4 border-border-dark border-t-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="text-center py-20 bg-bg-card rounded-2xl border border-red-500/20 shadow-sm">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-text-secondary text-lg font-medium">{error || 'Заявка не найдена'}</p>
        <button 
          onClick={() => navigate('/tickets')} 
          className="mt-4 btn-secondary"
        >
          ← Back to Tickets
        </button>
      </div>
    );
  }

  const status = statusConfig[ticket.status] || statusConfig.open;
  const category = categoryLabels[ticket.category] || categoryLabels.other;
  const date = new Date(ticket.created_at).toLocaleString('ru-RU');

  return (
    <div className="max-w-3xl mx-auto animate-fade-in w-full text-text-primary">
      <button
        onClick={() => navigate('/tickets')}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors font-medium outline-none"
      >
        <span>←</span>
        <span>Back to Tickets</span>
      </button>

      <div className="bg-bg-card rounded-2xl border border-border-dark overflow-hidden shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-border-dark bg-white/[0.02]">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-[13px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded">#{ticket.id}</span>
            <span className={`px-3 py-1 rounded-full text-[11px] font-medium tracking-[0.5px] ${status.bg} ${status.text}`}>
              {status.label}
            </span>
            <div className="flex items-center gap-2 bg-black/20 border border-border-dark px-[8px] py-[4px] rounded-full w-fit text-[12px] font-medium">
              <div className={`w-[8px] h-[8px] rounded-full ${ticket.priority === 'high' ? 'bg-[#f85149]' : ticket.priority === 'low' ? 'bg-[#3081f7]' : 'bg-[#d29922]'}`}></div>
              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
            </div>
            <span className={`border px-[8px] py-[2px] rounded-full text-[11px] font-medium tracking-[0.5px] ${category.colorClass}`}>
              {category.label}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-semibold text-text-primary leading-tight">{ticket.title}</h1>
          <p className="text-[13px] text-text-secondary mt-3 flex items-center gap-2">
            <span>Created: {date}</span>
          </p>
        </div>

        {/* Description */}
        <div className="p-6 border-b border-border-dark">
          <h2 className="text-[12px] font-bold text-text-secondary uppercase tracking-[1px] mb-4">Description</h2>
          <p className="text-text-primary/90 whitespace-pre-wrap leading-relaxed text-[15px]">{ticket.description}</p>
        </div>

        {/* AI Response */}
        {ticket.ai_response && (
          <div className={`p-6 bg-accent/5 border-b border-border-dark`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-accent">
                <span className="text-xl">✨</span>
                <h2 className="text-[12px] font-bold uppercase tracking-[1px]">
                  AI Processed Response
                </h2>
              </div>
              {ticket.ai_method && (
                <span className="text-[11px] px-2.5 py-1 bg-black/40 rounded-lg text-text-secondary border border-border-dark font-mono">
                  {ticket.ai_method}
                </span>
              )}
            </div>
            <div className="bg-black/20 rounded-xl p-4 border border-border-dark">
              <p className="text-text-primary/90 leading-relaxed text-[14px]">{ticket.ai_response}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 bg-white/[0.01]">
          <h2 className="text-[12px] font-bold text-text-secondary uppercase tracking-[1px] mb-4">
            Actions
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            {(['open', 'in_progress', 'closed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={updating || ticket.status === s}
                className={`px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  ticket.status === s
                    ? statusConfig[s].bg + ' ' + statusConfig[s].text + ' ring-1 ring-offset-2 ring-offset-bg-main ring-accent'
                    : 'bg-black/20 border border-border-dark text-text-secondary hover:bg-white/5 hover:text-text-primary hover:border-accent'
                } disabled:opacity-50 disabled:cursor-not-allowed outline-none`}
              >
                {statusConfig[s].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleDelete}
          disabled={updating}
          className="flex items-center gap-2 px-4 py-2 hover:bg-red-500/20 text-text-secondary hover:text-red-400 rounded-xl text-[14px] font-medium transition-colors disabled:opacity-50 outline-none"
        >
          <span className="text-lg">🗑️</span>
          <span>Delete Ticket</span>
        </button>
      </div>
    </div>
  );
}
