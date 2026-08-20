import {
  ArrowLeftRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  DoorOpen,
  Eye,
  Loader2,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import {
  type PermissionRequest,
  type PermissionStatus,
  usePermissionStore,
} from "../../store/usePermissionStore";

const statuses: Array<PermissionStatus | ""> = ["", "Pending", "Approved", "Rejected"];
const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-hidden transition focus:border-[#4A1D96] focus:ring-2 focus:ring-[#4A1D96]/10";
const minimumDateTime = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

const permissionId = (permission: PermissionRequest) => permission._id || permission.id || "";
const employeeInfo = (permission: PermissionRequest) => typeof permission.employee === "object" ? permission.employee : null;
const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "-";
const formatTime = (value?: string) => value ? new Date(value).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "-";
const normalizedStatus = (value?: string) => String(value || "Pending").toLowerCase();
const isToday = (value?: string) => value ? new Date(value).toDateString() === new Date().toDateString() : false;

const statusStyle = (status?: string) => {
  switch (normalizedStatus(status)) {
    case "approved": return "bg-emerald-50 text-emerald-700";
    case "rejected": return "bg-rose-50 text-rose-700";
    default: return "bg-amber-50 text-amber-700";
  }
};

const getCurrentLocation = () => new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
  if (!navigator.geolocation) {
    reject(new Error("Geolocation is not supported by this browser."));
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
    () => reject(new Error("Location access is required to record this action.")),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
  );
});

const Permission = () => {
  const { user, isAdmin } = useAuthStore();
  const {
    permissions,
    pendingPermissions,
    selectedPermission,
    isLoading,
    activeAction,
    error,
    clearError,
    fetchMyPermissions,
    fetchAllPermissions,
    fetchPendingPermissions,
    fetchPermissionById,
    requestPermission,
    cancelPermission,
    recordLeaveReturn,
    updatePermission,
  } = usePermissionStore();

  const role = String(user?.role || "").trim().toLowerCase();
  const canReview = isAdmin || ["admin", "owner", "super_admin", "hr", "hr_staff", "human resources"].includes(role);
  const [statusFilter, setStatusFilter] = useState<PermissionStatus | "">("");
  const [search, setSearch] = useState("");
  const [showRequest, setShowRequest] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<"Approve" | "Reject">("Approve");
  const [reviewNote, setReviewNote] = useState("");
  const [form, setForm] = useState({ note: "", leaveTime: "", returnTime: "" });
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (canReview) {
      void fetchAllPermissions(statusFilter);
      void fetchPendingPermissions();
    } else {
      void fetchMyPermissions(statusFilter);
    }
  }, [canReview, fetchAllPermissions, fetchMyPermissions, fetchPendingPermissions, statusFilter]);

  const filteredPermissions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return permissions;
    return permissions.filter((permission) => {
      const employee = employeeInfo(permission);
      return [employee?.name, employee?.email, permission.note, permission.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [permissions, search]);

  const stats = useMemo(() => ({
    total: permissions.length,
    pending: permissions.filter((item) => normalizedStatus(item.status) === "pending").length,
    approved: permissions.filter((item) => normalizedStatus(item.status) === "approved").length,
    rejected: permissions.filter((item) => normalizedStatus(item.status) === "rejected").length,
  }), [permissions]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4000);
  };

  const submitRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    const leaveTime = new Date(form.leaveTime);
    const returnTime = new Date(form.returnTime);
    if (returnTime <= leaveTime) {
      showToast("error", "Return time must be later than leave time.");
      return;
    }
    const success = await requestPermission({ note: form.note.trim(), leaveTime: leaveTime.toISOString(), returnTime: returnTime.toISOString() });
    if (!success) return;
    setShowRequest(false);
    setForm({ note: "", leaveTime: "", returnTime: "" });
    showToast("success", "Permission request submitted.");
  };

  const openDetails = async (permission: PermissionRequest) => {
    const id = permissionId(permission);
    if (!id) return;
    if (canReview) await fetchPermissionById(id);
    else usePermissionStore.setState({ selectedPermission: permission });
    setReviewNote("");
    setReviewStatus("Approve");
    setShowDetails(true);
  };

  const reviewPermission = async () => {
    if (!selectedPermission) return;
    if (reviewStatus === "Reject" && !reviewNote.trim()) {
      showToast("error", "Add a reason before rejecting this request.");
      return;
    }
    const success = await updatePermission({ permId: permissionId(selectedPermission), status: reviewStatus, note: reviewNote.trim() });
    if (!success) return;
    setShowDetails(false);
    showToast("success", reviewStatus === "Approve" ? "Permission approved." : "Permission rejected.");
  };

  const cancelRequest = async (permission: PermissionRequest) => {
    const id = permissionId(permission);
    if (!id || !window.confirm("Cancel this pending permission request?")) return;
    if (await cancelPermission(id)) showToast("success", "Permission request canceled.");
  };

  const recordAction = async (permission: PermissionRequest, action: "leave" | "return") => {
    const id = permissionId(permission);
    if (!id) return;
    try {
      const location = await getCurrentLocation();
      const success = await recordLeaveReturn({ action, permId: id, location });
      if (success) showToast("success", action === "leave" ? "Office departure recorded." : "Office return recorded.");
    } catch (locationError: unknown) {
      showToast("error", locationError instanceof Error ? locationError.message : "Unable to retrieve your location.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      {toast && <div className={"fixed right-4 top-20 z-70 rounded-2xl border bg-white px-4 py-3 text-sm font-semibold shadow-xl " + (toast.type === "success" ? "border-emerald-100 text-emerald-700" : "border-rose-100 text-rose-700")}>{toast.message}</div>}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#4A1D96]">Time away during work hours</p><h2 className="text-2xl font-semibold text-gray-900">Permissions</h2><p className="mt-1 text-sm text-gray-500">{canReview ? "Review employee movement requests and monitor return compliance." : "Request short time away and record when you leave or return."}</p></div>
        {!canReview && <button onClick={() => { clearError(); setShowRequest(true); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4A1D96] px-5 py-3 text-sm font-semibold text-white"><Plus size={17} />Request permission</button>}
      </div>

      {error && <div className="flex items-center justify-between rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"><span>{error}</span><button onClick={clearError}>Dismiss</button></div>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<DoorOpen size={20} />} label="Total requests" value={stats.total} tone="indigo" />
        <Stat icon={<Clock3 size={20} />} label="Pending" value={canReview ? pendingPermissions.length : stats.pending} tone="amber" />
        <Stat icon={<CheckCircle2 size={20} />} label="Approved" value={stats.approved} tone="emerald" />
        <Stat icon={<XCircle size={20} />} label="Rejected" value={stats.rejected} tone="rose" />
      </div>

      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xs">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex gap-2 overflow-x-auto pb-1">{statuses.map((status) => <button key={status || "all"} onClick={() => setStatusFilter(status)} className={"whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition " + (statusFilter === status ? "bg-[#4A1D96] text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100")}>{status || "All"}</button>)}</div>
          {canReview && <label className="relative sm:w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} className={inputClass + " pl-10"} placeholder="Search employee or note" /></label>}
        </div>
        {isLoading ? <div className="flex min-h-72 items-center justify-center text-[#4A1D96]"><Loader2 className="animate-spin" size={28} /></div> : filteredPermissions.length ? <div className="divide-y divide-gray-100">{filteredPermissions.map((permission, index) => <PermissionRow key={permissionId(permission) || index} permission={permission} canReview={canReview} activeAction={activeAction} onView={() => void openDetails(permission)} onCancel={() => void cancelRequest(permission)} onAction={(action) => void recordAction(permission, action)} />)}</div> : <EmptyState canReview={canReview} />}
      </section>

      {showRequest && <Modal title="Request permission" subtitle="Choose the exact time you expect to leave and return." onClose={() => setShowRequest(false)}><form onSubmit={submitRequest} className="space-y-4"><label><FieldLabel>Reason or note</FieldLabel><textarea required rows={4} value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} className={inputClass + " resize-y"} placeholder="Explain why you need to leave during working hours." /></label><div className="grid gap-4 sm:grid-cols-2"><label><FieldLabel>Leave time</FieldLabel><input required min={minimumDateTime()} type="datetime-local" value={form.leaveTime} onChange={(event) => setForm({ ...form, leaveTime: event.target.value })} className={inputClass} /></label><label><FieldLabel>Expected return</FieldLabel><input required min={form.leaveTime || minimumDateTime()} type="datetime-local" value={form.returnTime} onChange={(event) => setForm({ ...form, returnTime: event.target.value })} className={inputClass} /></label></div><ModalActions onCancel={() => setShowRequest(false)} loading={activeAction === "request"} submitLabel="Submit request" /></form></Modal>}

      {showDetails && selectedPermission && <Modal title="Permission details" subtitle={canReview ? "Review the employee request and record your decision." : "Review the timeline for this request."} onClose={() => setShowDetails(false)}><PermissionDetails permission={selectedPermission} />{canReview && normalizedStatus(selectedPermission.status) === "pending" && <div className="mt-6 border-t border-gray-100 pt-5"><div className="mb-4 grid grid-cols-2 gap-2"><button onClick={() => setReviewStatus("Approve")} className={"rounded-xl px-4 py-3 text-sm font-semibold " + (reviewStatus === "Approve" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700")}>Approve</button><button onClick={() => setReviewStatus("Reject")} className={"rounded-xl px-4 py-3 text-sm font-semibold " + (reviewStatus === "Reject" ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-700")}>Reject</button></div><label><FieldLabel>Review note {reviewStatus === "Reject" ? "(required)" : "(optional)"}</FieldLabel><textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} rows={3} className={inputClass + " resize-y"} /></label><div className="mt-4 flex justify-end"><button onClick={() => void reviewPermission()} disabled={activeAction === "review-" + permissionId(selectedPermission)} className="inline-flex items-center gap-2 rounded-xl bg-[#4A1D96] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{activeAction === "review-" + permissionId(selectedPermission) && <Loader2 className="animate-spin" size={16} />}Submit decision</button></div></div>}</Modal>}
    </div>
  );
};

const PermissionRow = ({ permission, canReview, activeAction, onView, onCancel, onAction }: { permission: PermissionRequest; canReview: boolean; activeAction: string | null; onView: () => void; onCancel: () => void; onAction: (action: "leave" | "return") => void }) => { const employee = employeeInfo(permission); const id = permissionId(permission); const approvedToday = normalizedStatus(permission.status) === "approved" && isToday(permission.leaveTime); return <article className="p-5 transition hover:bg-[#FAFAFF] sm:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0 flex-1"><div className="mb-3 flex flex-wrap items-center gap-2"><span className={"rounded-full px-3 py-1 text-xs font-semibold " + statusStyle(permission.status)}>{permission.status || "Pending"}</span>{canReview && <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-[#4A1D96]">{employee?.role || "Employee"}</span>}</div><h3 className="font-semibold text-gray-900">{canReview ? employee?.name || "Employee" : permission.note || "Permission request"}</h3>{canReview && <p className="mt-1 line-clamp-1 text-sm text-gray-500">{permission.note}</p>}<div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-gray-500"><span className="flex items-center gap-1.5"><CalendarClock size={15} className="text-[#4A1D96]" />{formatDate(permission.leaveTime)}</span><span className="flex items-center gap-1.5"><DoorOpen size={15} className="text-[#4A1D96]" />{formatTime(permission.leaveTime)} - {formatTime(permission.returnTime)}</span>{permission.returnedAt && <span className="flex items-center gap-1.5"><ArrowLeftRight size={15} className="text-[#4A1D96]" />Returned {formatTime(permission.returnedAt)}</span>}</div></div><div className="flex flex-wrap gap-2"><button onClick={onView} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"><Eye size={16} />Details</button>{!canReview && normalizedStatus(permission.status) === "pending" && <button onClick={onCancel} disabled={activeAction === "cancel-" + id} className="inline-flex items-center gap-2 rounded-xl border border-rose-100 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50">{activeAction === "cancel-" + id ? <Loader2 className="animate-spin" size={16} /> : <X size={16} />}Cancel</button>}{!canReview && approvedToday && !permission.leftAt && <button onClick={() => onAction("leave")} disabled={activeAction === "leave-" + id} className="inline-flex items-center gap-2 rounded-xl bg-[#4A1D96] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><MapPin size={16} />Record leave</button>}{!canReview && approvedToday && permission.leftAt && !permission.returnedAt && <button onClick={() => onAction("return")} disabled={activeAction === "return-" + id} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><RotateCcw size={16} />Record return</button>}</div></div></article>; };

const PermissionDetails = ({ permission }: { permission: PermissionRequest }) => { const employee = employeeInfo(permission); return <div className="space-y-5"><div className="rounded-2xl bg-linear-to-br from-[#4A1D96] to-[#8B5CF6] p-5 text-white"><div className="flex items-center justify-between gap-3"><div><p className="text-sm text-indigo-100">{employee?.email || formatDate(permission.createdAt)}</p><h3 className="mt-1 text-xl font-semibold">{employee?.name || "Permission request"}</h3></div><span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">{permission.status}</span></div></div><InfoGrid items={[["Requested date", formatDate(permission.leaveTime)], ["Leave time", formatTime(permission.leaveTime)], ["Return time", formatTime(permission.returnTime)], ["Actual departure", formatTime(permission.leftAt)], ["Actual return", formatTime(permission.returnedAt)], ["Late minutes", String(permission.lateMinutes || 0)]]} /><div><FieldLabel>Reason</FieldLabel><p className="whitespace-pre-line rounded-2xl bg-gray-50 p-4 text-sm leading-6 text-gray-600">{permission.note || "No note provided."}</p></div>{(permission.rejectNote || permission.reviewNote) && <div><FieldLabel>Review note</FieldLabel><p className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{permission.rejectNote || permission.reviewNote}</p></div>}</div>; };

const Stat = ({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "indigo" | "amber" | "emerald" | "rose" }) => { const colors = { indigo: "bg-indigo-50 text-[#4A1D96]", amber: "bg-amber-50 text-amber-600", emerald: "bg-emerald-50 text-emerald-600", rose: "bg-rose-50 text-rose-600" }; return <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:p-5"><div className={"mb-4 w-fit rounded-xl p-2.5 " + colors[tone]}>{icon}</div><p className="text-2xl font-bold text-gray-900">{value}</p><p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">{label}</p></div>; };
const EmptyState = ({ canReview }: { canReview: boolean }) => <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center"><div className="rounded-2xl bg-indigo-50 p-4 text-[#4A1D96]"><ShieldCheck size={28} /></div><h3 className="mt-4 font-semibold text-gray-900">No permission requests found</h3><p className="mt-1 max-w-sm text-sm text-gray-500">{canReview ? "Requests will appear here when employees submit them." : "Your permission requests will appear here."}</p></div>;
const Modal = ({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) => <div className="fixed inset-0 z-60 flex items-end justify-center bg-gray-950/45 p-0 backdrop-blur-xs sm:items-center sm:p-4"><div className="mobile-safe-bottom max-h-[94dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7"><div className="mb-6 flex items-start justify-between gap-4"><div><h3 className="text-xl font-semibold text-gray-900">{title}</h3><p className="mt-1 text-sm text-gray-500">{subtitle}</p></div><button onClick={onClose} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100"><X size={20} /></button></div>{children}</div></div>;
const ModalActions = ({ onCancel, loading, submitLabel }: { onCancel: () => void; loading: boolean; submitLabel: string }) => <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} className="rounded-xl px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button><button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4A1D96] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{loading && <Loader2 className="animate-spin" size={16} />}{submitLabel}</button></div>;
const FieldLabel = ({ children }: { children: React.ReactNode }) => <span className="mb-1.5 block text-xs font-semibold text-gray-700">{children}</span>;
const InfoGrid = ({ items }: { items: string[][] }) => <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{items.map(([label, value]) => <div key={label} className="rounded-2xl bg-gray-50 p-3"><p className="text-xs text-gray-400">{label}</p><p className="mt-1 text-sm font-semibold text-gray-800">{value}</p></div>)}</div>;

export default Permission;
