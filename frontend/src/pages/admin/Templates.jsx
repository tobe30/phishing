import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Eye,
  FileText,
  Mail,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import {
  createTemplate,
  deleteTemplate,
  getTemplates,
  updateTemplate,
} from "../../lib/api";
import Loading from "../../components/Loading";

const colorStyles = {
  cyan: "bg-cyan-50 text-cyan-600 ring-cyan-100",
  violet: "bg-violet-50 text-violet-600 ring-violet-100",
  blue: "bg-blue-50 text-blue-600 ring-blue-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
};

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10";

const emptyTemplate = {
  name: "",
  category: "",
  subject: "",
  senderName: "",
  senderEmail: "",
  callToAction: "",
  body: "",
  color: "cyan",
};

const Templates = () => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const queryClient = useQueryClient();

  const {
    data: templateResponse,
    isPending: templatesLoading,
    isError: templatesError,
  } = useQuery({
    queryKey: ["templates"],
    queryFn: getTemplates,
  });

  const templates = templateResponse?.templates || [];

  const showToast = (message) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(""), 2200);
  };

  const createMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: (data) => {
      queryClient.setQueryData(["templates"], (current) => {
        const currentTemplates = current?.templates || [];

        return {
          success: true,
          count: currentTemplates.length + 1,
          templates: [...currentTemplates, data.template],
        };
      });
      setSelected(data.template);
      setDraft({ ...data.template });
      setSearch("");
      setEditing(false);
      setCreating(false);
      showToast("Template created");
    },
    onError: (error) => {
      showToast(error.response?.data?.message || "Unable to create template");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTemplate,
    onSuccess: (data) => {
      queryClient.setQueryData(["templates"], (current) => {
        const currentTemplates = current?.templates || [];

        return {
          ...current,
          templates: currentTemplates.map((template) =>
            template._id === data.template._id ? data.template : template,
          ),
        };
      });
      setSelected(data.template);
      setDraft({ ...data.template });
      setEditing(false);
      showToast("Template updated");
    },
    onError: (error) => {
      showToast(error.response?.data?.message || "Unable to update template");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: (_data, deletedTemplateId) => {
      queryClient.setQueryData(["templates"], (current) => {
        const remainingTemplates = (current?.templates || []).filter(
          (template) => template._id !== deletedTemplateId,
        );

        return {
          ...current,
          count: remainingTemplates.length,
          templates: remainingTemplates,
        };
      });
      closeModal();
      showToast("Template deleted");
    },
    onError: (error) => {
      showToast(error.response?.data?.message || "Unable to delete template");
    },
  });

  const filteredTemplates = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return templates;
    return templates.filter(
      (template) =>
        template.name.toLowerCase().includes(query) ||
        template.category.toLowerCase().includes(query) ||
        template.subject.toLowerCase().includes(query),
    );
  }, [search, templates]);

  const openPreview = (template) => {
    setSelected(template);
    setDraft({ ...template });
    setEditing(false);
    setCreating(false);
  };

  const openEditor = (template) => {
    setSelected(template);
    setDraft({ ...template });
    setEditing(true);
    setCreating(false);
  };

  const openCreator = () => {
    if (templates.length >= 5) {
      showToast("Delete a template before adding another");
      return;
    }

    setSelected(null);
    setDraft({ ...emptyTemplate });
    setEditing(true);
    setCreating(true);
  };

  const closeModal = () => {
    setSelected(null);
    setDraft(null);
    setEditing(false);
    setCreating(false);
  };

  const updateDraft = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const saveTemplate = (event) => {
    event.preventDefault();

    if (creating) {
      createMutation.mutate(draft);
      return;
    }

    updateMutation.mutate({
      id: selected._id,
      templateData: draft,
    });
  };

  const deleteSelectedTemplate = () => {
    if (!selected) return;
    deleteMutation.mutate(selected._id);
  };

  const savingTemplate =
    createMutation.isPending || updateMutation.isPending;

  if (templatesLoading) {
    return <Loading message="Loading templates..." fullScreen={false} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">
              <ShieldCheck className="h-4 w-4" />
              Safe simulation content
            </div>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Email templates</h1>
            <p className="mt-1 text-sm text-slate-500">
              Preview and edit the five approved templates used in awareness campaigns.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm">
              <span className="font-bold text-slate-900">{templates.length}</span>
              <span className="ml-1 text-slate-500">of 5 templates</span>
            </div>
            <button
              type="button"
              onClick={openCreator}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-cyan-500 px-4 text-sm font-bold text-white transition hover:bg-cyan-600"
            >
              <Plus className="h-4 w-4" />
              Add template
            </button>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
              placeholder="Search templates by name, category, or subject..."
            />
          </div>
          <p className="text-xs text-slate-400">
            Maximum of 5 approved templates
          </p>
        </div>

        {templatesError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
            Unable to load templates. Please refresh the page.
          </div>
        )}

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredTemplates.map((template) => (
            <article
              key={template._id}
              className="group flex min-h-[330px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start justify-between p-5 pb-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${colorStyles[template.color] || colorStyles.cyan}`}
                >
                  <Mail className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>

              <div className="flex flex-1 flex-col px-5 pb-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-600">
                  {template.category}
                </p>
                <h2 className="mt-2 text-lg font-bold text-slate-900">{template.name}</h2>

                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Subject line
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-slate-700">
                    {template.subject}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                    <span>{template.senderName}</span>
                    <span>·</span>
                    <span className="truncate">{template.senderEmail}</span>
                  </div>
                </div>

                <div className="mt-auto flex gap-2 pt-5">
                  <button
                    type="button"
                    onClick={() => openPreview(template)}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditor(template)}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 text-sm font-semibold text-white transition hover:bg-cyan-600"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {!templatesLoading && !templatesError && filteredTemplates.length === 0 && (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <FileText className="mx-auto h-8 w-8 text-slate-300" />
            <h2 className="mt-3 text-sm font-bold text-slate-700">No templates found</h2>
            <p className="mt-1 text-sm text-slate-400">Try another search term.</p>
          </div>
        )}
      </div>

      {(selected || creating) && draft && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) => event.target === event.currentTarget && closeModal()}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={creating ? "Add email template" : editing ? "Edit email template" : "Preview email template"}
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur md:px-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
                  {creating ? "Add template" : editing ? "Edit template" : "Email preview"}
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  {draft.name || "New email template"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {editing || creating ? (
              <form onSubmit={saveTemplate} className="p-5 md:p-7">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700" htmlFor="template-name">
                      Template name
                    </label>
                    <input
                      id="template-name"
                      required
                      value={draft.name}
                      onChange={(event) => updateDraft("name", event.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700" htmlFor="template-category">
                      Category
                    </label>
                    <input
                      id="template-category"
                      required
                      value={draft.category}
                      onChange={(event) => updateDraft("category", event.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-700" htmlFor="template-subject">
                      Email subject
                    </label>
                    <input
                      id="template-subject"
                      required
                      value={draft.subject}
                      onChange={(event) => updateDraft("subject", event.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700" htmlFor="template-sender">
                      Sender display name
                    </label>
                    <input
                      id="template-sender"
                      required
                      value={draft.senderName}
                      onChange={(event) => updateDraft("senderName", event.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700" htmlFor="template-email">
                      Safe sender address
                    </label>
                    <input
                      id="template-email"
                      type="email"
                      required
                      value={draft.senderEmail}
                      onChange={(event) => updateDraft("senderEmail", event.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-700" htmlFor="template-body">
                      Email body
                    </label>
                    <textarea
                      id="template-body"
                      required
                      rows={8}
                      value={draft.body}
                      onChange={(event) => updateDraft("body", event.target.value)}
                      className="mt-2 w-full resize-y rounded-xl border border-slate-200 p-3.5 text-sm leading-6 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                    />
                    <p className="mt-1.5 text-xs text-slate-400">
                      Use {"{{firstName}}"} to insert the recipient's first name.
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-700" htmlFor="template-cta">
                      Button text
                    </label>
                    <input
                      id="template-cta"
                      required
                      value={draft.callToAction}
                      onChange={(event) => updateDraft("callToAction", event.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      if (creating) {
                        closeModal();
                      } else {
                        setDraft({ ...selected });
                        setEditing(false);
                      }
                    }}
                    className="h-11 rounded-xl px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingTemplate}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-cyan-500 px-5 text-sm font-bold text-white transition hover:bg-cyan-600"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {savingTemplate
                      ? "Saving..."
                      : creating
                        ? "Create template"
                        : "Save changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-slate-100 p-4 md:p-8">
                <div className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-5 py-4 text-xs text-slate-500">
                    <div className="grid grid-cols-[55px_1fr] gap-y-2">
                      <span>From</span>
                      <span className="font-semibold text-slate-700">
                        {draft.senderName} &lt;{draft.senderEmail}&gt;
                      </span>
                      <span>Subject</span>
                      <span className="font-semibold text-slate-900">{draft.subject}</span>
                    </div>
                  </div>
                  <div className="px-6 py-8 md:px-9">
                    <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                      <ShieldCheck className="h-6 w-6 text-cyan-500" />
                      PhishGuard Training
                    </div>
                    <div className="mt-7 whitespace-pre-line text-sm leading-7 text-slate-600">
                      {draft.body}
                    </div>
                    <button
                      type="button"
                      className="mt-7 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-white"
                    >
                      {draft.callToAction}
                    </button>
                    <p className="mt-7 border-t border-slate-100 pt-5 text-xs leading-5 text-slate-400">
                      Authorized simulation preview. Recipient input is never retained.
                    </p>
                  </div>
                </div>

                <div className="mx-auto mt-5 flex max-w-xl justify-end gap-3">
                  <button
                    type="button"
                    onClick={deleteSelectedTemplate}
                    disabled={deleteMutation.isPending}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-200 px-5 text-sm font-bold text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit template
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[80] flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white shadow-2xl">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default Templates;
