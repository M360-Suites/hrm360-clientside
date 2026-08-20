import {
  Award,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  FileClock,
  Loader2,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useEmployeeStore } from "../../store/useEmployeeStore";
import {
  type PromotionEmployee,
  type PromotionRequest,
  type PromotionStatus,
  usePromotionStore,
} from "../../store/usePromotionStore";

const statusOptions: Array<PromotionStatus | ""> = ["", "Pending", "Under review", "Approved", "Rejected"];
const reviewStatuses: PromotionStatus[] = ["Under review", "Approved", "Rejected"];
const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-hidden transition focus:border-[#4A1D96] focus:ring-2 focus:ring-[#4A1D96]/10";

const localToday = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};

const promotionId = (promotion: PromotionRequest) => promotion._id || promotion.id || "";
const promotionEmployee = (promotion: PromotionRequest): PromotionEmployee | null => {
  if (typeof promotion.employee === "object") return promotion.employee;
  if (typeof promotion.employeeId === "object") return promotion.employeeId;
  return null;
};
const employeeIdFrom = (promotion: PromotionRequest) => {
  const employee = promotionEmployee(promotion);
  return employee?._id || employee?.id || (typeof promotion.employeeId === "string" ? promotion.employeeId : "") || (typeof promotion.employee === "string" ? promotion.employee : "");
};
const normalizedStatus = (value?: string) => String(value || "Pending").toLowerCase();
const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "-";
const formatMoney = (value?: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(value || 0));

const statusStyle = (status?: string) => {
  switch (normalizedStatus(status)) {
    case "approved": return "bg-emerald-50 text-emerald-700";
    case "rejected": return "bg-rose-50 text-rose-700";
    case "under review": return "bg-pink-50 text-pink-700";
    default: return "bg-amber-50 text-amber-700";
  }
};

const Promotion = () => {
  const { user, isAdmin } = useAuthStore();
  const { employees, fetchEmployees } = useEmployeeStore();
  const {
    promotions,
    promotionHistory,
    selectedPromotion,
    stats,
    page,
    totalPages,
    isLoading,
    activeAction,
    error,
    clearError,
    fetchUserPromotions,
    fetchPromotions,
    fetchPromotionStats,
    fetchEmployeePromotions,
    fetchPromotionHistory,
    fetchPromotionById,
    requestPromotion,
    updatePromotionStatus,
    deletePromotion,
  } = usePromotionStore();

  const role = String(user?.role || "").trim().toLowerCase();
  const canReview = isAdmin || ["admin", "owner", "super_admin", "hr", "hr_staff", "human resources"].includes(role);
  const currentEmployeeId = String(user?.employeeId || user?.employee?._id || user?.employee?.id || user?._id || user?.id || "");
  const [statusFilter, setStatusFilter] = useState<PromotionStatus | "">("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showRequest, setShowRequest] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<PromotionStatus>("Under review");
  const [reviewNote, setReviewNote] = useState("");
  const [historyYear, setHistoryYear] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [form, setForm] = useState({
    employeeId: currentEmployeeId,
    newRole: "",
    effectiveDate: "",
    currentSalary: 0,
    newSalary: 0,
    justification: "",
    doc: "",
  });

  useEffect(() => {
    void fetchPromotionStats();
    if (canReview) {
      if (employeeFilter) {
        void fetchEmployeePromotions(employeeFilter, { status: statusFilter, page: 1, limit: 10 });
      } else {
        void fetchPromotions({ status: statusFilter, page: 1, limit: 10 });
      }
      void fetchEmployees({ page: 1, limit: 100 });
    } else {
      void fetchUserPromotions();
    }
  }, [canReview, employeeFilter, fetchEmployeePromotions, fetchEmployees, fetchPromotionStats, fetchPromotions, fetchUserPromotions, statusFilter]);

  useEffect(() => {
    if (!showHistory || !selectedPromotion) return;
    const id = employeeIdFrom(selectedPromotion);
    if (!id) return;
    const timer = window.setTimeout(() => {
      void fetchPromotionHistory(id, historyYear);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [fetchPromotionHistory, historyYear, selectedPromotion, showHistory]);

  const filteredPromotions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return promotions;
    return promotions.filter((promotion) => {
      const employee = promotionEmployee(promotion);
      return [employee?.name, employee?.fullName, employee?.email, promotion.currentRole, promotion.newRole, promotion.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [promotions, search]);

  const calculated = useMemo(() => ({
    total: promotions.length,
    approved: promotions.filter((item) => normalizedStatus(item.status) === "approved").length,
    pending: promotions.filter((item) => normalizedStatus(item.status) === "pending").length,
    underReview: promotions.filter((item) => normalizedStatus(item.status) === "under review").length,
  }), [promotions]);

  const displayStats = {
    total: stats.total || calculated.total,
    approved: stats.approved || calculated.approved,
    pending: stats.pending || calculated.pending,
    underReview: stats.underReview || calculated.underReview,
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4000);
  };

  const submitPromotion = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.employeeId.trim()) {
      showToast("error", "Your employee ID is required to submit this request.");
      return;
    }
    if (form.newSalary < form.currentSalary) {
      showToast("error", "New salary cannot be lower than the current salary.");
      return;
    }
    const success = await requestPromotion({ ...form, employeeId: form.employeeId.trim(), justification: form.justification.trim(), doc: form.doc.trim() });
    if (!success) return;
    setShowRequest(false);
    setForm({ employeeId: currentEmployeeId, newRole: "", effectiveDate: "", currentSalary: 0, newSalary: 0, justification: "", doc: "" });
    showToast("success", "Promotion request submitted.");
  };

  const openDetails = async (promotion: PromotionRequest) => {
    const id = promotionId(promotion);
    if (!id) return;
    if (canReview) await fetchPromotionById(id);
    else usePromotionStore.setState({ selectedPromotion: promotion });
    setReviewStatus("Under review");
    setReviewNote("");
    setShowDetails(true);
  };

  const submitReview = async () => {
    if (!selectedPromotion) return;
    if (reviewStatus === "Rejected" && !reviewNote.trim()) {
      showToast("error", "Add a review note before rejecting this promotion.");
      return;
    }
    const success = await updatePromotionStatus({ promotionId: promotionId(selectedPromotion), status: reviewStatus, reviewNote: reviewNote.trim() });
    if (!success) return;
    setShowDetails(false);
    showToast("success", "Promotion status updated to " + reviewStatus + ".");
  };

  const removePromotion = async (promotion: PromotionRequest) => {
    const id = promotionId(promotion);
    if (!id || !window.confirm("Delete this promotion request?")) return;
    if (await deletePromotion(id)) {
      setShowDetails(false);
      showToast("success", "Promotion request deleted.");
    }
  };

  const filterByEmployee = (employeeId: string) => {
    setEmployeeFilter(employeeId);
  };

  const openHistory = async (promotion: PromotionRequest) => {
    const id = employeeIdFrom(promotion);
    if (!id) {
      showToast("error", "Employee history is unavailable because the employee ID was not returned.");
      return;
    }
    setShowHistory(true);
  };

  const changePage = async (nextPage: number) => {
    if (employeeFilter) await fetchEmployeePromotions(employeeFilter, { status: statusFilter, page: nextPage, limit: 10 });
    else await fetchPromotions({ status: statusFilter, page: nextPage, limit: 10 });
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      {toast && <div className={"fixed right-4 top-20 z-70 rounded-2xl border bg-white px-4 py-3 text-sm font-semibold shadow-xl " + (toast.type === "success" ? "border-emerald-100 text-emerald-700" : "border-rose-100 text-rose-700")}>{toast.message}</div>}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#4A1D96]">Career progression</p><h2 className="text-2xl font-semibold text-gray-900">Promotions</h2><p className="mt-1 text-sm text-gray-500">{canReview ? "Review promotion cases and maintain employee progression history." : "Submit and track your career progression requests."}</p></div>{!canReview && <button onClick={() => { clearError(); setShowRequest(true); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4A1D96] px-5 py-3 text-sm font-semibold text-white"><Plus size={17} />Request promotion</button>}</div>

      {error && <div className="flex items-center justify-between rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"><span>{error}</span><button onClick={clearError}>Dismiss</button></div>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Stat icon={<TrendingUp size={20} />} label="Total promotions" value={displayStats.total} tone="indigo" /><Stat icon={<CheckCircle2 size={20} />} label="Approved" value={displayStats.approved} tone="emerald" /><Stat icon={<Clock3 size={20} />} label="Pending" value={displayStats.pending} tone="amber" /><Stat icon={<FileClock size={20} />} label="Under review" value={displayStats.underReview} tone="pink" /></div>

      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xs">
        <div className="space-y-3 border-b border-gray-100 p-4 sm:p-5"><div className="flex gap-2 overflow-x-auto pb-1">{statusOptions.map((status) => <button key={status || "all"} onClick={() => setStatusFilter(status)} className={"whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold " + (statusFilter === status ? "bg-[#4A1D96] text-white" : "bg-gray-50 text-gray-600")}>{status || "All"}</button>)}</div><div className="flex flex-col gap-3 sm:flex-row">{canReview && <select value={employeeFilter} onChange={(event) => filterByEmployee(event.target.value)} className={inputClass + " sm:w-64"}><option value="">All employees</option>{employees.map((employee, index) => { const id = employee._id || employee.id || employee.user?._id || ""; return <option key={id || index} value={id}>{employee.name || employee.fullName || employee.email || "Employee"}</option>; })}</select>}<label className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} className={inputClass + " pl-10"} placeholder="Search employee, current role, or proposed role" /></label></div></div>
        {isLoading ? <div className="flex min-h-72 items-center justify-center text-[#4A1D96]"><Loader2 className="animate-spin" size={28} /></div> : filteredPromotions.length ? <div className="divide-y divide-gray-100">{filteredPromotions.map((promotion, index) => <PromotionRow key={promotionId(promotion) || index} promotion={promotion} canReview={canReview} activeAction={activeAction} onView={() => void openDetails(promotion)} onDelete={() => void removePromotion(promotion)} />)}</div> : <EmptyState canReview={canReview} />}
        {canReview && totalPages > 1 && <div className="flex items-center justify-between border-t border-gray-100 p-4"><button disabled={page <= 1} onClick={() => void changePage(page - 1)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 disabled:opacity-40">Previous</button><span className="text-xs font-medium text-gray-500">Page {page} of {totalPages}</span><button disabled={page >= totalPages} onClick={() => void changePage(page + 1)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 disabled:opacity-40">Next</button></div>}
      </section>

      {showRequest && <Modal title="Request promotion" subtitle="Submit the proposed role, compensation, and supporting justification." onClose={() => setShowRequest(false)}><form onSubmit={submitPromotion} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Field label="Employee ID"><input required value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: event.target.value })} className={inputClass} placeholder="Your employee ID" /></Field><Field label="Proposed role"><input required value={form.newRole} onChange={(event) => setForm({ ...form, newRole: event.target.value })} className={inputClass} placeholder="e.g. Senior Product Designer" /></Field><Field label="Effective date"><input required min={localToday()} type="date" value={form.effectiveDate} onChange={(event) => setForm({ ...form, effectiveDate: event.target.value })} className={inputClass} /></Field><Field label="Current salary"><input required min={0} type="number" value={form.currentSalary} onChange={(event) => setForm({ ...form, currentSalary: Number(event.target.value) })} className={inputClass} /></Field><Field label="Proposed salary"><input required min={0} type="number" value={form.newSalary} onChange={(event) => setForm({ ...form, newSalary: Number(event.target.value) })} className={inputClass} /></Field><Field label="Supporting document reference"><input value={form.doc} onChange={(event) => setForm({ ...form, doc: event.target.value })} className={inputClass} placeholder="Document ID or link" /></Field></div><Field label="Justification"><textarea required rows={5} value={form.justification} onChange={(event) => setForm({ ...form, justification: event.target.value })} className={inputClass + " resize-y"} placeholder="Describe your achievements, expanded responsibilities, and readiness for the new role." /></Field><ModalActions onCancel={() => setShowRequest(false)} loading={activeAction === "request"} submitLabel="Submit request" /></form></Modal>}

      {showDetails && selectedPromotion && <Modal title="Promotion details" subtitle={canReview ? "Review the role and compensation proposal." : "Track the details and decision for your request."} onClose={() => setShowDetails(false)}><PromotionDetails promotion={selectedPromotion} />{canReview && <div className="mt-6 border-t border-gray-100 pt-5"><div className="grid gap-4 sm:grid-cols-[1fr_auto]"><select value={reviewStatus} onChange={(event) => setReviewStatus(event.target.value as PromotionStatus)} className={inputClass}>{reviewStatuses.map((status) => <option key={status}>{status}</option>)}</select><button onClick={() => void openHistory(selectedPromotion)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700"><FileClock size={16} />View history</button></div><label className="mt-4 block"><FieldLabel>Review note {reviewStatus === "Rejected" ? "(required)" : "(optional)"}</FieldLabel><textarea rows={3} value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} className={inputClass + " resize-y"} /></label><div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><button disabled={!(["pending", "under review"].includes(normalizedStatus(selectedPromotion.status)))} onClick={() => void removePromotion(selectedPromotion)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-100 px-4 py-3 text-sm font-semibold text-rose-600 disabled:opacity-40"><Trash2 size={16} />Delete request</button><button onClick={() => void submitReview()} disabled={activeAction === "review-" + promotionId(selectedPromotion)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4A1D96] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{activeAction === "review-" + promotionId(selectedPromotion) && <Loader2 className="animate-spin" size={16} />}Update status</button></div></div>}</Modal>}

      {showHistory && <Modal title="Promotion history" subtitle="Previous promotion records returned for this employee." onClose={() => setShowHistory(false)}><div className="mb-4 flex gap-3"><input value={historyYear} onChange={(event) => setHistoryYear(event.target.value.replace(/D/g, "").slice(0, 4))} className={inputClass} placeholder="Filter year, e.g. 2026" /></div>{activeAction === "history" ? <div className="flex min-h-40 items-center justify-center text-[#4A1D96]"><Loader2 className="animate-spin" /></div> : promotionHistory.length ? <div className="space-y-3">{promotionHistory.map((item, index) => <div key={promotionId(item) || index} className="rounded-2xl border border-gray-100 p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold text-gray-900">{item.currentRole || "Current role"} â†’ {item.newRole}</p><p className="mt-1 text-xs text-gray-500">Effective {formatDate(item.effectiveDate)}</p></div><span className={"rounded-full px-3 py-1 text-xs font-semibold " + statusStyle(item.status)}>{item.status}</span></div></div>)}</div> : <p className="rounded-2xl bg-gray-50 p-6 text-center text-sm text-gray-500">No promotion history returned.</p>}</Modal>}
    </div>
  );
};

const PromotionRow = ({ promotion, canReview, activeAction, onView, onDelete }: { promotion: PromotionRequest; canReview: boolean; activeAction: string | null; onView: () => void; onDelete: () => void }) => { const employee = promotionEmployee(promotion); const id = promotionId(promotion); const deletable = ["pending", "under review"].includes(normalizedStatus(promotion.status)); return <article className="p-5 transition hover:bg-[#FAFAFF] sm:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0 flex-1"><div className="mb-3 flex flex-wrap items-center gap-2"><span className={"rounded-full px-3 py-1 text-xs font-semibold " + statusStyle(promotion.status)}>{promotion.status || "Pending"}</span>{canReview && <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-[#4A1D96]">{employee?.name || employee?.fullName || "Employee"}</span>}</div><h3 className="text-lg font-semibold text-gray-900">{promotion.currentRole || employee?.role || "Current role"} <span className="text-gray-300">â†’</span> {promotion.newRole}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">{promotion.justification || "No justification provided."}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-gray-500"><span className="flex items-center gap-1.5"><CalendarDays size={15} className="text-[#4A1D96]" />Effective {formatDate(promotion.effectiveDate)}</span><span className="flex items-center gap-1.5"><Banknote size={15} className="text-[#4A1D96]" />{formatMoney(promotion.currentSalary)} â†’ {formatMoney(promotion.newSalary)}</span></div></div><div className="flex flex-wrap gap-2"><button onClick={onView} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700"><Eye size={16} />Details</button>{canReview && deletable && <button onClick={onDelete} disabled={activeAction === "delete-" + id} className="inline-flex items-center gap-2 rounded-xl border border-rose-100 px-4 py-2.5 text-sm font-semibold text-rose-600 disabled:opacity-50">{activeAction === "delete-" + id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}Delete</button>}</div></div></article>; };

const PromotionDetails = ({ promotion }: { promotion: PromotionRequest }) => { const employee = promotionEmployee(promotion); return <div className="space-y-5"><div className="rounded-3xl bg-linear-to-br from-[#4A1D96] to-[#8B5CF6] p-6 text-white"><span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">{promotion.status}</span><h3 className="mt-5 text-2xl font-semibold">{promotion.currentRole || employee?.role || "Current role"} â†’ {promotion.newRole}</h3><p className="mt-2 text-sm text-indigo-100">{employee?.name || employee?.fullName || employee?.email || "Employee request"}</p></div><InfoGrid items={[["Effective date", formatDate(promotion.effectiveDate)], ["Current salary", formatMoney(promotion.currentSalary)], ["Proposed salary", formatMoney(promotion.newSalary)], ["Submitted", formatDate(promotion.createdAt)]]} /><div><FieldLabel>Justification</FieldLabel><p className="whitespace-pre-line rounded-2xl bg-gray-50 p-4 text-sm leading-7 text-gray-600">{promotion.justification || "No justification provided."}</p></div>{promotion.doc && <div><FieldLabel>Supporting document</FieldLabel><p className="break-all rounded-2xl bg-indigo-50 p-4 text-sm text-[#4A1D96]">{promotion.doc}</p></div>}{promotion.reviewNote && <div><FieldLabel>Review note</FieldLabel><p className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">{promotion.reviewNote}</p></div>}</div>; };

const Stat = ({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "indigo" | "emerald" | "amber" | "pink" }) => { const colors = { indigo: "bg-indigo-50 text-[#4A1D96]", emerald: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600", pink: "bg-pink-50 text-pink-600" }; return <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:p-5"><div className={"mb-4 w-fit rounded-xl p-2.5 " + colors[tone]}>{icon}</div><p className="text-2xl font-bold text-gray-900">{value}</p><p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">{label}</p></div>; };
const EmptyState = ({ canReview }: { canReview: boolean }) => <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center"><div className="rounded-2xl bg-indigo-50 p-4 text-[#4A1D96]"><Award size={28} /></div><h3 className="mt-4 font-semibold text-gray-900">No promotion requests found</h3><p className="mt-1 max-w-sm text-sm text-gray-500">{canReview ? "Promotion requests will appear here for review." : "Your submitted requests will appear here."}</p></div>;
const Modal = ({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) => <div className="fixed inset-0 z-60 flex items-end justify-center bg-gray-950/45 p-0 backdrop-blur-xs sm:items-center sm:p-4"><div className="mobile-safe-bottom max-h-[94dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7"><div className="mb-6 flex items-start justify-between gap-4"><div><h3 className="text-xl font-semibold text-gray-900">{title}</h3><p className="mt-1 text-sm text-gray-500">{subtitle}</p></div><button onClick={onClose} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100"><X size={20} /></button></div>{children}</div></div>;
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <label><FieldLabel>{label}</FieldLabel>{children}</label>;
const FieldLabel = ({ children }: { children: React.ReactNode }) => <span className="mb-1.5 block text-xs font-semibold text-gray-700">{children}</span>;
const ModalActions = ({ onCancel, loading, submitLabel }: { onCancel: () => void; loading: boolean; submitLabel: string }) => <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} className="rounded-xl px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button><button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4A1D96] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{loading && <Loader2 className="animate-spin" size={16} />}{submitLabel}</button></div>;
const InfoGrid = ({ items }: { items: string[][] }) => <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{items.map(([label, value]) => <div key={label} className="rounded-2xl bg-gray-50 p-3"><p className="text-xs text-gray-400">{label}</p><p className="mt-1 text-sm font-semibold text-gray-800">{value}</p></div>)}</div>;

export default Promotion;
