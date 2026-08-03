import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Flag,
  Mail,
  MousePointerClick,
  MoveRight,
  RefreshCw,
  Send,
  UserX,
} from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Loading from "../../components/Loading";
import { getCampaigns, getEmployees, getReports } from "../../lib/api";

const statusStyles = {
  COMPLETED: "bg-green-100 text-green-700",
  RUNNING: "bg-sky-100 text-sky-600",
  CANCELLED: "bg-red-100 text-red-700",
  DRAFT: "bg-slate-100 text-slate-500",
};

const statusLabels = {
  COMPLETED: "Completed",
  RUNNING: "Running",
  CANCELLED: "Cancelled",
  DRAFT: "Draft",
};

const clickRateColor = (rate) => {
  if (rate < 10) return "text-green-600";
  if (rate < 20) return "text-yellow-600";
  return "text-red-600";
};

const displayGroup = (group) => {
  if (group === "all") return "All Employees";
  if (group === "new-hires") return "New Hires";
  return group || "Unknown";
};

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "—";

const ClickReportTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
      <p className="mb-3 text-sm font-bold text-neutral">{data.label}</p>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="text-slate-600">Click rate:</span>
          <span className="font-semibold text-red-600">{data.clickRate}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span className="text-slate-600">Report rate:</span>
          <span className="font-semibold text-green-600">{data.reportRate}%</span>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const reportsQuery = useQuery({
    queryKey: ["reports"],
    queryFn: getReports,
  });
  const campaignsQuery = useQuery({
    queryKey: ["campaigns"],
    queryFn: getCampaigns,
  });
  const employeesQuery = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  const reports = reportsQuery.data;
  const campaigns = campaignsQuery.data?.campaigns || [];
  const employees = employeesQuery.data?.employees || [];
  const summary = reports?.summary || {
    campaigns: 0,
    recipients: 0,
    clicked: 0,
    reported: 0,
    clickRate: 0,
    reportRate: 0,
  };

  const reportById = useMemo(
    () =>
      new Map(
        (reports?.campaigns || []).map((campaign) => [
          String(campaign.id),
          campaign,
        ]),
      ),
    [reports],
  );

  const recentCampaigns = useMemo(
    () =>
      campaigns.slice(0, 5).map((campaign) => {
        const report = reportById.get(String(campaign._id));
        return {
          id: campaign._id,
          name: campaign.name,
          status: campaign.status,
          targetGroup: displayGroup(campaign.targetGroup),
          targets: campaign.recipients?.length || 0,
          clickRate: report?.clickRate || 0,
          sent: campaign.launchedAt || campaign.createdAt,
        };
      }),
    [campaigns, reportById],
  );

  const chartData = useMemo(
    () =>
      [...(reports?.campaigns || [])]
        .slice(0, 7)
        .reverse()
        .map((campaign) => ({
          label: new Intl.DateTimeFormat("en-NG", {
            month: "short",
            day: "numeric",
          }).format(new Date(campaign.date)),
          clickRate: campaign.clickRate,
          reportRate: campaign.reportRate,
        })),
    [reports],
  );

  const riskByDepartment = useMemo(() => {
    const departments = employees.reduce((result, employee) => {
      const name = employee.department || "Unknown";
      if (!result[name]) result[name] = { total: 0, count: 0 };
      result[name].total += employee.risk || 0;
      result[name].count += 1;
      return result;
    }, {});

    return Object.entries(departments)
      .map(([name, values]) => ({
        name,
        risk: Math.round(values.total / values.count),
      }))
      .sort((first, second) => second.risk - first.risk);
  }, [employees]);

  const employeesAtRisk = employees.filter(
    (employee) => (employee.risk || 0) >= 50,
  ).length;

  const stats = [
    {
      title: "Total Campaigns",
      value: summary.campaigns.toLocaleString(),
      note: "Authorized simulations",
      icon: Send,
      bg: "bg-sky/10",
      iconColor: "text-sky-500",
    },
    {
      title: "Recipients",
      value: summary.recipients.toLocaleString(),
      note: "Employee campaign entries",
      icon: Mail,
      bg: "bg-primary/10",
      iconColor: "text-sky-500",
    },
    {
      title: "Click Rate",
      value: `${summary.clickRate.toFixed(1)}%`,
      note: `${summary.clicked} employees clicked`,
      icon: MousePointerClick,
      bg: "bg-yellow-100",
      iconColor: "text-yellow-700",
    },
    {
      title: "Report Rate",
      value: `${summary.reportRate.toFixed(1)}%`,
      note: `${summary.reported} employees reported`,
      icon: Flag,
      bg: "bg-red-100",
      iconColor: "text-red-700",
    },
    {
      title: "Employees At Risk",
      value: employeesAtRisk.toLocaleString(),
      note: "Risk score of 50 or higher",
      icon: UserX,
      bg: "bg-blue-100",
      iconColor: "text-blue-700",
    },
  ];

  const isPending =
    reportsQuery.isPending ||
    campaignsQuery.isPending ||
    employeesQuery.isPending;
  const isError =
    reportsQuery.isError || campaignsQuery.isError || employeesQuery.isError;

  const refreshDashboard = () => {
    reportsQuery.refetch();
    campaignsQuery.refetch();
    employeesQuery.refetch();
  };

  if (isPending) {
    return <Loading message="Loading dashboard..." fullScreen={false} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Security Overview</h1>
          <p className="mt-1 text-sm text-slate-500">
            Your team&apos;s phishing resilience at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            Live · Updated just now
          </span>
          <button
            type="button"
            onClick={refreshDashboard}
            className="btn btn-xs btn-ghost border border-slate-200"
            aria-label="Refresh dashboard"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {isError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
          Some dashboard information could not be loaded. Please try refreshing.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-5 flex items-start justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  {item.title}
                </p>
                <div className={`rounded-2xl p-3 ${item.bg}`}>
                  <Icon size={20} className={item.iconColor} />
                </div>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                {item.value}
              </h2>
              <p className="mt-2 text-xs text-slate-500">{item.note}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-neutral">Click vs. report rate</h2>
              <p className="text-sm text-slate-500">Last 7 campaigns</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                Click rate
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                Report rate
              </span>
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="flex h-80 items-center justify-center text-sm text-slate-400">
              No campaign data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClick" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorReport" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--chart-grid-color)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--chart-axis-color)" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(value) => `${value}%`} tick={{ fontSize: 12, fill: "var(--chart-axis-color)" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip content={<ClickReportTooltip />} cursor={false} />
                <Area type="monotone" dataKey="clickRate" stroke="none" fill="url(#colorClick)" />
                <Area type="monotone" dataKey="reportRate" stroke="none" fill="url(#colorReport)" />
                <Line type="monotone" dataKey="clickRate" stroke="#ef4444" strokeWidth={3} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="reportRate" stroke="#22c55e" strokeWidth={3} dot={false} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-neutral">Risk by department</h2>
          <p className="text-sm text-slate-500">Average employee risk · lower is safer</p>
          <div className="mt-8 space-y-5">
            {riskByDepartment.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">
                No employee risk data available.
              </p>
            ) : (
              riskByDepartment.map((department) => (
                <div key={department.name} className="flex items-center gap-4">
                  <span className="w-24 shrink-0 truncate text-sm text-slate-600">
                    {department.name}
                  </span>
                  <div className="group relative flex-1">
                    <div
                      className="h-8 rounded-lg bg-sky-500 transition-all duration-500 group-hover:bg-sky-600"
                      style={{ width: `${department.risk}%` }}
                    />
                    <div
                      className="pointer-events-none absolute -top-9 -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                      style={{ left: `${department.risk}%` }}
                    >
                      {department.name}: {department.risk}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral">Recent campaigns</h2>
            <p className="text-sm text-slate-500">Latest sends and their behavior</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/campaigns")}
            className="flex items-center gap-1 text-sm font-medium text-sky-500 transition hover:gap-2"
          >
            View all
            <MoveRight size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="pb-3 font-medium">Campaign</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Target group</th>
                <th className="pb-3 text-right font-medium">Targets</th>
                <th className="pb-3 text-right font-medium">Click rate</th>
                <th className="pb-3 text-right font-medium">Sent</th>
              </tr>
            </thead>
            <tbody>
              {recentCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-slate-400">
                    No campaigns found.
                  </td>
                </tr>
              ) : (
                recentCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-slate-200 last:border-0">
                    <td className="py-4 font-semibold text-neutral">{campaign.name}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[campaign.status] || "bg-slate-100 text-slate-500"}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {statusLabels[campaign.status] || campaign.status}
                      </span>
                    </td>
                    <td className="py-4 text-slate-600">{campaign.targetGroup}</td>
                    <td className="py-4 text-right font-semibold text-neutral">{campaign.targets}</td>
                    <td className={`py-4 text-right font-semibold ${clickRateColor(campaign.clickRate)}`}>
                      {campaign.clickRate.toFixed(1)}%
                    </td>
                    <td className="py-4 text-right text-slate-500">{formatDate(campaign.sent)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
