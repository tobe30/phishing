import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle2,
  LockKeyhole,
  Mail,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import Loading from "../../components/Loading";
import {
  getSettings,
  updateSettings,
} from "../../lib/api";

const fieldClass =
  "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10";

const Settings = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    organizationName: "",
    industry: "",
    adminName: "",
    adminEmail: "",
    senderName: "",
    senderEmail: "",
    trackOpens: true,
    trackClicks: true,
    autoTraining: true,
  });
  const [saved, setSaved] = useState(false);
  const {
    data: settingsResponse,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  useEffect(() => {
    if (settingsResponse?.settings) {
      setForm(settingsResponse.settings);
    }
  }, [settingsResponse]);

  const settingsMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (data) => {
      setForm(data.settings);
      queryClient.setQueryData(["settings"], data);
      queryClient.setQueryData(["authUser"], (current) => ({
        ...current,
        user: {
          ...current?.user,
          fullName: data.settings.adminName,
          email: data.settings.adminEmail,
          organizationName: data.settings.organizationName,
          industry: data.settings.industry,
        },
      }));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    },
  });

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    settingsMutation.mutate(form);
  };

  if (isPending) {
    return <Loading message="Loading settings..." fullScreen={false} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <form onSubmit={handleSubmit} className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage the basic details and defaults used by your simulations.
            </p>
          </div>

          <button
            type="submit"
            disabled={settingsMutation.isPending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 text-sm font-bold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {settingsMutation.isPending ? "Saving..." : "Save changes"}
          </button>
        </div>

        {isError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
            Unable to load settings. Please refresh the page.
          </div>
        )}

        {settingsMutation.isError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
            {settingsMutation.error.response?.data?.message ||
              "Unable to save settings. Please try again."}
          </div>
        )}

        <div className="mt-7 space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Organization
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Basic information shown inside the admin dashboard.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="organization-name"
                  className="text-sm font-semibold text-slate-700"
                >
                  Organization name
                </label>
                <input
                  id="organization-name"
                  required
                  value={form.organizationName}
                  onChange={(event) =>
                    update("organizationName", event.target.value)
                  }
                  className={fieldClass}
                />
              </div>
              <div>
                <label
                  htmlFor="organization-industry"
                  className="text-sm font-semibold text-slate-700"
                >
                  Industry
                </label>
                <select
                  id="organization-industry"
                  value={form.industry}
                  onChange={(event) => update("industry", event.target.value)}
                  className={fieldClass}
                >
                  <option>Technology</option>
                  <option>Education</option>
                  <option>Finance</option>
                  <option>Healthcare</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <User className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Admin profile
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Contact details for the administrator of this simulation.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="admin-name"
                  className="text-sm font-semibold text-slate-700"
                >
                  Full name
                </label>
                <input
                  id="admin-name"
                  required
                  value={form.adminName}
                  onChange={(event) => update("adminName", event.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label
                  htmlFor="admin-email"
                  className="text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={form.adminEmail}
                  onChange={(event) => update("adminEmail", event.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Campaign defaults
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Default sender details and tracking options.
                  </p>
                </div>
              </div>
              <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 sm:inline-flex">
                Test mode
              </span>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="sender-name"
                  className="text-sm font-semibold text-slate-700"
                >
                  Default sender name
                </label>
                <input
                  id="sender-name"
                  required
                  value={form.senderName}
                  onChange={(event) => update("senderName", event.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label
                  htmlFor="sender-email"
                  className="text-sm font-semibold text-slate-700"
                >
                  Safe sender address
                </label>
                <input
                  id="sender-email"
                  type="email"
                  required
                  value={form.senderEmail}
                  onChange={(event) => update("senderEmail", event.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                {
                  key: "trackOpens",
                  label: "Track email opens",
                  description: "Estimated using a safe tracking pixel.",
                },
                {
                  key: "trackClicks",
                  label: "Track link clicks",
                  description: "Record unique recipient click events.",
                },
                {
                  key: "autoTraining",
                  label: "Show awareness lesson",
                  description: "Display training after the simulation.",
                },
              ].map((option) => (
                <label
                  key={option.key}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4"
                >
                  <input
                    type="checkbox"
                    checked={form[option.key]}
                    onChange={(event) =>
                      update(option.key, event.target.checked)
                    }
                    className="mt-0.5 h-4 w-4 accent-cyan-500"
                  />
                  <span>
                    <span className="block text-sm font-bold text-slate-800">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <LockKeyhole className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Security</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Password changes and SMTP credentials will be managed securely
                  by the backend. Sensitive credentials are not stored in this
                  frontend page.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
              Safe configuration mode enabled
            </div>
          </section>
        </div>

      </form>

      {saved && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white shadow-2xl">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          Settings saved
        </div>
      )}
    </div>
  );
};

export default Settings;
