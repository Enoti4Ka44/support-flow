import { useState, useEffect, useMemo } from "react";
import { ticketApi } from "../api/tickets";
import { generateDashboardAnalytics } from "../api/ai";
import type { Ticket } from "../types/ticket";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  AlertCircle,
  Clock,
  Zap,
  Cpu,
  SearchCheck,
  Loader2,
} from "lucide-react";

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

const formatDuration = (mins: number) => {
  if (mins === 0) return "—";
  if (mins < 60) return `${Math.round(mins)} мин`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return `${h} ч ${m} мин`;
};

export function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

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
    const overdueHighPriority = tickets.filter((t) => {
      if (t.status === "closed") return false;
      if (t.priority !== "high") return false;
      const createdTime = new Date(t.created_at + "Z").getTime();
      return now - createdTime > 15 * 60 * 1000;
    });

    return { total, open, inProgress, closed, overdueHighPriority };
  }, [tickets]);

  const slaMetrics = useMemo(() => {
    let totalClosedDelayMin = 0;
    let closedWithDatesCount = 0;
    let onTimeCount = 0;
    const SLA_MINUTES = { high: 15, medium: 60, low: 1440 };

    tickets
      .filter((t) => t.status === "closed")
      .forEach((t) => {
        if (!t.closed_at) return;

        const created = new Date(t.created_at + "Z").getTime();
        const closed = new Date(t.closed_at + "Z").getTime();
        const diffMins = Math.max(0, (closed - created) / 60000);

        totalClosedDelayMin += diffMins;
        closedWithDatesCount++;

        const limit = SLA_MINUTES[t.priority as keyof typeof SLA_MINUTES] || 60;
        if (diffMins <= limit) {
          onTimeCount++;
        }
      });

    const avgProcessingMins =
      closedWithDatesCount > 0 ? totalClosedDelayMin / closedWithDatesCount : 0;
    const onTimePercent =
      closedWithDatesCount > 0
        ? Math.round((onTimeCount / closedWithDatesCount) * 100)
        : 0;

    return { avgProcessingMins, onTimePercent, closedWithDatesCount };
  }, [tickets]);

  useEffect(() => {
    if (tickets.length > 0) {
      setAiLoading(true);
      const statsForAi = {
        totalTickets: stats.total,
        closedOnTimePercentage: slaMetrics.onTimePercent,
        avgProcessingTimeMins: slaMetrics.avgProcessingMins,
        priorities: tickets.reduce(
          (acc, t) => {
            acc[t.priority] = (acc[t.priority] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
        categories: tickets.reduce(
          (acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
        overdueHighTickets: stats.overdueHighPriority.length,
      };

      generateDashboardAnalytics(statsForAi).then((res) => {
        setAiInsight(res);
        setAiLoading(false);
      });
    }
  }, [tickets.length, stats, slaMetrics]); // Regenerate if tickets change

  const priorityData = useMemo(() => {
    const priorities = { high: 0, medium: 0, low: 0 };
    tickets.forEach((t) => {
      priorities[t.priority as keyof typeof priorities]++;
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

  const dynamicsData = useMemo(() => {
    const datesMap: Record<string, number> = {};
    const sorted = [...tickets].sort(
      (a, b) =>
        new Date(a.created_at + "Z").getTime() -
        new Date(b.created_at + "Z").getTime(),
    );
    sorted.forEach((t) => {
      const d = new Date(t.created_at).toISOString().split("T")[0];
      datesMap[d] = (datesMap[d] || 0) + 1;
    });
    return Object.keys(datesMap).map((date) => ({
      date,
      count: datesMap[date],
    }));
  }, [tickets]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in h-max pb-10">
      <header className="flex justify-between items-center w-full">
        <h1 className="text-xl font-semibold">Дашборд аналитики</h1>
      </header>

      {/* Overdue high-priority alerts */}
      {stats.overdueHighPriority.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-red-500 w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-400 font-semibold mb-1 text-[14px]">
              Внимание! Просрочены срочные заявки (
              {stats.overdueHighPriority.length})
            </h3>
            <div className="text-[13px] text-red-300/80 flex flex-col gap-1">
              {stats.overdueHighPriority.slice(0, 3).map((t) => (
                <span key={t.id}>
                  #T-{t.id} - {t.title} (создана{" "}
                  {new Date(t.created_at).toLocaleTimeString()})
                </span>
              ))}
              {stats.overdueHighPriority.length > 3 && (
                <span>и ещё {stats.overdueHighPriority.length - 3}...</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Analytics Section */}
      <div className="bg-accent/5 border border-dashed border-accent rounded-xl p-5 flex flex-col gap-3">
        <div className="text-[14px] font-semibold flex items-center gap-2 text-accent">
          <Zap className="w-5 h-5" /> AI Бизнес Аналитика
        </div>
        {aiLoading ? (
          <div className="flex items-center gap-2 text-text-secondary text-[14px]">
            <Loader2 className="w-4 h-4 animate-spin" /> Анализируем данные
            заявок...
          </div>
        ) : (
          <div className="text-[14px] leading-relaxed text-text-primary/90 bg-black/20 p-4 rounded-lg border border-border-dark whitespace-pre-wrap font-sans">
            {aiInsight}
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-bg-card border border-border-dark p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
          <div className="text-[11px] text-text-secondary uppercase tracking-[0.5px] mb-2 font-semibold">
            Всего заявок
          </div>
          <div className="text-[26px] font-bold">{stats.total}</div>
        </div>
        <div className="bg-bg-card border border-border-dark p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
          <div className="text-[11px] text-text-secondary uppercase tracking-[0.5px] mb-2 font-semibold">
            Открытые
          </div>
          <div className="text-[26px] font-bold text-text-primary">
            {stats.open}
          </div>
        </div>
        <div className="bg-bg-card border border-border-dark p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
          <div className="text-[11px] text-text-secondary uppercase tracking-[0.5px] mb-2 font-semibold">
            В работе
          </div>
          <div className="text-[26px] font-bold text-blue-400">
            {stats.inProgress}
          </div>
        </div>

        <div className="bg-bg-card border border-border-dark p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          <Clock className="absolute right-[-10px] bottom-[-10px] w-16 h-16 text-emerald-500/10" />
          <div className="text-[11px] text-text-secondary uppercase tracking-[0.5px] mb-2 font-semibold">
            Ср. время обработки
          </div>
          <div className="text-[22px] font-bold text-emerald-400">
            {formatDuration(slaMetrics.avgProcessingMins)}
          </div>
        </div>

        <div className="bg-bg-card border border-border-dark p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          <SearchCheck className="absolute right-[-10px] bottom-[-10px] w-16 h-16 text-accent/10" />
          <div className="text-[11px] text-text-secondary uppercase tracking-[0.5px] mb-2 font-semibold">
            SLA On-Time
          </div>
          <div className="text-[26px] font-bold text-accent">
            {slaMetrics.closedWithDatesCount > 0
              ? `${slaMetrics.onTimePercent}%`
              : "—"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[350px]">
        {/* Priority Chart */}
        <div className="bg-bg-card border border-border-dark rounded-xl p-5 flex flex-col shadow-sm">
          <h3 className="text-[13px] font-semibold mb-4 text-text-secondary uppercase tracking-[0.5px]">
            Заявки по приоритетам
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={priorityData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#2d3139"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#8b949e"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#8b949e"
                  fontSize={11}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <RechartsTooltip
                  cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                  contentStyle={{
                    backgroundColor: "#15171c",
                    borderColor: "#2d3139",
                    color: "#e6edf3",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                  itemStyle={{ color: "#2f81f7", fontWeight: 600 }}
                />
                <Bar
                  dataKey="count"
                  fill="#2f81f7"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Chart */}
        <div className="bg-bg-card border border-border-dark rounded-xl p-5 flex flex-col shadow-sm">
          <h3 className="text-[13px] font-semibold mb-4 text-text-secondary uppercase tracking-[0.5px]">
            Категории заявок
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="count"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={{ stroke: "#8b949e", strokeWidth: 1 }}
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
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                  itemStyle={{ fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamics Chart */}
        <div className="bg-bg-card border border-border-dark rounded-xl p-5 flex flex-col shadow-sm lg:col-span-1 md:col-span-2">
          <h3 className="text-[13px] font-semibold mb-4 text-text-secondary uppercase tracking-[0.5px]">
            Динамика по дням
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dynamicsData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#2d3139"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#8b949e"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#8b949e"
                  fontSize={11}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <RechartsTooltip
                  cursor={{
                    stroke: "rgba(255, 255, 255, 0.1)",
                    strokeWidth: 2,
                  }}
                  contentStyle={{
                    backgroundColor: "#15171c",
                    borderColor: "#2d3139",
                    color: "#e6edf3",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                  itemStyle={{ color: "#3fb950", fontWeight: 600 }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3fb950"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#3fb950",
                    strokeWidth: 2,
                    stroke: "#15171c",
                  }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
