import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Link2,
  LockKeyhole,
  MailWarning,
  ShieldCheck,
} from "lucide-react";
import {
  completeCampaignTraining,
  trackCampaignClick,
  trackCampaignSubmission,
} from "../lib/api";

const warningSigns = [
  {
    icon: MailWarning,
    title: "Unexpected request",
    description:
      "The message asked you to sign in without first confirming that you expected the request.",
  },
  {
    icon: Link2,
    title: "Unverified link",
    description:
      "The safest approach is to open the official employee portal directly instead of using an email link.",
  },
  {
    icon: AlertTriangle,
    title: "Pressure to act",
    description:
      "Urgent language is commonly used to make people act before checking the message carefully.",
  },
];

const SimulatedLanding = () => {
  const { token = "" } = useParams();
  const [stage, setStage] = useState("form");
  const [trackingError, setTrackingError] = useState("");
  const [autoTraining, setAutoTraining] = useState(true);
  const clickTracked = useRef(false);
  const submissionMutation = useMutation({
    mutationFn: trackCampaignSubmission,
    onSuccess: () => {
      setStage("awareness");
    },
  });
  const trainingMutation = useMutation({
    mutationFn: completeCampaignTraining,
    onSuccess: () => {
      setStage("complete");
    },
  });

  useEffect(() => {
    if (!token || clickTracked.current) return;

    clickTracked.current = true;

    trackCampaignClick(token)
      .then((data) => {
        setAutoTraining(data.autoTraining !== false);
      })
      .catch((error) => {
        setTrackingError(
          error.response?.data?.message ||
            "This simulation link is invalid or no longer available.",
        );
      });
  }, [token]);

  const handleSimulationSubmit = (event) => {
    event.preventDefault();

    // Deliberately discard every entered value. Only the tracking token is
    // sent so passwords and other form values never leave the browser.
    event.currentTarget.reset();
    submissionMutation.mutate(token);
  };

  if (stage === "form") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-10">
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-cyan-100 to-transparent" />
        <div className="relative w-full max-w-md">
          <div className="mb-6 flex items-center justify-center gap-2 text-slate-800">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-white shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold leading-tight">Employee Portal</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Secure account access
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSimulationSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl shadow-slate-300/50 md:p-9"
          >
            {trackingError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-semibold text-red-600">
                {trackingError}
              </div>
            )}
            {submissionMutation.isError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-semibold text-red-600">
                {submissionMutation.error.response?.data?.message ||
                  "Unable to record this simulation. Please try again."}
              </div>
            )}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter your employee account details to continue.
              </p>
            </div>

            <div className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="simulation-email"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Work email
                </label>
                <input
                  id="simulation-email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  required
                  placeholder="name@company.com"
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="simulation-password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>
                  <span className="text-xs text-cyan-600">Forgot password?</span>
                </div>
                <input
                  id="simulation-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submissionMutation.isPending || Boolean(trackingError)}
              className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LockKeyhole className="h-4 w-4" />
              {submissionMutation.isPending ? "Continuing..." : "Continue securely"}
            </button>

            <p className="mt-6 text-center text-[11px] text-slate-400">
              Protected employee access · Reference {token.slice(-6) || "TEST01"}
            </p>
          </form>
        </div>
      </div>
    );
  }

  if (stage === "complete") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl md:p-10">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Training completed
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
            Your completion has been recorded for this simulation. Remember to
            pause, verify, and report suspicious messages.
          </p>
          <div className="mt-7 rounded-2xl bg-cyan-50 p-4 text-sm font-semibold text-cyan-800">
            No email address, password, or entered text was stored.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 md:py-16">
      <main className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Eye className="h-7 w-7" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
                Authorized awareness test
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                This was a phishing simulation
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                The page did not store what you entered. This safe exercise
                demonstrates how a convincing message can lead to an
                unverified sign-in page.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
              What to look for
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Three warning signs you may have missed
            </h2>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {warningSigns.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {autoTraining ? (
          <section className="mt-8 flex flex-col gap-5 rounded-3xl bg-slate-900 p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <h2 className="text-xl font-bold">Complete this awareness lesson</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                Confirm that you understand the warning signs. Only this
                completion event will be linked to your test record.
              </p>
              {trainingMutation.isError && (
                <p className="mt-3 text-sm font-semibold text-red-300">
                  {trainingMutation.error.response?.data?.message ||
                    "Unable to complete training. Please try again."}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => trainingMutation.mutate(token)}
              disabled={trainingMutation.isPending}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 text-sm font-bold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              {trainingMutation.isPending
                ? "Completing..."
                : "Complete training"}
            </button>
          </section>
        ) : (
          <section className="mt-8 rounded-3xl bg-slate-900 p-6 text-white md:p-8">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
              <div>
                <h2 className="text-xl font-bold">Awareness review complete</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Automatic training is disabled for this campaign, so no
                  training assignment or completion will be added.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default SimulatedLanding;
