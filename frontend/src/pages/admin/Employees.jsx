import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Download,
  Plus,
  Search,
  SlidersHorizontal,
  X,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";
import Loading from "../../components/Loading";
import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee,
} from "../../lib/api";

const baseDepartments = [
  "Engineering",
  "Finance",
  "Human Resources",
  "Legal",
  "Marketing",
  "Operations",
  "Sales",
  "Support",
];

// ================= RISK BADGE =================
// Props: score: number
const RiskBadge = ({ score }) => {
  const style =
    score < 30
      ? "bg-emerald-50 text-emerald-600"
      : score < 60
      ? "bg-amber-50 text-amber-600"
      : "bg-red-50 text-red-600";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${style}`}>
      {score}
    </span>
  );
};

// ================= SIMULATION STATUS BADGE =================
// Props: status: "REPORTED" | "SUBMITTED" | "CLICKED" | "SAFE"
const SimStatusBadge = ({ status }) => {
  const styles = {
    REPORTED: "bg-emerald-50 text-emerald-600",
    SUBMITTED: "bg-red-50 text-red-600",
    CLICKED: "bg-amber-50 text-amber-600",
    SAFE: "bg-emerald-50 text-emerald-600",
  };

  const labels = {
    REPORTED: "Reported",
    SUBMITTED: "Submitted",
    CLICKED: "Clicked",
    SAFE: "Safe",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
        styles[status] ?? "bg-slate-100 text-slate-500"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status] ?? status}
    </span>
  );
};

// ================= SHARED TD STYLE =================
const tdBase = "border-y border-slate-100 bg-white py-5 px-4";

const emptyForm = {
  name: "",
  email: "",
  department: "",
};

const Employees = () => {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const queryClient = useQueryClient();

  const {
    data: employeeResponse,
    isPending: employeesLoading,
    isError: employeesError,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  const employeeList = employeeResponse?.employees || [];

  const departmentOptions = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set([
          ...baseDepartments,
          ...employeeList.map((employee) => employee.department),
        ]),
      ).sort(),
    ],
    [employeeList],
  );

  const filteredEmployees = useMemo(() => {
    return employeeList.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase());

      const matchesDepartment =
        departmentFilter === "All" || item.department === departmentFilter;

      const matchesRisk =
        riskFilter === "All" ||
        (riskFilter === "LOW" && item.risk < 30) ||
        (riskFilter === "MEDIUM" && item.risk >= 30 && item.risk < 60) ||
        (riskFilter === "HIGH" && item.risk >= 60);

      return matchesSearch && matchesDepartment && matchesRisk;
    });
  }, [employeeList, search, departmentFilter, riskFilter]);

  const {
    currentPage,
    setCurrentPage,
    rowsPerPage,
    totalPages,
    paginatedData,
  } = usePagination(filteredEmployees, 6);

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: (data) => {
      queryClient.setQueryData(["employees"], (current) => {
        const currentEmployees = current?.employees || [];

        return {
          success: true,
          count: currentEmployees.length + 1,
          employees: [data.employee, ...currentEmployees],
        };
      });
      setSearch("");
      setCurrentPage(1);
      closeModal();
    },
    onError: (error) => {
      setFormError(
        error.response?.data?.message || "Unable to create employee",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateEmployee,
    onSuccess: (data) => {
      queryClient.setQueryData(["employees"], (current) => {
        const currentEmployees = current?.employees || [];

        return {
          ...current,
          employees: currentEmployees.map((employee) =>
            employee._id === data.employee._id ? data.employee : employee,
          ),
        };
      });
      closeModal();
    },
    onError: (error) => {
      setFormError(
        error.response?.data?.message || "Unable to update employee",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: (_data, deletedEmployeeId) => {
      queryClient.setQueryData(["employees"], (current) => {
        const remainingEmployees = (current?.employees || []).filter(
          (employee) => employee._id !== deletedEmployeeId,
        );

        return {
          ...current,
          count: remainingEmployees.length,
          employees: remainingEmployees,
        };
      });
      setEmployeeToDelete(null);
      setDeleteError("");
      setCurrentPage(1);
    },
    onError: (error) => {
      setDeleteError(
        error.response?.data?.message || "Unable to delete employee",
      );
    },
  });

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (e) => {
    setDepartmentFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleRiskChange = (e) => {
    setRiskFilter(e.target.value);
    setCurrentPage(1);
  };

  const exportCsv = () => {
    const headings = [
      "Name",
      "Email",
      "Department",
      "Risk Score",
      "Last Simulation",
      "Training Completed",
      "Training Assigned",
    ];

    const safeCsvValue = (value) => {
      const text = String(value ?? "");
      const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
      return `"${safeText.replaceAll('"', '""')}"`;
    };

    const rows = filteredEmployees.map((employee) => [
      employee.name,
      employee.email,
      employee.department,
      employee.risk,
      employee.lastSimulation,
      employee.trainingDone,
      employee.trainingTotal,
    ]);

    const csv = [headings, ...rows]
      .map((row) => row.map(safeCsvValue).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "phishguard-employees.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFormChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingEmployee(null);
    setForm(emptyForm);
    setFormError("");
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setForm({
      name: employee.name,
      email: employee.email,
      department: employee.department,
    });
    setShowAddModal(true);
  };

  const handleSaveEmployee = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.department) return;

    setFormError("");

    const employeeData = {
      name: form.name.trim(),
      email: form.email.trim(),
      department: form.department,
    };

    if (editingEmployee) {
      updateMutation.mutate({
        id: editingEmployee._id,
        employeeData,
      });
      return;
    }

    createMutation.mutate(employeeData);
  };

  const handleDeleteEmployee = () => {
    if (!employeeToDelete) return;
    deleteMutation.mutate(employeeToDelete._id);
  };

  const savingEmployee =
    createMutation.isPending || updateMutation.isPending;

  if (employeesLoading) {
    return <Loading message="Loading employees..." fullScreen={false} />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Employees</h1>
          <p className="mt-1 text-sm text-slate-500">
            Everyone in your organization and how they're doing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={exportCsv}
            disabled={filteredEmployees.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            <Plus className="h-4 w-4" />
            Add employee
          </button>
        </div>
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
            placeholder="Search by name or email..."
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* DEPARTMENT FILTER */}
        <div className="relative">
          <select
            value={departmentFilter}
            onChange={handleDepartmentChange}
            className="h-11 appearance-none rounded-2xl border border-slate-200 bg-white pl-11 pr-9 text-sm font-medium text-slate-700 focus:border-cyan-400 focus:outline-none"
          >
            <option value="All">Department</option>
            {departmentOptions
              .filter((d) => d !== "All")
              .map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
          </select>
          <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>

        {/* RISK FILTER */}
        <div className="relative">
          <select
            value={riskFilter}
            onChange={handleRiskChange}
            className="h-11 appearance-none rounded-2xl border border-slate-200 bg-white pl-11 pr-9 text-sm font-medium text-slate-700 focus:border-cyan-400 focus:outline-none"
          >
            <option value="All">Risk</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* ================= TABLE ================= */}
      {employeesError && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
          Unable to load employees. Please refresh the page.
        </div>
      )}

      <div className="mt-6 rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto p-4">
          <table className="w-full min-w-[900px] border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                <th className="rounded-l-xl bg-slate-50 py-3 px-4 text-left min-w-[220px]">
                  Employee
                </th>
                <th className="bg-slate-50 py-3 px-4 text-left min-w-[140px]">
                  Department
                </th>
                <th className="bg-slate-50 py-3 px-4 text-left">Risk</th>
                <th className="bg-slate-50 py-3 px-4 text-left">
                  Last simulation
                </th>
                <th className="bg-slate-50 py-3 px-4 text-left">
                  Training progress
                </th>
                <th className="rounded-r-xl bg-slate-50 py-3 px-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="rounded-2xl border border-slate-100 bg-white py-10 text-center text-sm text-slate-400"
                  >
                    No employees match your filters.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item._id} className="group">
                    {/* EMPLOYEE */}
                    <td className={`rounded-l-xl border-l ${tdBase}`}>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {item.email}
                      </p>
                    </td>

                    {/* DEPARTMENT */}
                    <td className={tdBase}>
                      <span className="text-sm text-slate-600">
                        {item.department}
                      </span>
                    </td>

                    {/* RISK */}
                    <td className={tdBase}>
                      <RiskBadge score={item.risk} />
                    </td>

                    {/* LAST SIMULATION */}
                    <td className={tdBase}>
                      <SimStatusBadge status={item.lastSimulation} />
                    </td>

                    {/* TRAINING PROGRESS */}
                    <td className={tdBase}>
                      <span className="text-sm font-semibold text-slate-700">
                        {item.trainingDone}/{item.trainingTotal}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className={`rounded-r-xl border-r ${tdBase}`}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-cyan-50 hover:text-cyan-600"
                          aria-label={`Edit ${item.name}`}
                          title="Edit employee"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEmployeeToDelete(item)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${item.name}`}
                          title="Delete employee"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
          totalItems={filteredEmployees.length}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ================= ADD EMPLOYEE MODAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal */}
          <form
            onSubmit={handleSaveEmployee}
            className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingEmployee ? "Edit employee" : "Add employee"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {editingEmployee
                    ? "Update this employee's profile."
                    : "Add a single team member. They'll be eligible for simulations and training immediately."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {/* FULL NAME */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Full name
                </label>
                <input
                  value={form.name}
                  onChange={handleFormChange("name")}
                  type="text"
                  placeholder="Jane Doe"
                  required
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* WORK EMAIL */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Work email
                </label>
                <input
                  value={form.email}
                  onChange={handleFormChange("email")}
                  type="email"
                  placeholder="jane.doe@acme.co"
                  required
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Department
                </label>
                <select
                  value={form.department}
                  onChange={handleFormChange("department")}
                  required
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="" disabled>
                    Select...
                  </option>
                  {departmentOptions
                    .filter((d) => d !== "All")
                    .map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                </select>
              </div>

              <p className="rounded-xl bg-cyan-50 px-4 py-3 text-xs leading-5 text-cyan-800">
                Risk and training progress are calculated automatically from
                simulation activity.
              </p>

              {formError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
                  {formError}
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={savingEmployee}
                className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600"
              >
                {savingEmployee
                  ? "Saving..."
                  : editingEmployee
                    ? "Save changes"
                    : "Add employee"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION ================= */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setEmployeeToDelete(null)}
          />

          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-employee-title"
            className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2
              id="delete-employee-title"
              className="mt-4 text-lg font-bold text-slate-900"
            >
              Delete employee?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              <span className="font-semibold text-slate-700">
                {employeeToDelete.name}
              </span>{" "}
              will be removed from the employee list and future campaign
              selections.
            </p>

            {deleteError && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
                {deleteError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEmployeeToDelete(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEmployee}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
