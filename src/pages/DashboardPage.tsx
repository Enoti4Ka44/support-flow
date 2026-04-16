import { useState, useEffect, useMemo } from "react";
import { ticketApi } from "../api/tickets";
import type { Ticket } from "../types/ticket";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AlertCircle } from "lucide-react";

const COLORS = [
  "#3fb950",
  "#a371f7",
  "#d29922",
  "#3081f7",
  "#f85149",
  "#e3b341",
  "#8b949e",
  "#58a6ff",
];

export function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketApi
      .getAll()
      .then((data) => {
        setTickets(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === "open").length;
    const inProgress = tickets.filter((t) => t.status === "in_progress").length;
    const closed = tickets.filter((t) => t.status === "closed").length;

    const now = new Date().getTime();
    const overdueHighParams = tickets.filter((t) => {
      if (t.status === "closed") return false;
      if (t.priority !== "high") return false;
      const createdTime = new Date(t.created_at + "Z").getTime();
      return now - createdTime > 15 * 60 * 1000;
    });

    return {
      total,
      open,
      inProgress,
      closed,
      overdueHighPriority: overdueHighParams,
    };
  }, [tickets]);

  const priorityData = useMemo(() => {
    const priorities = { high: 0, medium: 0, low: 0 };
    tickets.forEach((t) => {
      priorities[t.priority]++;
    });
    return Object.keys(priorities).map((key) => ({
      name: key,
      count: priorities[key as keyof typeof priorities],
    }));
  }, [tickets]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    tickets.forEach((t) => {
      categories[t.category] = (categories[t.category] || 0) + 1;
    });
    return Object.keys(categories).map((key) => ({
      name: key,
      count: categories[key],
    }));
  }, [tickets]);

  if (loading) {
    return <div className="p-10 text-text-secondary">Загрузка дашборда...</div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in h-full overflow-y-auto">
      <header className="flex justify-between items-center w-full">
        <h1 className="text-xl font-semibold">Дашборд аналитики</h1>
      </header>

      {/* Overdue high-priority alerts */}
      {stats.overdueHighPriority.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-red-500 w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-400 font-semibold mb-1 text-sm">
              Внимание! Есть просроченные срочные заявки (
              {stats.overdueHighPriority.length})
            </h3>
            <div className="text-[13px] text-red-300/80 flex flex-col gap-1">
              {stats.overdueHighPriority.slice(0, 3).map((t) => (
                <span key={t.id}>
                  #T-{t.id} - {t.title} (открыта более 15 минут назад)
                </span>
              ))}
              {stats.overdueHighPriority.length > 3 && (
                <span>и ещё {stats.overdueHighPriority.length - 3}...</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-bg-card border border-border-dark p-4 rounded-xl">
          <div className="text-[12px] text-text-secondary uppercase tracking-[0.5px] mb-2">
            Всего заявок
          </div>
          <div className="text-[24px] font-semibold">{stats.total}</div>
        </div>
        <div className="bg-bg-card border border-border-dark p-4 rounded-xl">
          <div className="text-[12px] text-text-secondary uppercase tracking-[0.5px] mb-2">
            Открытые
          </div>
          <div className="text-[24px] font-semibold text-text-primary">
            {stats.open}
          </div>
        </div>
        <div className="bg-bg-card border border-border-dark p-4 rounded-xl">
          <div className="text-[12px] text-text-secondary uppercase tracking-[0.5px] mb-2">
            В работе
          </div>
          <div className="text-[24px] font-semibold text-blue-400">
            {stats.inProgress}
          </div>
        </div>
        <div className="bg-bg-card border border-border-dark p-4 rounded-xl">
          <div className="text-[12px] text-text-secondary uppercase tracking-[0.5px] mb-2">
            Закрытые
          </div>
          <div className="text-[24px] font-semibold text-emerald-400">
            {stats.closed}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 h-[400px]">
        {/* Charts Container */}
        <div className="bg-bg-card border border-border-dark rounded-xl p-5 flex flex-col">
          <h3 className="text-[14px] font-semibold mb-4 text-text-secondary">
            Заявки по приоритетам
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3139" />
                <XAxis dataKey="name" stroke="#8b949e" fontSize={12} />
                <YAxis stroke="#8b949e" fontSize={12} allowDecimals={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#15171c",
                    borderColor: "#2d3139",
                    color: "#e6edf3",
                  }}
                  itemStyle={{ color: "#2f81f7" }}
                />
                <Bar dataKey="count" fill="#2f81f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Container */}
        <div className="bg-bg-card border border-border-dark rounded-xl p-5 flex flex-col">
          <h3 className="text-[14px] font-semibold mb-4 text-text-secondary">
            Категории заявок
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="count"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={{ stroke: "#8b949e" }}
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#15171c",
                    borderColor: "#2d3139",
                    color: "#e6edf3",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
