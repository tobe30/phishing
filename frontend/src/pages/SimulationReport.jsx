import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Flag, ShieldCheck, TriangleAlert } from "lucide-react";
import { useParams } from "react-router-dom";
import { reportCampaignEmail } from "../lib/api";

const SimulationReport = () => {
  const { token = "" } = useParams();
  const reportMutation = useMutation({
    mutationFn: reportCampaignEmail,
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <main className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl md:p-10">
        {reportMutation.isIdle && (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
              <Flag className="h-8 w-8" />
            </span>
            <h1 className="mt-6 text-2xl font-bold text-slate-900">
              Report suspicious email
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Confirm that you want to report this message as a suspected
              phishing email.
            </p>
            <button
              type="button"
              onClick={() => reportMutation.mutate(token)}
              disabled={!token}
              className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 text-sm font-bold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Flag className="h-4 w-4" />
              Confirm report
            </button>
          </>
        )}

        {reportMutation.isPending && (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
              <Flag className="h-8 w-8 animate-pulse" />
            </span>
            <h1 className="mt-6 text-2xl font-bold text-slate-900">
              Reporting email
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Please wait while we record your report.
            </p>
          </>
        )}

        {reportMutation.isSuccess && (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <h1 className="mt-6 text-2xl font-bold text-slate-900">
              Phishing email reported
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Thank you for recognizing and reporting this authorized
              security-awareness simulation.
            </p>
            <div className="mt-7 flex items-center justify-center gap-2 rounded-2xl bg-cyan-50 p-4 text-sm font-semibold text-cyan-800">
              <ShieldCheck className="h-5 w-5" />
              Your report has been recorded successfully.
            </div>
          </>
        )}

        {reportMutation.isError && (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
              <TriangleAlert className="h-8 w-8" />
            </span>
            <h1 className="mt-6 text-2xl font-bold text-slate-900">
              Unable to report email
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {reportMutation.error.response?.data?.message ||
                "The reporting link is invalid or unavailable."}
            </p>
            <button
              type="button"
              onClick={() => reportMutation.mutate(token)}
              className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-cyan-500 px-5 text-sm font-bold text-white transition hover:bg-cyan-600"
            >
              Try again
            </button>
          </>
        )}
      </main>
    </div>
  );
};

export default SimulationReport;
