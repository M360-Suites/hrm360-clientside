import { useState, useEffect, useMemo } from "react";
import { LogOut, Plus, Search, Loader2, Calendar, FileText, CheckCircle2, Clock3, Eye, MoreVertical } from "lucide-react";
import { useExitStore } from "../../store/useExitStore";
import type { ExitRequest } from "../../store/useExitStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useEmployeeStore } from "../../store/useEmployeeStore";

const statuses = ["All", "Pending", "Approved", "Terminated", "In Progress", "Completed"];
const exitTypes = ["All", "Resignation", "Contract End", "Termination"];

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return "bg-blue-50 text-blue-600";
    case "in progress":
      return "bg-amber-50 text-amber-600";
    case "completed":
      return "bg-emerald-50 text-emerald-600";
    case "terminated":
      return "bg-rose-50 text-rose-600";
    case "pending":
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "-";

export default function Exit() {
  const { user, isAdmin } = useAuthStore();
  const { employees, fetchEmployees } = useEmployeeStore();
  const {
    exits,
    userExits,
    stats,
    isLoading,
    isSubmitting,
    error,
    fetchExits,
    fetchExitStats,
    fetchUserExits,
    initiateExit,
    initiateUserExit,
  } = useExitStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [selectedExit, setSelectedExit] = useState<ExitRequest | null>(null);
  
  const [formData, setFormData] = useState({
    employeeId: "",
    exitType: "Resignation",
    lastDay: "",
    hrNote: "",
  });

  const role = String(user?.role || "").trim().toLowerCase();
  const canManageExit = isAdmin || ["admin", "owner", "super_admin", "hr", "hr_staff", "human resources"].includes(role);

  useEffect(() => {
    if (canManageExit) {
      fetchExits("", typeFilter);
      fetchExitStats();
      fetchEmployees({ page: 1, limit: 1000 });
    } else {
      fetchUserExits();
    }
  }, [canManageExit, typeFilter]);

  const activeExits = canManageExit ? exits : userExits;

  const filteredExits = useMemo(() => {
    let filtered = activeExits;
    
    if (statusFilter !== "All") {
      filtered = filtered.filter((exit) => String(exit.status).toLowerCase() === statusFilter.toLowerCase());
    }

    if (!canManageExit && typeFilter !== "All") {
      filtered = filtered.filter((exit) => String(exit.exitType).toLowerCase() === typeFilter.toLowerCase());
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((exit) => {
        const empName = exit.employeeName || (typeof exit.employee === 'object' ? exit.employee?.name : "") || "";
        const empEmail = exit.employeeEmail || (typeof exit.employee === 'object' ? exit.employee?.email : "") || "";
        return empName.toLowerCase().includes(q) || empEmail.toLowerCase().includes(q) || exit.exitType?.toLowerCase().includes(q);
      });
    }
    
    return filtered;
  }, [activeExits, statusFilter, typeFilter, searchQuery, canManageExit]);

  const handleInitiateExit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success = false;
    
    if (canManageExit) {
      if (!formData.employeeId) return alert("Please select an employee");
      success = await initiateExit({
        employeeId: formData.employeeId,
        exitType: formData.exitType,
        lastDay: formData.lastDay,
        hrNote: formData.hrNote,
      });
    } else {
      success = await initiateUserExit({
        exitType: formData.exitType,
        lastDay: formData.lastDay,
      });
    }

    if (success) {
      setShowInitiateModal(false);
      setFormData({ employeeId: "", exitType: "Resignation", lastDay: "", hrNote: "" });
      if (canManageExit) {
        fetchExits("", typeFilter);
        fetchExitStats();
      } else {
        fetchUserExits();
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#4A1D96]">Offboarding</p>
          <h2 className="text-2xl font-semibold text-gray-900">Exit Management</h2>
          <p className="mt-1 text-sm text-gray-500">
            {canManageExit ? "Manage employee offboarding, resignations, and terminations." : "Track your exit and offboarding progress."}
          </p>
        </div>
        <button
          onClick={() => setShowInitiateModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4A1D96] px-5 py-3 text-sm font-semibold text-white"
        >
          <Plus size={17} />{canManageExit ? "Initiate Exit" : "Resign"}
        </button>
      </div>

      {canManageExit && stats && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:p-5">
            <div className="mb-4 w-fit rounded-xl p-2.5 bg-indigo-50 text-[#4A1D96]">
              <LogOut size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">Total Exits</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:p-5">
            <div className="mb-4 w-fit rounded-xl p-2.5 bg-amber-50 text-amber-600">
              <Clock3 size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.pending || 0}</p>
            <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">Pending Approval</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:p-5">
            <div className="mb-4 w-fit rounded-xl p-2.5 bg-blue-50 text-blue-600">
              <FileText size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{(stats.approved || 0) + (stats.terminated || 0)}</p>
            <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">In Progress</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:p-5">
            <div className="mb-4 w-fit rounded-xl p-2.5 bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.completed || 0}</p>
            <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">Completed</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xs mt-8">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={"whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition " + (statusFilter === status ? "bg-[#4A1D96] text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100")}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {canManageExit && (
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 outline-hidden transition focus:border-[#4A1D96] focus:ring-2 focus:ring-[#4A1D96]/10 sm:w-auto"
              >
                {exitTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            )}
            <label className="relative sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 pl-10 text-sm text-gray-800 outline-hidden transition focus:border-[#4A1D96] focus:ring-2 focus:ring-[#4A1D96]/10"
                placeholder="Search employee or type"
              />
            </label>
          </div>
        </div>

        <div className="min-h-72 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-xs z-10 text-[#4A1D96]">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : filteredExits.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredExits.map((exit, idx) => {
                const empName = exit.employeeName || (typeof exit.employee === 'object' ? exit.employee?.name : "") || "Unknown Employee";
                const empRole = exit.employeeRole || (typeof exit.employee === 'object' ? exit.employee?.role : "") || "Employee";
                
                return (
                  <article key={exit._id || exit.id || idx} className="p-5 transition hover:bg-[#FAFAFF] sm:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className={"rounded-full px-3 py-1 text-xs font-semibold " + getStatusColor(exit.status)}>
                            {exit.status || "Pending"}
                          </span>
                          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-[#4A1D96]">
                            {exit.exitType}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900">{canManageExit ? empName : exit.exitType}</h3>
                        {canManageExit && <p className="mt-1 text-sm text-gray-500">{empRole}</p>}
                        
                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={15} className="text-[#4A1D96]" />
                            Last Day: {formatDate(exit.lastDay)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock3 size={15} className="text-[#4A1D96]" />
                            Filed: {formatDate(exit.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => alert("Exit details modal placeholder")}
                          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          <Eye size={16} /> Details
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <div className="rounded-2xl bg-indigo-50 p-4 text-[#4A1D96]">
                <LogOut size={28} />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">No exits found</h3>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                {canManageExit ? "There are no exit records matching your criteria." : "You have no active exit requests."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Initiate Exit Modal */}
      {showInitiateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <div className="mobile-safe-bottom bg-white rounded-t-3xl shadow-2xl w-full max-w-lg max-h-[92dvh] overflow-y-auto sm:rounded-3xl">
            <div className="p-5 sm:p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{canManageExit ? "Initiate Exit" : "Submit Resignation"}</h3>
              <p className="text-sm text-gray-500 mb-6">
                {canManageExit ? "Start the offboarding process for an employee." : "Start your exit and offboarding process."}
              </p>

              <form className="space-y-4" onSubmit={handleInitiateExit}>
                {canManageExit && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Employee</label>
                    <select
                      required
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#4A1D96]/20 focus:border-[#4A1D96]"
                    >
                      <option value="">Select an employee...</option>
                      {employees.map(emp => (
                        <option key={emp._id || emp.id} value={emp._id || emp.id}>
                          {emp.name || emp.fullName || emp.email}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Exit Type</label>
                  <select
                    required
                    value={formData.exitType}
                    onChange={(e) => setFormData({ ...formData, exitType: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#4A1D96]/20 focus:border-[#4A1D96]"
                  >
                    {canManageExit ? (
                      <>
                        <option value="Resignation">Resignation</option>
                        <option value="Contract End">Contract End</option>
                        <option value="Termination">Termination</option>
                      </>
                    ) : (
                      <option value="Resignation">Resignation</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Expected Last Day</label>
                  <input
                    type="date"
                    required
                    value={formData.lastDay}
                    onChange={(e) => setFormData({ ...formData, lastDay: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#4A1D96]/20 focus:border-[#4A1D96]"
                  />
                </div>

                {canManageExit && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">HR Notes (Optional)</label>
                    <textarea
                      rows={3}
                      value={formData.hrNote}
                      onChange={(e) => setFormData({ ...formData, hrNote: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#4A1D96]/20 focus:border-[#4A1D96] resize-y"
                      placeholder="Add any internal notes..."
                    />
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowInitiateModal(false)}
                    className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-[#4A1D96] hover:bg-[#8B5CF6] text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
