import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Calendar, Loader2, X, MoreVertical, Download } from "lucide-react";
import { useLeaveStore } from "../../store/useLeaveStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useEmployeeStore } from "../../store/useEmployeeStore";

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return "bg-emerald-50 text-emerald-600";
    case "rejected":
      return "bg-rose-50 text-rose-600";
    case "pending":
      return "bg-amber-50 text-amber-600";
    default:
      return "bg-gray-50 text-gray-600";
  }
};

const normalizeType = (type: string) => String(type || "").toLowerCase();

const getLeaveDays = (startDate?: string, endDate?: string) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const ms = end.getTime() - start.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
  return Number.isFinite(days) && days > 0 ? days : 0;
};

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : "-";

const getLeaveEmployee = (leave: any) => {
  const employeeObj =
    typeof leave?.employee === "object"
      ? leave.employee
      : typeof leave?.employeeId === "object"
      ? leave.employeeId
      : null;

  return {
    name:
      leave?.employeeName ||
      employeeObj?.name ||
      employeeObj?.fullName ||
      "Employee",
    email:
      leave?.employeeEmail ||
      employeeObj?.email ||
      "",
    role:
      leave?.employeeRole ||
      employeeObj?.role ||
      "",
    department:
      leave?.department ||
      employeeObj?.department ||
      "",
  };
};

const Leave = () => {
  const fetchedOnce = useRef(false);
  const { isAdmin } = useAuthStore();
  const { employees, fetchEmployees } = useEmployeeStore();

  const {
    leaves,
    orgStats,
    userStats,
    isLoading,
    fetchLeaves,
    fetchOrgLeaveStats,
    fetchUserLeaveStats,
    fetchEmployeeLeaves,
    requestLeave,
    approveLeave,
    rejectLeave,
  } = useLeaveStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("all");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    type: "Annual Leave",
    startDate: "",
    endDate: "",
    reason: "",
    document: "",
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;

    fetchLeaves();

    if (isAdmin) {
      fetchEmployees();
      fetchOrgLeaveStats();
    } else {
      fetchUserLeaveStats();
    }
  }, [isAdmin, fetchEmployees, fetchLeaves, fetchOrgLeaveStats, fetchUserLeaveStats]);

  useEffect(() => {
    if (!isAdmin) return;

    if (selectedEmployeeId === "all") {
      fetchLeaves();
      return;
    }

    fetchEmployeeLeaves(selectedEmployeeId);
  }, [isAdmin, selectedEmployeeId, fetchLeaves, fetchEmployeeLeaves]);

  const filteredLeaves = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return leaves;

    return leaves.filter((leave: any) => {
      const employee = getLeaveEmployee(leave);
      const employeeName = employee.name || "";
      const employeeEmail = employee.email || "";
      const type = leave.type || "";
      const reason = leave.reason || "";
      return [employeeName, employeeEmail, type, reason].join(" ").toLowerCase().includes(query);
    });
  }, [leaves, searchQuery]);

  const leaveTypeStats = useMemo(() => {
    const fromList = {
      annual: leaves.filter((l: any) => normalizeType(l.type).includes("annual")).length,
      sick: leaves.filter((l: any) => normalizeType(l.type).includes("sick")).length,
      maternity: leaves.filter((l: any) => normalizeType(l.type).includes("maternity")).length,
      compassionate: leaves.filter((l: any) => normalizeType(l.type).includes("compassion")).length,
    };

    const statsSource = isAdmin ? orgStats : userStats;

    return {
      annual: Number(statsSource?.annualLeave ?? fromList.annual ?? 0),
      sick: Number(statsSource?.sickLeave ?? fromList.sick ?? 0),
      maternity: Number(statsSource?.maternityLeave ?? fromList.maternity ?? 0),
      compassionate: Number(statsSource?.compassionateLeave ?? fromList.compassionate ?? 0),
    };
  }, [isAdmin, leaves, orgStats, userStats]);

  const statsCards = [
    { label: "Annual Leave", value: leaveTypeStats.annual, color: "text-violet-500", bg: "bg-violet-50" },
    { label: "Sick Leave", value: leaveTypeStats.sick, color: "text-rose-500", bg: "bg-rose-50" },
    { label: "Maternity Leave", value: leaveTypeStats.maternity, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Compassionate Leave", value: leaveTypeStats.compassionate, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  const handleApprove = async (leave: any) => {
    const leaveId = leave?._id || leave?.id;
    if (!leaveId) return;
    const success = await approveLeave(leaveId);
    if (!success) return;
    await fetchOrgLeaveStats();
    setSelectedLeave(null);
  };

  const handleReject = async (leave: any) => {
    const leaveId = leave?._id || leave?.id;
    if (!leaveId) return;
    const success = await rejectLeave(leaveId);
    if (!success) return;
    await fetchOrgLeaveStats();
    setSelectedLeave(null);
  };

  const handleSubmitLeaveRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await requestLeave({
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      document: documentFile || formData.document,
    });

    if (!success) return;

    setShowRequestModal(false);
    setFormData({
      type: "Annual Leave",
      startDate: "",
      endDate: "",
      reason: "",
      document: "",
    });
    setDocumentFile(null);
    await fetchUserLeaveStats();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Leave Management</h2>
          <p className="text-sm text-gray-500">
            {isAdmin ? "Track and manage employee leave requests" : "Track your leave requests"}
          </p>
        </div>

        {!isAdmin && (
          <button
            type="button"
            onClick={() => setShowRequestModal(true)}
            className="bg-violet-100 text-[#3B00D9] px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-200 transition-colors"
          >
            + Request Leave
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsCards.map((item, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${item.bg} ${item.color}`}>
                <Calendar size={14} />
              </div>
              <p className="text-xs text-gray-600 font-medium">{item.label}</p>
            </div>
            <h3 className="text-3xl font-semibold text-gray-900">{item.value}</h3>
          </div>
        ))}
      </div>

      {isAdmin && (
        <div className="flex justify-end">
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9]"
          >
            <option value="all">All employees</option>
            {employees.map((emp: any, idx: number) => {
              const employeeId = emp._id || emp.id || String(idx);
              return (
                <option key={employeeId} value={employeeId}>
                  {emp.name || emp.email || employeeId}
                </option>
              );
            })}
          </select>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAdmin ? "Search employee" : "Search leave details"}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm"
            />
          </div>
          <button className="text-sm font-medium text-gray-600 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            Sort by
          </button>
        </div>

        <div className="min-h-[320px] relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
              <Loader2 className="animate-spin text-[#3B00D9]" size={32} />
            </div>
          )}

          {isAdmin ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
                <thead className="bg-white text-gray-800 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Leave type</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Days</th>
                    <th className="px-6 py-4">Reasons</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLeaves.map((leave: any, idx: number) => {
                    const leaveId = leave._id || leave.id || idx;
                    const employee = getLeaveEmployee(leave);
                    const employeeName = employee.name;
                    const employeeEmail = employee.email;
                    const status = leave.status || "Pending";
                    const days = getLeaveDays(leave.startDate, leave.endDate);

                    return (
                      <tr key={leaveId} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                              {employeeName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{employeeName}</p>
                              <p className="text-xs text-gray-500">{employeeEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{leave.type || "Annual Leave"}</td>
                        <td className="px-6 py-4">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </td>
                        <td className="px-6 py-4">{days || "-"}</td>
                        <td className="px-6 py-4 max-w-xs truncate">{leave.reason || "-"}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedLeave(leave)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredLeaves.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                        No leave requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 space-y-5">
              {filteredLeaves.map((leave: any, idx: number) => {
                const leaveId = leave._id || leave.id || idx;
                const status = leave.status || "Pending";
                const days = getLeaveDays(leave.startDate, leave.endDate);
                const docLabel =
                  typeof leave.document === "string"
                    ? leave.document.split("/").pop()
                    : leave.document?.name || "Attachment";

                return (
                  <div key={leaveId} className="border border-gray-100 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2 text-sm">
                        <p><span className="text-gray-500">Leave Type:</span> {leave.type || "Annual Leave"}</p>
                        <p><span className="text-gray-500">End Date:</span> {formatDate(leave.endDate)}</p>
                        <p><span className="text-gray-500">Duration:</span> {days} day{days === 1 ? "" : "s"}</p>
                        <p><span className="text-gray-500">Applied On:</span> {formatDate(leave.createdAt)}</p>
                        <p><span className="text-gray-500">Start Date:</span> {formatDate(leave.startDate)}</p>
                      </div>
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                        {status}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Reason for Leave</p>
                      <p className="text-sm text-gray-700">{leave.reason || "-"}</p>
                    </div>

                    {leave.document && (
                      <div className="mt-4 inline-flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600">
                        <span>{docLabel || "Document"}</span>
                        <Download size={14} />
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredLeaves.length === 0 && !isLoading && (
                <div className="py-12 text-center text-gray-500">No leave requests found.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedLeave && isAdmin && (
        <div className="fixed inset-0 bg-black/35 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Leave Details</h3>
                <p className="text-xs text-gray-500 mt-1">Review complete information before approval</p>
              </div>
              <button className="text-sm text-violet-600" onClick={() => setSelectedLeave(null)}>
                Close <X size={14} className="inline-block ml-1" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Employee's Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                  <p><span className="text-gray-500">Name:</span> {getLeaveEmployee(selectedLeave).name}</p>
                  <p><span className="text-gray-500">Position:</span> {getLeaveEmployee(selectedLeave).role || "-"}</p>
                  <p><span className="text-gray-500">Email:</span> {getLeaveEmployee(selectedLeave).email || "-"}</p>
                  <p><span className="text-gray-500">Department:</span> {getLeaveEmployee(selectedLeave).department || "-"}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Leave Request Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                  <p><span className="text-gray-500">Leave Type:</span> {selectedLeave.type || "Annual Leave"}</p>
                  <p><span className="text-gray-500">End Date:</span> {formatDate(selectedLeave.endDate)}</p>
                  <p><span className="text-gray-500">Duration:</span> {getLeaveDays(selectedLeave.startDate, selectedLeave.endDate)} day(s)</p>
                  <p><span className="text-gray-500">Applied On:</span> {formatDate(selectedLeave.createdAt)}</p>
                  <p><span className="text-gray-500">Start Date:</span> {formatDate(selectedLeave.startDate)}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Reason for Leave</h4>
                <p className="text-sm text-gray-600">{selectedLeave.reason || "-"}</p>
              </div>

              {selectedLeave.document && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Submitted Document</h4>
                  <div className="inline-flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600">
                    <span>
                      {typeof selectedLeave.document === "string"
                        ? selectedLeave.document.split("/").pop()
                        : selectedLeave.document?.name || "Document"}
                    </span>
                    <Download size={14} />
                  </div>
                </div>
              )}
            </div>

            {String(selectedLeave.status || "").toLowerCase() === "pending" && (
              <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => handleReject(selectedLeave)}
                  className="px-5 py-3 rounded-full text-sm font-medium bg-rose-100 text-rose-600 hover:bg-rose-200"
                >
                  Reject leave request
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(selectedLeave)}
                  className="px-5 py-3 rounded-full text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600"
                >
                  Approve leave request
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showRequestModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Leave</h3>
              <p className="text-sm text-gray-500 mb-6">Submit a new leave request</p>

              <form className="space-y-4" onSubmit={handleSubmitLeaveRequest}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Leave Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9]"
                  >
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Maternity Leave">Maternity Leave</option>
                    <option value="Compassionate Leave">Compassionate Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason</label>
                  <textarea
                    rows={4}
                    value={formData.reason}
                    onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Supporting Document (optional)</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                    onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
                  />
                  {documentFile && <p className="mt-1.5 text-xs text-gray-500">Selected: {documentFile.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Existing Document ID (optional)</label>
                  <input
                    type="text"
                    value={formData.document}
                    onChange={(e) => setFormData((prev) => ({ ...prev, document: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
                    placeholder="Paste existing document ObjectId if required"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 bg-[#3B00D9] hover:bg-[#3500c0] text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isLoading && <Loader2 className="animate-spin" size={16} />}
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leave;
