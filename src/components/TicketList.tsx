import { TicketCard } from "./TicketCard";
import type { Ticket } from "../types/ticket";

interface TicketListProps {
  tickets: Ticket[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export function TicketList({
  tickets,
  loading,
  error,
  onRefresh,
}: TicketListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 animate-fade-in flex-grow">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-border-dark border-t-accent rounded-full animate-spin"></div>
          <p className="text-text-secondary font-medium">Загрузка заявок...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-red-400 font-medium">{error}</p>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="text-red-300 text-sm hover:underline mt-1 focus:outline-none"
              >
                Повторить попытку
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-20 bg-bg-card rounded-2xl border border-dashed border-border-dark animate-fade-in flex-grow">
        <div className="text-5xl mb-4 text-text-secondary">📭</div>
        <p className="text-text-primary text-lg font-medium">
          Заявок не найдено
        </p>
        <p className="text-text-secondary mt-1">
          Они появятся здесь после создания
        </p>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-border-dark rounded-xl flex-grow overflow-x-auto w-full relative">
      <div className="min-w-[800px]">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="bg-white/5 px-5 py-3 text-[12px] font-semibold text-text-secondary uppercase border-b border-border-dark">
                Тикет
              </th>
              <th className="bg-white/5 px-5 py-3 text-[12px] font-semibold text-text-secondary uppercase border-b border-border-dark">
                Название
              </th>
              <th className="bg-white/5 px-5 py-3 text-[12px] font-semibold text-text-secondary uppercase border-b border-border-dark">
                AI Тег
              </th>
              <th className="bg-white/5 px-5 py-3 text-[12px] font-semibold text-text-secondary uppercase border-b border-border-dark">
                Приоритет
              </th>
              <th className="bg-white/5 px-5 py-3 text-[12px] font-semibold text-text-secondary uppercase border-b border-border-dark">
                Статус
              </th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket, index) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
