import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Eye,
  ShieldCheck,
  Users,
  AlertCircle,
  X,
} from "lucide-react";
import Loading from "../../components/Loading";
import { getEmployees } from "../../lib/api";

const modules = [
  {
    id: 1,
    title: "Spot the Red Flags",
    duration: "5 minutes",
    description:
      "Learn how to identify unusual senders, urgent language, and suspicious links.",
    lesson:
      "Always check the sender's full email address. Pause when a message pressures you to act quickly, and verify unexpected requests through a trusted channel.",
  },
  {
    id: 2,
    title: "Handle Links Safely",
    duration: "4 minutes",
    description:
      "Learn how to check a link before opening it or entering account information.",
    lesson:
      "Hover over links to inspect their destination. For important services, open the official website directly instead of signing in through an unexpected email.",
  },
  {
    id: 3,
    title: "Report Suspicious Email",
    duration: "3 minutes",
    description:
      "Know when and how to report a suspicious message to the security team.",
    lesson:
      "Report suspicious messages using your organization's approved reporting channel. If you clicked, notify the security team immediately so they can respond.",
  },
];

const Training = () => {
  const [previewModule, setPreviewModule] = useState(null);
  const {
    data: employeeResponse,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  const employees = employeeResponse?.employees || [];
  const assignedEmployees = employees.filter(
    (employee) => employee.trainingTotal > 0,
  );
  const completedEmployees = assignedEmployees.filter(
    (employee) => employee.trainingDone >= employee.trainingTotal,
  ).length;

  const summaryCards = [
    {
      label: "Training modules",
      value: modules.length,
      icon: BookOpen,
      style: "bg-cyan-50 text-cyan-600",
    },
    {
      label: "Employees assigned",
      value: assignedEmployees.length,
      icon: Users,
      style: "bg-blue-50 text-blue-600",
    },
    {
      label: "Completed",
      value: completedEmployees,
      icon: CheckCircle2,
      style: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Incomplete",
      value: assignedEmployees.length - completedEmployees,
      icon: AlertCircle,
      style: "bg-amber-50 text-amber-600",
    },
  ];

  if (isPending) {
    return <Loading message="Loading training progress..." fullScreen={false} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-600">
            <ShieldCheck className="h-4 w-4" />
            Security awareness
          </div>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Training</h1>
          <p className="mt-1 text-sm text-slate-500">
            Basic lessons shown to employees after a phishing simulation.
          </p>
        </div>

        {isError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
            Unable to load employee training progress. Please refresh the page.
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {card.label}
                    </p>
                    <p className="mt-3 text-3xl font-bold text-slate-900">
                      {card.value}
                    </p>
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

        <section className="mt-7">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Training modules</h2>
            <span className="text-sm text-slate-400">3 modules</span>
          </div>

          <div className="mt-4 grid gap-5 md:grid-cols-3">
            {modules.map((module) => (
              <article
                key={module.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  {module.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
                  {module.description}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <Clock3 className="h-3.5 w-3.5" />
                  {module.duration}
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewModule(module)}
                  className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-bold text-slate-900">
              Employee completion
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Progress recorded from completed phishing-awareness simulations.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Employee</th>
                  <th className="px-5 py-3 font-semibold">Department</th>
                  <th className="px-5 py-3 font-semibold">Progress</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-10 text-center text-sm text-slate-400"
                    >
                      No employees found.
                    </td>
                  </tr>
                ) : employees.map((employee) => {
                  const assigned = employee.trainingTotal > 0;
                  const complete =
                    assigned &&
                    employee.trainingDone >= employee.trainingTotal;
                  return (
                    <tr key={employee._id}>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                        {employee.name}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {employee.department}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                        {employee.trainingDone}/{employee.trainingTotal}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            !assigned
                              ? "bg-slate-100 text-slate-500"
                              : complete
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {!assigned
                            ? "Not assigned"
                            : complete
                              ? "Completed"
                              : "Incomplete"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {previewModule && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setPreviewModule(null)
          }
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${previewModule.title} preview`}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={() => setPreviewModule(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              {previewModule.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {previewModule.lesson}
            </p>

            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
              This is a static MVP lesson preview. Employee completion is
              recorded from the simulation training page.
            </div>

            <button
              type="button"
              onClick={() => setPreviewModule(null)}
              className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 text-sm font-bold text-white transition hover:bg-cyan-600"
            >
              <CheckCircle2 className="h-4 w-4" />
              Close lesson
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Training;
