import { useState, useEffect, useMemo } from "react";
import { TicketList } from "../components/TicketList";
import { ticketApi } from "../api/tickets";
import type { Ticket } from "../types/ticket";
import { timeAgo } from "../utils/date-formatter";
import { b, p, span } from "motion/react-client";
import { Sparkles } from "lucide-react";

export function TicketListPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const data = await ticketApi.getAll();
      setTickets(data);
    } catch {
      setError("Не удалось загрузить заявки");
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchSearch =
        search === "" ||
        ticket.title.toLowerCase().includes(search.toLowerCase()) ||
        ticket.description.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" || ticket.status === statusFilter;
      const matchPriority =
        priorityFilter === "all" || ticket.priority === priorityFilter;
      const matchCategory =
        categoryFilter === "all" || ticket.category === categoryFilter;
      return matchSearch && matchStatus && matchPriority && matchCategory;
    });
  }, [tickets, search, statusFilter, priorityFilter, categoryFilter]);

  const oldestTicket = useMemo(() => {
    const openTickets = tickets.filter((t) => t.status === "open");

    if (openTickets.length === 0) return null;

    return openTickets.reduce((oldest, current) => {
      const currentTime = new Date(current.created_at + "Z").getTime();
      const oldestTime = new Date(oldest.created_at + "Z").getTime();

      return currentTime < oldestTime ? current : oldest;
    });
  }, [tickets]);

  const slaRiskCount = useMemo(() => {
    const now = new Date().getTime();
    return tickets.filter((t) => {
      if (t.status === "closed") return false;
      const createdTime = new Date(t.created_at + "Z").getTime();
      const diffMins = (now - createdTime) / 60000;
      if (t.priority === "high" && 15 > diffMins && diffMins > 10) return true; // SLA is 15
      if (t.priority === "medium" && 60 > diffMins && diffMins > 45)
        return true; // SLA is 60
      if (t.priority === "low" && 1440 > diffMins && diffMins > 1380)
        return true; // SLA is 1440 (24h)
      return false;
    }).length;
  }, [tickets]);

  const overdueCount = useMemo(() => {
    const now = new Date().getTime();

    return tickets.filter((t) => {
      if (t.status === "closed") return false;

      const createdTime = new Date(t.created_at + "Z").getTime();
      const diffMins = (now - createdTime) / 60000;

      if (t.priority === "high" && diffMins > 15) return true;
      if (t.priority === "medium" && diffMins > 60) return true;
      if (t.priority === "low" && diffMins > 1440) return true;

      return false;
    }).length;
  }, [tickets]);

  const systemLoadInfo = useMemo(() => {
    const openTickets = tickets.filter((t) => t.status !== "closed");
    let loadValue = 0;
    openTickets.forEach((t) => {
      if (t.priority === "high") loadValue += 3;
      else if (t.priority === "medium") loadValue += 2;
      else loadValue += 1;
    });
    // Let's say ~30 points is 100% load
    const percentage = Math.min(100, Math.round((loadValue / 30) * 100));
    return percentage;
  }, [tickets]);

  const lastClosedTicket = useMemo(() => {
    const closedTickets = tickets.filter((t) => t.status === "closed");

    if (closedTickets.length === 0) return null;

    return closedTickets.reduce((latest, current) => {
      const currentTime = new Date(current.created_at + "Z").getTime();
      const latestTime = new Date(latest.created_at + "Z").getTime();

      return currentTime > latestTime ? current : latest;
    });
  }, [tickets]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in h-full">
      <header className="flex justify-between items-center w-full">
        <h1 className="text-xl font-semibold">Обзор заявок</h1>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-bg-card border border-border-dark p-4 rounded-xl">
          <div className="text-[12px] text-text-secondary uppercase tracking-[0.5px] mb-2">
            SLA Risk
          </div>
          <div className="text-[24px] font-semibold text-red-400">
            {slaRiskCount}
          </div>
          <div className="text-[11px] text-text-secondary mt-1">
            Заявки близки к просрочке
          </div>
        </div>
        <div className="bg-bg-card border border-border-dark p-4 rounded-xl">
          <div className="text-[12px] text-text-secondary uppercase tracking-[0.5px] mb-2">
            Просроченные
          </div>
          <div className="text-[24px] font-semibold text-red-400">
            {overdueCount}
          </div>
          <div className="text-[11px] text-text-secondary mt-1">
            Нарушен SLA
          </div>
        </div>
        <div className="bg-bg-card border border-border-dark p-4 rounded-xl">
          <div className="text-[12px] text-text-secondary uppercase tracking-[0.5px] mb-2">
            Средняя точность ИИ
          </div>
          <div className="text-[24px] font-semibold">94.2%</div>
        </div>
        <div className="bg-bg-card border border-border-dark p-4 rounded-xl">
          <div className="text-[12px] text-text-secondary uppercase tracking-[0.5px] mb-2">
            Задержка сети
          </div>
          <div className="text-[24px] font-semibold">0.8s</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Поиск тикетов по названию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-bg-card border border-border-dark px-4 py-2 rounded-lg w-[300px] text-text-secondary text-[13px] outline-none focus:border-accent"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-bg-card border border-border-dark px-4 py-2 rounded-lg text-text-secondary text-[13px] outline-none focus:border-accent"
        >
          <option value="all">Статус: Все</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-bg-card border border-border-dark px-4 py-2 rounded-lg text-text-secondary text-[13px] outline-none focus:border-accent"
        >
          <option value="all">Приоритет: Все</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-bg-card border border-border-dark px-4 py-2 rounded-lg text-text-secondary text-[13px] outline-none focus:border-accent"
        >
          <option value="all">Категория: Все</option>
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

      <div className="flex-1 flex flex-col lg:flex-row gap-5 ">
        <TicketList
          tickets={filteredTickets}
          loading={loading}
          error={error}
          onRefresh={loadTickets}
        />

        <div className="w-full lg:w-[280px] shrink-0 bg-accent/5 border border-dashed border-accent rounded-xl p-5 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
          <div className="text-md font-semibold flex items-center gap-2 text-accent">
            <Sparkles className="w-5 h-5" /> Краткая статистика
          </div>
          <p className="text-[12px] text-text-secondary">
            Последний решенный:{" "}
            <b>
              {lastClosedTicket ? `#T-${lastClosedTicket.id}` : "Нет решенных"}
            </b>
          </p>
          <div className="text-sm leading-relaxed text-text-secondary bg-black/20 p-3 rounded-lg border border-border-dark whitespace-normal">
            <b>Сводка:</b>
            <br />
            Всего заявок: {tickets.length}
            <br />
            Открытые: {tickets.filter((t) => t.status === "open").length}
            <br />В работе:{" "}
            {tickets.filter((t) => t.status === "in_progress").length}
            <br />
            <br />
            <b>Приоритеты:</b>
            <br />
            High: {tickets.filter((t) => t.priority === "high").length}
            <br />
            Medium: {tickets.filter((t) => t.priority === "medium").length}
            <br />
            Low: {tickets.filter((t) => t.priority === "low").length}
            <br />
            <br />
            <b>Фокус:</b>
            <br />
            {oldestTicket ? (
              <p>
                Самый старый открытый тикет:{" "}
                <b>
                  #T-{oldestTicket.id} ({timeAgo(oldestTicket.created_at)})
                </b>
              </p>
            ) : (
              "Нет открытых заявок"
            )}
          </div>

          <div className="mt-auto border-t border-border-dark pt-3">
            <div className="text-[10px] text-text-secondary uppercase tracking-[0.5px] mb-1 flex justify-between">
              <span>Загруженность системы</span>
              <span>{systemLoadInfo}%</span>
            </div>
            <div className="h-1 bg-border-dark rounded-sm w-full overflow-hidden">
              <div
                className={`h-full rounded-sm transition-all duration-500 ${systemLoadInfo > 80 ? "bg-red-500" : systemLoadInfo > 50 ? "bg-yellow-500" : "bg-accent"}`}
                style={{ width: `${systemLoadInfo}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
