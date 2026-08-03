import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  FileText,
  Info,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";
import Loading from "../../components/Loading";
import {
  createCampaign as createCampaignApi,
  getEmployees,
  getTemplates,
} from "../../lib/api";

const steps = [
  { id: 1, label: "Campaign details" },
  { id: 2, label: "Email template" },
  { id: 3, label: "Target audience" },
  { id: 4, label: "Review" },
];

const fieldClass =
  "mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10";

const NewCampaign = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    description: "",
    templateId: "",
    subject: "",
    senderName: "IT Support",
    senderEmail: "security@example.test",
    groupId: "",
    authorized: false,
  });

  const {
    data: templateResponse,
    isPending: templatesLoading,
    isError: templatesError,
  } = useQuery({
    queryKey: ["templates"],
    queryFn: getTemplates,
  });

  const {
    data: employeeResponse,
    isPending: employeesLoading,
    isError: employeesError,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  const templates = templateResponse?.templates || [];
  const employees = employeeResponse?.employees || [];

  const groups = useMemo(() => {
    const departmentCounts = employees.reduce((counts, employee) => {
      counts[employee.department] = (counts[employee.department] || 0) + 1;
      return counts;
    }, {});

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newHireCount = employees.filter(
      (employee) => new Date(employee.createdAt) >= thirtyDaysAgo,
    ).length;

    const departmentGroups = Object.entries(departmentCounts)
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([department, count]) => ({
        id: department,
        name: department,
        department: "Department",
        count,
      }));

    return [
      {
        id: "all",
        name: "All Employees",
        department: "Entire organization",
        count: employees.length,
      },
      ...departmentGroups,
      {
        id: "new-hires",
        name: "New Hires",
        department: "Joined in the last 30 days",
        count: newHireCount,
      },
    ];
  }, [employees]);

  const selectedTemplate = useMemo(
    () => templates.find((item) => item._id === form.templateId),
    [form.templateId, templates],
  );
  const selectedGroup = useMemo(
    () => groups.find((item) => item.id === form.groupId),
    [form.groupId, groups],
  );

  const campaignMutation = useMutation({
    mutationFn: createCampaignApi,
    onSuccess: (data) => {
      queryClient.setQueryData(["campaigns"], (current) => {
        const currentCampaigns = current?.campaigns || [];
        const newCampaign = {
          ...data.campaign,
          template: selectedTemplate,
        };

        return {
          success: true,
          count: currentCampaigns.length + 1,
          campaigns: [newCampaign, ...currentCampaigns],
        };
      });
      navigate("/campaigns", { replace: true });
    },
    onError: (error) => {
      setErrors((current) => ({
        ...current,
        submit:
          error.response?.data?.message ||
          "Unable to create and send this campaign.",
      }));
    },
  });

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validateStep = () => {
    const nextErrors = {};

    if (step === 1 && !form.name.trim()) {
      nextErrors.name = "Enter a campaign name.";
    }
    if (step === 2) {
      if (!form.templateId) nextErrors.templateId = "Choose an email template.";
      if (!form.subject.trim()) nextErrors.subject = "Enter an email subject.";
      if (!form.senderName.trim()) nextErrors.senderName = "Enter a sender name.";
    }
    if (step === 3 && !form.groupId) {
      nextErrors.groupId = "Choose a target audience.";
    }
    if (step === 4 && !form.authorized) {
      nextErrors.authorized = "Confirm that this simulation is authorized.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setStep((current) => Math.min(current + 1, 4));
  };

  const chooseTemplate = (template) => {
    setForm((current) => ({
      ...current,
      templateId: template._id,
      subject: template.subject,
      senderName: template.senderName,
      senderEmail: template.senderEmail,
    }));
    setErrors((current) => ({ ...current, templateId: undefined }));
  };

  const handleCreateCampaign = () => {
    if (!validateStep()) return;
    setErrors((current) => ({ ...current, submit: undefined }));
    campaignMutation.mutate(form);
  };

  if (templatesLoading || employeesLoading) {
    return <Loading message="Preparing campaign..." fullScreen={false} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => navigate("/campaigns")}
              className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              aria-label="Back to campaigns"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                Create a campaign
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Build an authorized phishing-awareness simulation for your test employees.
              </p>
            </div>
          </div>

        </div>

        {(templatesError || employeesError) && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
            Unable to load templates or employees. Please refresh the page.
          </div>
        )}

        <div className="mt-7 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex min-w-[620px] items-center">
            {steps.map((item, index) => {
              const complete = step > item.id;
              const active = step === item.id;
              return (
                <div key={item.id} className="flex flex-1 items-center last:flex-none">
                  <button
                    type="button"
                    onClick={() => complete && setStep(item.id)}
                    className="flex items-center gap-3 text-left"
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition ${
                        complete
                          ? "bg-emerald-500 text-white"
                          : active
                            ? "bg-cyan-500 text-white ring-4 ring-cyan-100"
                            : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {complete ? <Check className="h-4 w-4" /> : item.id}
                    </span>
                    <span>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Step {item.id}
                      </span>
                      <span className={`text-sm font-semibold ${active ? "text-slate-900" : "text-slate-500"}`}>
                        {item.label}
                      </span>
                    </span>
                  </button>
                  {index < steps.length - 1 && (
                    <span className={`mx-5 h-px flex-1 ${complete ? "bg-emerald-300" : "bg-slate-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            {step === 1 && (
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                  <FileText className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900">Campaign details</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Give this simulation a clear internal name and purpose.
                </p>

                <div className="mt-7">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="campaign-name">
                    Campaign name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="campaign-name"
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    className={`${fieldClass} ${errors.name ? "border-red-400" : ""}`}
                    placeholder="e.g. Q3 Payroll Awareness Test"
                    maxLength={80}
                  />
                  <div className="mt-1.5 flex justify-between text-xs">
                    <span className="text-red-500">{errors.name}</span>
                    <span className="text-slate-400">{form.name.length}/80</span>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="campaign-description">
                    Description <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    id="campaign-description"
                    value={form.description}
                    onChange={(event) => update("description", event.target.value)}
                    className="mt-2 min-h-32 w-full resize-y rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                    placeholder="What security behaviour are you testing?"
                    maxLength={240}
                  />
                  <p className="mt-1.5 text-right text-xs text-slate-400">
                    {form.description.length}/240
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                  <Mail className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900">Choose an email template</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Select one of the safe pre-built scenarios for this simulation.
                </p>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  {templates.map((template) => {
                    const selected = form.templateId === template._id;
                    return (
                      <button
                        key={template._id}
                        type="button"
                        onClick={() => chooseTemplate(template)}
                        className={`relative rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-cyan-500 bg-cyan-50/60 ring-2 ring-cyan-500/10"
                            : "border-slate-200 hover:border-cyan-300 hover:bg-slate-50"
                        }`}
                      >
                        {selected && (
                          <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-white">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600">
                          {template.category}
                        </span>
                        <h3 className="mt-2 pr-7 text-sm font-bold text-slate-900">{template.name}</h3>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                          {template.body}
                        </p>
                        <span className="mt-4 inline-flex rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                          {template.callToAction || "Open link"}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {templates.length === 0 && (
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
                    No email templates found. Create a template before starting a campaign.
                  </div>
                )}
                {errors.templateId && <p className="mt-2 text-xs text-red-500">{errors.templateId}</p>}

                <div className="mt-7 grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700" htmlFor="email-subject">
                      Email subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email-subject"
                      value={form.subject}
                      onChange={(event) => update("subject", event.target.value)}
                      className={`${fieldClass} ${errors.subject ? "border-red-400" : ""}`}
                      placeholder="Enter the email subject"
                    />
                    {errors.subject && <p className="mt-1.5 text-xs text-red-500">{errors.subject}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700" htmlFor="sender-name">
                      Sender name
                    </label>
                    <input
                      id="sender-name"
                      value={form.senderName}
                      onChange={(event) => update("senderName", event.target.value)}
                      className={fieldClass}
                      placeholder="IT Support"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700" htmlFor="sender-email">
                      Test sender email
                    </label>
                    <input
                      id="sender-email"
                      value={form.senderEmail}
                      onChange={(event) => update("senderEmail", event.target.value)}
                      className={fieldClass}
                      type="email"
                      placeholder="security@example.test"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                  <Users className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900">Select the target audience</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Choose one authorized employee group for the simulation.
                </p>

                <div className="mt-6 space-y-3">
                  {groups.map((group) => {
                    const selected = form.groupId === group.id;
                    return (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => update("groupId", group.id)}
                        className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-cyan-500 bg-cyan-50/60 ring-2 ring-cyan-500/10"
                            : "border-slate-200 hover:border-cyan-300 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            selected ? "bg-cyan-500 text-white" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {group.id === "all" ? <Building2 className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-slate-900">{group.name}</span>
                          <span className="mt-0.5 block text-xs text-slate-500">{group.department}</span>
                        </span>
                        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
                          {group.count} people
                        </span>
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                            selected ? "border-cyan-500 bg-cyan-500 text-white" : "border-slate-300"
                          }`}
                        >
                          {selected && <Check className="h-3 w-3" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {employees.length === 0 && (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
                    No employees found. Add employees before starting a campaign.
                  </div>
                )}
                {errors.groupId && <p className="mt-2 text-xs text-red-500">{errors.groupId}</p>}

              </div>
            )}

            {step === 4 && (
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900">Review your campaign</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Confirm the details before creating this simulation.
                </p>

                <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200">
                  {[
                    ["Campaign", form.name],
                    ["Template", selectedTemplate?.name],
                    ["Email subject", form.subject],
                    ["Sender", `${form.senderName} <${form.senderEmail}>`],
                    ["Audience", selectedGroup ? `${selectedGroup.name} (${selectedGroup.count} people)` : ""],
                    ["Delivery", "Send immediately"],
                  ].map(([label, value]) => (
                    <div key={label} className="grid gap-1 border-b border-slate-100 px-5 py-4 last:border-0 sm:grid-cols-[150px_1fr]">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
                      <span className="break-words text-sm font-semibold text-slate-800">{value || "Not provided"}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex gap-3">
                    <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                    <div>
                      <h3 className="text-sm font-bold text-amber-900">Safe simulation requirement</h3>
                      <p className="mt-1 text-xs leading-5 text-amber-800">
                        PhishGuard records only interaction events. It must never store passwords or other text entered by recipients.
                      </p>
                    </div>
                  </div>
                </div>

                <label className={`mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${errors.authorized ? "border-red-300 bg-red-50" : "border-slate-200"}`}>
                  <input
                    type="checkbox"
                    checked={form.authorized}
                    onChange={(event) => update("authorized", event.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-cyan-500"
                  />
                  <span>
                    <span className="block text-sm font-bold text-slate-900">
                      I confirm this is an authorized security-awareness simulation.
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      All recipients are part of an approved test group and no real credentials will be collected.
                    </span>
                    {errors.authorized && <span className="mt-1 block text-xs text-red-500">{errors.authorized}</span>}
                  </span>
                </label>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => (step === 1 ? navigate("/campaigns") : setStep((current) => current - 1))}
                className="inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                <ArrowLeft className="h-4 w-4" />
                {step === 1 ? "Cancel" : "Back"}
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-cyan-500 px-5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-600"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreateCampaign}
                  disabled={campaignMutation.isPending}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-cyan-500 px-5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {campaignMutation.isPending ? "Sending emails..." : "Create and send"}
                </button>
              )}
            </div>
            {errors.submit && (
              <p className="mt-3 text-right text-sm font-semibold text-red-500">
                {errors.submit}
              </p>
            )}
          </section>

          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Campaign summary
            </p>
            <div className="mt-5 space-y-5">
              <div>
                <p className="text-xs text-slate-400">Name</p>
                <p className="mt-1 text-sm font-bold text-slate-800">{form.name || "Untitled campaign"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Template</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{selectedTemplate?.name || "Not selected"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Audience</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {selectedGroup ? `${selectedGroup.name} · ${selectedGroup.count}` : "Not selected"}
                </p>
              </div>
            </div>
            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-xs font-bold">Safe simulation</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Recipient input is never retained. Only open, click, submission-event, and training activity should be recorded.
              </p>
            </div>
          </aside>
        </div>

      </div>
    </div>
  );
};

export default NewCampaign;
