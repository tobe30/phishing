import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Plus, Search, SlidersHorizontal, MoreHorizontal, Eye, Trash2 } from "lucide-react";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";
import {
  completeCampaign,
  deleteCampaign,
  getCampaigns,
} from "../../lib/api";

// ================= STATUS BADGE =================
// Props: status: "COMPLETED" | "RUNNING" | "DRAFT"
const StatusBadge = ({ status }) => {
  const styles = {
    COMPLETED: "bg-emerald-50 text-emerald-600",
    RUNNING: "bg-cyan-50 text-cyan-600",
    DRAFT: "bg-slate-100 text-slate-500",
  };

  const labels = {
    COMPLETED: "Completed",
    RUNNING: "Running",
    DRAFT: "Draft",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
        styles[status] ?? "bg-slate-400/10 text-slate-400"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status] ?? status}
    </span>
  );
};

// ================= RATE CELL =================
// Props: value: number | null
const RateCell = ({ value }) => {
  if (value === null || value === undefined) {
    return <span className="text-sm text-slate-400">—</span>;
  }

  const color =
    value >= 20
      ? "text-red-600"
      : value >= 10
      ? "text-amber-600"
      : "text-emerald-600";

  return <span className={`text-sm font-semibold ${color}`}>{value.toFixed(1)}%</span>;
};

// ================= ACTIONS MENU =================
// Props: onView, onComplete, onDelete and whether completion is available
const ActionsMenu = ({ onView, onComplete, onDelete, canComplete }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-lg">
          <button
            onClick={() => {
              setOpen(false);
              onView();
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <Eye className="h-4 w-4 text-slate-400" />
            View result
          </button>
          {canComplete && (
            <button
              onClick={() => {
                setOpen(false);
                onComplete();
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-emerald-600 hover:bg-emerald-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark completed
            </button>
          )}
          <button
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

// ================= SHARED TD STYLE =================
const tdBase = "border-y border-slate-100 bg-white py-5 px-4";

const Campaigns = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [groupFilter, setGroupFilter] = useState("All");

  const {
    data: campaignResponse,
    isPending: campaignsLoading,
    isError: campaignsError,
  } = useQuery({
    queryKey: ["campaigns"],
    queryFn: getCampaigns,
  });

  const campaigns = useMemo(
    () =>
      (campaignResponse?.campaigns || []).map((campaign) => {
        const recipients = campaign.recipients || [];
        const clicked = recipients.filter((recipient) => recipient.clickedAt).length;
        const reported = recipients.filter((recipient) => recipient.reportedAt).length;
        const sent = recipients.filter((recipient) => recipient.sentAt).length;
        const targets = recipients.length;

        const group =
          campaign.targetGroup === "all"
            ? "All Employees"
            : campaign.targetGroup === "new-hires"
              ? "New Hires"
              : campaign.targetGroup;

        return {
          ...campaign,
          templateName: campaign.template?.name || "Deleted template",
          group,
          targets,
          sent,
          clickRate:
            targets === 0 ? 0 : Number(((clicked / targets) * 100).toFixed(1)),
          reportRate:
            targets === 0 ? 0 : Number(((reported / targets) * 100).toFixed(1)),
        };
      }),
    [campaignResponse],
  );

  const groups = useMemo(
    () => ["All", ...new Set(campaigns.map((c) => c.group))],
    [campaigns]
  );

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.templateName.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;
      const matchesGroup = groupFilter === "All" || item.group === groupFilter;

      return matchesSearch && matchesStatus && matchesGroup;
    });
  }, [campaigns, search, statusFilter, groupFilter]);

  const {
    currentPage,
    setCurrentPage,
    rowsPerPage,
    totalPages,
    paginatedData,
  } = usePagination(filteredCampaigns, 6);

  const deleteMutation = useMutation({
    mutationFn: deleteCampaign,
    onSuccess: (_data, deletedCampaignId) => {
      queryClient.setQueryData(["campaigns"], (current) => {
        const remainingCampaigns = (current?.campaigns || []).filter(
          (campaign) => campaign._id !== deletedCampaignId,
        );

        return {
          ...current,
          count: remainingCampaigns.length,
          campaigns: remainingCampaigns,
        };
      });
      setCurrentPage(1);
    },
  });

  const completeMutation = useMutation({
    mutationFn: completeCampaign,
    onSuccess: (data) => {
      queryClient.setQueryData(["campaigns"], (current) => ({
        ...current,
        campaigns: (current?.campaigns || []).map((campaign) =>
          campaign._id === data.campaign._id
            ? {
                ...campaign,
                status: data.campaign.status,
                completedAt: data.campaign.completedAt,
              }
            : campaign,
        ),
      }));
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleGroupChange = (e) => {
    setGroupFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleViewResult = (item) => {
    navigate(`/campaign-result?campaignId=${item._id}`);
  };

  const handleDelete = (item) => {
    deleteMutation.mutate(item._id);
  };

  const handleComplete = (item) => {
    completeMutation.mutate(item._id);
  };

  if (campaignsLoading) {
    return <Loading message="Loading campaigns..." fullScreen={false} />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Campaigns</h1>
          <p className="mt-1 text-sm text-slate-500">
            View every authorized simulation and its current results.
          </p>
        </div>

        <button
          onClick={() => navigate("/campaigns/new")}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </button>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {/* SEARCH */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={handleSearchChange}
            type="text"
            placeholder="Search by name or template..."
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* STATUS FILTER */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="h-11 appearance-none rounded-2xl border border-slate-200 bg-white pl-11 pr-9 text-sm font-medium text-slate-700 focus:border-cyan-400 focus:outline-none"
          >
            <option value="All">Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="RUNNING">Running</option>
            <option value="DRAFT">Draft</option>
          </select>
          <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>

        {/* GROUP FILTER */}
        <div className="relative">
          <select
            value={groupFilter}
            onChange={handleGroupChange}
            className="h-11 appearance-none rounded-2xl border border-slate-200 bg-white pl-11 pr-9 text-sm font-medium text-slate-700 focus:border-cyan-400 focus:outline-none"
          >
            <option value="All">Group</option>
            {groups
              .filter((g) => g !== "All")
              .map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
          </select>
          <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* ================= TABLE ================= */}
      {campaignsError && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
          Unable to load campaigns. Please refresh the page.
        </div>
      )}

      {completeMutation.isError && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
          {completeMutation.error.response?.data?.message ||
            "Unable to complete campaign. Please try again."}
        </div>
      )}

      <div className="mt-6 rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto p-4">
          <table className="w-full min-w-[900px] border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                <th className="rounded-l-xl bg-slate-50 py-3 px-4 text-left min-w-[240px]">
                  Campaign
                </th>
                <th className="bg-slate-50 py-3 px-4 text-left">Status</th>
                <th className="bg-slate-50 py-3 px-4 text-left min-w-[160px]">
                  Target group
                </th>
                <th className="bg-slate-50 py-3 px-4 text-left">Targets</th>
                <th className="bg-slate-50 py-3 px-4 text-left">Sent</th>
                <th className="bg-slate-50 py-3 px-4 text-left">Click rate</th>
                <th className="bg-slate-50 py-3 px-4 text-left">Report rate</th>
                <th className="rounded-r-xl bg-slate-50 py-3 px-4 text-right w-12" />
              </tr>
            </thead>

            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="rounded-2xl border border-slate-100 bg-white py-10 text-center text-sm text-slate-400"
                  >
                    No campaigns match your filters.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item._id} className="group">
                    {/* CAMPAIGN */}
                    <td className={`rounded-l-xl border-l ${tdBase}`}>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {item.templateName}
                      </p>
                    </td>

                    {/* STATUS */}
                    <td className={tdBase}>
                      <StatusBadge status={item.status} />
                    </td>

                    {/* TARGET GROUP */}
                    <td className={tdBase}>
                      <span className="text-sm text-slate-600">
                        {item.group}
                      </span>
                    </td>

                    {/* TARGETS */}
                    <td className={tdBase}>
                      <span className="text-sm font-semibold text-slate-900">
                        {item.targets}
                      </span>
                    </td>

                    {/* SENT */}
                    <td className={tdBase}>
                      <span className="text-sm text-slate-500">
                        {item.sent}/{item.targets}
                      </span>
                    </td>

                    {/* CLICK RATE */}
                    <td className={tdBase}>
                      <RateCell value={item.clickRate} />
                    </td>

                    {/* REPORT RATE */}
                    <td className={tdBase}>
                      <span className="text-sm text-slate-600">
                        {item.reportRate === null || item.reportRate === undefined
                          ? "—"
                          : `${item.reportRate.toFixed(1)}%`}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className={`rounded-r-xl border-r ${tdBase} text-right overflow-visible`}>
                      <ActionsMenu
                        onView={() => handleViewResult(item)}
                        onComplete={() => handleComplete(item)}
                        onDelete={() => handleDelete(item)}
                        canComplete={item.status === "RUNNING"}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION ================= */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredCampaigns.length}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default Campaigns;
