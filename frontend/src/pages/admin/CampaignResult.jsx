import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Eye,
  Flag,
  KeyRound,
  Mail,
  MousePointerClick,
} from "lucide-react";
import Loading from "../../components/Loading";
import Pagination from "../../components/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { getCampaignReport } from "../../lib/api";

const resultStyles = {
  CLICKED: "bg-amber-50 text-amber-600",
  REPORTED: "bg-emerald-50 text-emerald-600",
  IGNORED: "bg-slate-100 text-slate-500",
  OPENED: "bg-sky-50 text-sky-600",
  SENT: "bg-cyan-50 text-cyan-600",
  SUBMITTED: "bg-red-50 text-red-600",
};

const resultLabels = {
  CLICKED: "Clicked",
  REPORTED: "Reported",
  IGNORED: "Ignored",
  OPENED: "Opened",
  SENT: "Sent",
  SUBMITTED: "Submitted Data",
};

const statusStyles = {
  COMPLETED: "bg-emerald-50 text-emerald-600",
  RUNNING: "bg-cyan-50 text-cyan-600",
  DRAFT: "bg-slate-100 text-slate-500",
  CANCELLED: "bg-red-50 text-red-600",
};

const barColors = {
  cyan: { fill: "bg-cyan-500", track: "bg-cyan-50" },
  sky: { fill: "bg-cyan-300", track: "bg-cyan-50" },
  amber: { fill: "bg-amber-500", track: "bg-amber-50" },
  red: { fill: "bg-red-500", track: "bg-red-50" },
  emerald: { fill: "bg-emerald-500", track: "bg-emerald-50" },
};

const formatDate = (value, options) =>
  value
    ? new Intl.DateTimeFormat("en-NG", options).format(new Date(value))
    : "—";

const ResultBadge = ({ result }) => (
  <span
    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
      resultStyles[result] || "bg-slate-100 text-slate-500"
    }`}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {resultLabels[result] || result}
  </span>
);

const FunnelRow = ({ step, total }) => {
  const Icon = step.icon;
  const percent = total > 0 ? (step.value / total) * 100 : 0;
  const colors = barColors[step.color] || barColors.cyan;

  return (
    <div className="flex items-center gap-4">
      <div className="flex w-32 shrink-0 items-center gap-2 text-sm font-semibold text-slate-700">
        <Icon className="h-4 w-4 text-slate-400" />
        {step.label}
      </div>
      <div className={`relative h-10 flex-1 overflow-hidden rounded-xl ${colors.track}`}>
        <div
          className={`flex h-full items-center rounded-xl px-3 transition-all ${colors.fill}`}
          style={{ width: `${Math.max(percent, step.value > 0 ? 12 : 0)}%` }}
        >
          {step.value > 0 && (
            <span className="text-sm font-semibold text-white">{step.value}</span>
          )}
        </div>
      </div>
      <div className="w-16 shrink-0 text-right text-sm font-medium text-slate-500">
        {percent.toFixed(1)}%
      </div>
    </div>
  );
};

const IndividualResults = ({ recipients }) => {
  const { currentPage, setCurrentPage, rowsPerPage, totalPages, paginatedData } =
    usePagination(recipients, 6);
  const cellClass = "border-y border-slate-100 bg-white px-4 py-4";

  return (
    <div className="mt-6 rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="p-6 pb-2">
        <h2 className="text-lg font-bold text-slate-900">Individual Results</h2>
        <p className="mt-1 text-sm text-slate-500">Per-recipient interaction detail</p>
      </div>
      <div className="overflow-x-auto p-4">
        <table className="w-full min-w-[760px] border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
              <th className="rounded-l-xl bg-slate-50 px-4 py-3 text-left">Employee</th>
              <th className="bg-slate-50 px-4 py-3 text-left">Department</th>
              <th className="bg-slate-50 px-4 py-3 text-left">Result</th>
              <th className="bg-slate-50 px-4 py-3 text-left">Opened</th>
              <th className="bg-slate-50 px-4 py-3 text-left">Clicked</th>
              <th className="rounded-r-xl bg-slate-50 px-4 py-3 text-left">Reported</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-slate-400">
                  No recipients to show.
                </td>
              </tr>
            ) : (
              paginatedData.map((recipient) => (
                <tr key={recipient.id}>
                  <td className={`rounded-l-xl border-l ${cellClass}`}>
                    <p className="text-sm font-semibold text-slate-900">{recipient.name}</p>
                    <p className="mt-0.5 text-xs text-cyan-600">{recipient.email}</p>
                  </td>
                  <td className={cellClass}>
                    <span className="text-sm text-slate-600">{recipient.department}</span>
                  </td>
                  <td className={cellClass}><ResultBadge result={recipient.result} /></td>
                  <td className={cellClass}><span className="text-sm text-slate-500">{recipient.opened}</span></td>
                  <td className={cellClass}><span className="text-sm text-slate-500">{recipient.clicked}</span></td>
                  <td className={`rounded-r-xl border-r ${cellClass}`}>
                    <span className="text-sm text-slate-500">{recipient.reported}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={recipients.length}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

const CampaignResult = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const { data: response, isPending, isError } = useQuery({
    queryKey: ["campaign-report", campaignId],
    queryFn: () => getCampaignReport(campaignId),
    enabled: Boolean(campaignId),
  });

  if (campaignId && isPending) {
    return <Loading message="Loading campaign result..." fullScreen={false} />;
  }

  if (!campaignId || isError || !response?.campaign) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-600">
          Unable to load this campaign result.
        </div>
        <button
          type="button"
          onClick={() => navigate("/campaigns")}
          className="mt-4 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-white"
        >
          Back to campaigns
        </button>
      </div>
    );
  }

  const { campaign, results } = response;
  const rawRecipients = response.recipients || [];
  const sentCount = rawRecipients.filter((recipient) => recipient.sentAt).length;
  const group =
    campaign.targetGroup === "all"
      ? "All Employees"
      : campaign.targetGroup === "new-hires"
        ? "New Hires"
        : campaign.targetGroup;

  const funnel = [
    { key: "sent", label: "Sent", value: sentCount, icon: Mail, color: "cyan" },
    { key: "opened", label: "Opened", value: results.opened, icon: Eye, color: "sky" },
    { key: "clicked", label: "Clicked", value: results.clicked, icon: MousePointerClick, color: "amber" },
    { key: "submitted", label: "Submitted", value: results.submitted, icon: KeyRound, color: "red" },
    { key: "reported", label: "Reported", value: results.reported, icon: Flag, color: "emerald" },
  ];

  const recipients = rawRecipients.map((recipient) => {
    const employee = recipient.employee || {};
    const result = recipient.submittedAt
      ? "SUBMITTED"
      : recipient.reportedAt
        ? "REPORTED"
        : recipient.clickedAt
          ? "CLICKED"
          : recipient.openedAt
            ? "OPENED"
            : recipient.sentAt
              ? "SENT"
              : "IGNORED";

    return {
      id: employee._id || recipient.trackingToken,
      name: employee.name || "Deleted employee",
      email: employee.email || "Email unavailable",
      department: employee.department || "—",
      result,
      opened: formatDate(recipient.openedAt, { dateStyle: "medium", timeStyle: "short" }),
      clicked: formatDate(recipient.clickedAt, { dateStyle: "medium", timeStyle: "short" }),
      reported: recipient.reportedAt ? "Yes" : "—",
    };
  });

  const handleExport = () => {
    const headings = ["Employee", "Email", "Department", "Result", "Opened", "Clicked", "Reported"];
    const escapeCsv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const rows = recipients.map((recipient) =>
      [
        recipient.name,
        recipient.email,
        recipient.department,
        recipient.result,
        recipient.opened,
        recipient.clicked,
        recipient.reported,
      ].map(escapeCsv).join(","),
    );
    const blob = new Blob([[headings.join(","), ...rows].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${campaign.name.replaceAll(" ", "-").toLowerCase()}-results.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{campaign.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {campaign.template?.name || "Deleted template"} · {group}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/campaigns")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            All campaigns
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[campaign.status] || "bg-slate-100 text-slate-500"}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {campaign.status}
        </span>
        <span className="text-sm text-slate-500">
          Sent {formatDate(campaign.launchedAt, { dateStyle: "medium" })} · {results.total} recipients
        </span>
      </div>

      <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Behavior funnel</h2>
        <p className="mt-1 text-sm text-slate-500">Who did what after the email landed.</p>
        <div className="mt-6 space-y-4">
          {funnel.map((step) => (
            <FunnelRow key={step.key} step={step} total={sentCount} />
          ))}
        </div>
      </div>

      <IndividualResults recipients={recipients} />
    </div>
  );
};

export default CampaignResult;
