import { useState, useEffect, useMemo } from 'react';
import { TicketList } from '../components/TicketList';
import { ticketApi } from '../api/tickets';
import type { Ticket } from '../types/ticket';

export function TicketListPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const data = await ticketApi.getAll();
      setTickets(data);
    } catch {
      setError('Не удалось загрузить заявки');
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchSearch = search === '' || 
        ticket.title.toLowerCase().includes(search.toLowerCase()) ||
        ticket.description.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      const matchCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
      return matchSearch && matchStatus && matchPriority && matchCategory;
    });
  }, [tickets, search, statusFilter, priorityFilter, categoryFilter]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in h-full">
      <header className="flex justify-between items-center w-full">
        <h1 className="text-xl font-semibold">Обзор заявок</h1>
      </header>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-bg-card border border-border-dark p-4 rounded-xl">
          <div className="text-[12px] text-text-secondary uppercase tracking-[0.5px] mb-2">Unassigned</div>
          <div className="text-[24px] font-semibold">{tickets.filter(t => t.status === 'open').length}</div>
        </div>
        <div className="bg-bg-card border border-border-dark p-4 rounded-xl">
          <div className="text-[12px] text-text-secondary uppercase tracking-[0.5px] mb-2">In Progress</div>
          <div className="text-[24px] font-semibold">{tickets.filter(t => t.status === 'in_progress').length}</div>
        </div>
        <div className="bg-bg-card border border-border-dark p-4 rounded-xl">
          <div className="text-[12px] text-text-secondary uppercase tracking-[0.5px] mb-2">Avg. AI Accuracy</div>
          <div className="text-[24px] font-semibold">94.2%</div>
        </div>
        <div className="bg-bg-card border border-border-dark p-4 rounded-xl">
          <div className="text-[12px] text-text-secondary uppercase tracking-[0.5px] mb-2">Route Latency</div>
          <div className="text-[24px] font-semibold">0.8s</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Search tickets by ID, user or tag..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-bg-card border border-border-dark px-4 py-2 rounded-lg w-[300px] text-text-secondary text-[13px] outline-none focus:border-accent"
        />

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-bg-card border border-border-dark px-4 py-2 rounded-lg text-text-secondary text-[13px] outline-none focus:border-accent"
        >
          <option value="all">Status: All</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="bg-bg-card border border-border-dark px-4 py-2 rounded-lg text-text-secondary text-[13px] outline-none focus:border-accent"
        >
          <option value="all">Priority: All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-bg-card border border-border-dark px-4 py-2 rounded-lg text-text-secondary text-[13px] outline-none focus:border-accent"
        >
          <option value="all">Category: All</option>
          <option value="hardware">Hardware</option>
          <option value="network">Network</option>
          <option value="access_rights">Access Rights</option>
          <option value="software">Software</option>
          <option value="billing">Billing</option>
          <option value="consultation">Consultation</option>
          <option value="security">Security</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="flex-1 flex gap-5 overflow-hidden">
        <TicketList tickets={filteredTickets} loading={loading} error={error} onRefresh={loadTickets} />

        <div className="w-[280px] bg-accent/5 border border-dashed border-accent rounded-xl p-5 flex flex-col gap-3 shrink-0">
          <div className="text-[13px] font-semibold flex items-center gap-2 text-accent">
            <span>✨</span> AI Routing Insights
          </div>
          <p className="text-[12px] text-text-secondary">Last Processed: <b>#T-Latest</b></p>
          <div className="text-[12px] leading-relaxed text-text-secondary bg-black/20 p-3 rounded-lg border border-border-dark">
            <b>Analysis:</b><br/>
            Real-time ai categorizer active.<br/><br/>
            <b>Classification:</b><br/>
            - Tags issues directly.<br/>
            - Maps priority automatically.<br/><br/>
            <b>Action:</b><br/>
            Routing to designated tier lists.
          </div>
          <div className="mt-auto border-t border-border-dark pt-3">
            <div className="text-[10px] text-text-secondary uppercase tracking-[0.5px] mb-1">Auto-tagging load</div>
            <div className="h-1 bg-border-dark rounded-sm w-full overflow-hidden">
              <div className="w-[65%] h-full bg-accent rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
