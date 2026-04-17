import { useNavigate } from "react-router-dom";
import type { Ticket } from "../types/ticket";

const statusConfig = {
  open: { bg: "bg-white/10", text: "text-text-primary", label: "Open" },
  in_progress: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    label: "In Progress",
  },
  closed: {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    label: "Closed",
  },
};

const categoryLabels: Record<string, { label: string; colorClass: string }> = {
  hardware: {
    label: "HARDWARE",
    colorClass: "bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]/20",
  },
  network: {
    label: "NETWORK",
    colorClass: "bg-[#a371f7]/10 text-[#a371f7] border-[#a371f7]/20",
  },
  access_rights: {
    label: "ACCESS",
    colorClass: "bg-[#d29922]/10 text-[#d29922] border-[#d29922]/20",
  },
  software: {
    label: "SOFTWARE",
    colorClass: "bg-[#58a6ff]/10 text-[#58a6ff] border-[#58a6ff]/20",
  },
  billing: {
    label: "BILLING",
    colorClass: "bg-[#e3b341]/10 text-[#e3b341] border-[#e3b341]/20",
  },
  consultation: {
    label: "CONSULT",
    colorClass: "bg-[#8957e5]/10 text-[#8957e5] border-[#8957e5]/20",
  },
  security: {
    label: "SECURITY",
    colorClass: "bg-[#f85149]/10 text-[#f85149] border-[#f85149]/20",
  },
  other: {
    label: "OTHER",
    colorClass: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
};

export function TicketCard({
  ticket,
  ...props
}: {
  ticket: Ticket;
  [key: string]: any;
}) {
  const navigate = useNavigate();
  const status = statusConfig[ticket.status] || statusConfig.open;
  const category = categoryLabels[ticket.category] || categoryLabels.other;

  // Overdue logic: High priority, open/in_progress, > 15 mins old
  const SLA_MINUTES = {
    high: 15,
    medium: 60,
    low: 1440,
  };

  const isOverdue = (() => {
    if (ticket.status === "closed") return false;

    const createdTime = new Date(ticket.created_at + "Z").getTime();
    const now = new Date().getTime();
    const diffMins = (now - createdTime) / 60000;

    const limit =
      SLA_MINUTES[ticket.priority as keyof typeof SLA_MINUTES] || 60;

    return diffMins > limit;
  })();
  return (
    <tr
      onClick={() => navigate(`/tickets/${ticket.id}`)}
      className={`cursor-pointer transition-colors border-b border-border-dark ${isOverdue ? "bg-red-500/10 hover:bg-red-500/20" : "hover:bg-white/5"}`}
    >
      <td className="px-5 py-4 text-[14px]">
        <span className="text-accent bg-accent/10 px-2 py-1 rounded">
          #T-{ticket.id}
        </span>
      </td>
      <td className="px-5 py-4 text-[14px]">
        <div className="flex flex-col gap-1">
          <span>{ticket.title}</span>
          <span className="text-[11px] text-text-secondary">
            {new Date(ticket.created_at + "Z").toLocaleString("ru-RU")}
            {isOverdue && (
              <span className="text-red-400 ml-2 font-medium">
                ⚠️ Просрочена (&gt; {SLA_MINUTES[ticket.priority]}мин)
              </span>
            )}
          </span>
        </div>
      </td>
      <td className="px-5 py-4 text-[14px]">
        <span
          className={`border px-[8px] py-[2px] rounded-full text-[11px] font-medium tracking-[0.5px] ${category.colorClass}`}
        >
          {category.label}
        </span>
      </td>
      <td className="px-5 py-4 text-[14px]">
        <div className="flex items-center gap-2 bg-black/20 border border-border-dark px-[8px] py-[4px] rounded-full w-fit text-[12px] font-medium">
          <div
            className={`w-[8px] h-[8px] rounded-full ${ticket.priority === "high" ? "bg-[#f85149]" : ticket.priority === "low" ? "bg-[#3081f7]" : "bg-[#d29922]"}`}
          ></div>
          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
        </div>
      </td>
      <td className="px-5 py-4 text-[14px]">
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${status.bg} ${status.text}`}
        >
          {status.label}
        </span>
      </td>
    </tr>
  );
}
