import { useQuery } from "@tanstack/react-query";
import {
  Download,
  Flag,
  Mail,
  MousePointerClick,
  Send,
} from "lucide-react";
import Loading from "../../components/Loading";
import { getReports } from "../../lib/api";

const percent = (value, total) =>
  total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "0.0%";

const Reports = () => {
  const {
    data: reportResponse,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["reports"],
    queryFn: getReports,
  });

  const campaigns = reportResponse?.campaigns || [];
  const totals = reportResponse?.summary || {
    campaigns: 0,
    recipients: 0,
    clicked: 0,
    reported: 0,
    clickRate: 0,
    reportRate: 0,
  };

  const summaryCards = [
    {
      label: "Campaigns",
      value: totals.campaigns,
      note: "Authorized simulations",
      icon: Send,
      style: "bg-cyan-50 text-cyan-600",
    },
    {
      label: "Recipients",
      value: totals.recipients.toLocaleString(),
      note: "Employees targeted",
      icon: Mail,
      style: "bg-blue-50 text-blue-600",
    },
    {
      label: "Click rate",
      value: `${totals.clickRate.toFixed(1)}%`,
      note: `${totals.clicked} employees clicked`,
      icon: MousePointerClick,
      style: "bg-amber-50 text-amber-600",
    },
    {
      label: "Report rate",
      value: `${totals.reportRate.toFixed(1)}%`,
      note: `${totals.reported} employees reported`,
      icon: Flag,
      style: "bg-emerald-50 text-emerald-600",
    },
  ];

  if (isPending) {
    return <Loading message="Loading reports..." fullScreen={false} />;
  }

  const exportCsv = () => {
    const headings = [
      "Campaign",
      "Date",
      "Recipients",
      "Opened",
      "Clicked",
      "Submitted Event",
      "Reported",
    ];
    const rows = campaigns.map((campaign) => [
      campaign.name,
      new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(
        new Date(campaign.date),
      ),
      campaign.recipients,
      campaign.opened,
      campaign.clicked,
      campaign.submitted,
      campaign.reported,
    ]);
    const csv = [headings, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "phishguard-campaign-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
            <p className="mt-1 text-sm text-slate-500">
              A basic summary of completed phishing simulations.
            </p>
          </div>

          <button
            type="button"
            onClick={exportCsv}
            disabled={campaigns.length === 0}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {isError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
            Unable to load reports. Please refresh the page.
          </div>
        )}

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {card.label}
                    </p>
                    <p className="mt-3 text-3xl font-bold text-slate-900">
                      {card.value}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{card.note}</p>
                  </div>
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.style}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-bold text-slate-900">
              Campaign performance
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Results calculated from your real campaign tracking events.
            </p>
          </div>

          <div className="overflow-x-auto p-4">
            <table className="w-full min-w-[900px] border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  <th className="rounded-l-xl bg-slate-50 px-4 py-3">
                    Campaign
                  </th>
                  <th className="bg-slate-50 px-4 py-3">Recipients</th>
                  <th className="bg-slate-50 px-4 py-3">Open rate</th>
                  <th className="bg-slate-50 px-4 py-3">Click rate</th>
                  <th className="bg-slate-50 px-4 py-3">Submitted</th>
                  <th className="rounded-r-xl bg-slate-50 px-4 py-3">
                    Report rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-sm text-slate-400"
                    >
                      No campaign reports found.
                    </td>
                  </tr>
                ) : campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="rounded-l-xl border-y border-l border-slate-100 px-4 py-4">
                      <p className="text-sm font-bold text-slate-900">
                        {campaign.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Intl.DateTimeFormat("en-NG", {
                          dateStyle: "medium",
                        }).format(new Date(campaign.date))}
                      </p>
                    </td>
                    <td className="border-y border-slate-100 px-4 py-4 text-sm font-semibold text-slate-700">
                      {campaign.recipients}
                    </td>
                    <td className="border-y border-slate-100 px-4 py-4 text-sm text-slate-600">
                      {percent(campaign.opened, campaign.recipients)}
                    </td>
                    <td className="border-y border-slate-100 px-4 py-4">
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">
                        {percent(campaign.clicked, campaign.recipients)}
                      </span>
                    </td>
                    <td className="border-y border-slate-100 px-4 py-4 text-sm text-slate-600">
                      {campaign.submitted}
                    </td>
                    <td className="rounded-r-xl border-y border-r border-slate-100 px-4 py-4">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                        {percent(campaign.reported, campaign.recipients)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Reports;
