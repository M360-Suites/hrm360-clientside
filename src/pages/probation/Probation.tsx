import {
  AlertTriangle,
  Award,
  CalendarClock,
  Check,
  Clock3,
  Eye,
  Loader2,
  Plus,
  Search,
  ShieldAlert,
  Target,
  TimerReset,
  UserCheck,
  UserMinus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import {
  type ProbationAction,
  type ProbationObjective,
  type ProbationStaff,
  useProbationStore,
} from "../../store/useProbationStore";

const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-hidden transition focus:border-[#4A1D96] focus:ring-2 focus:ring-[#4A1D96]/10";
const probationId = (staff: ProbationStaff) => staff._id || staff.id || "";
const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "-";
const normalizedStatus = (value?: string) => String(value || "On probation").toLowerCase();
const localToday = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};

interface NormalizedObjective {
  id: string;
  text: string;
  completed: boolean;
}

const normalizeObjectives = (staff: ProbationStaff): NormalizedObjective[] => {
  const objectives = staff.probationObjectives || staff.objectives || [];
  return objectives.map((item, index) => {
    if (typeof item === "string") return { id: String(index), text: item, completed: false };
    const objective = item as ProbationObjective;
    return {
      id: objective._id || objective.id || objective.objectiveId || String(index),
      text: objective.title || objective.objective || objective.text || "Objective " + (index + 1),
      completed: Boolean(objective.completed),
    };
  });
};

const daysRemaining = (endDate?: string) => {
  if (!endDate) return null;
  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) return null;
  return Math.ceil((end.getTime() - Date.now()) / 86_400_000);
};

const scoreFor = (staff: ProbationStaff) => {
  if (staff.rateScore !== undefined) return Number(staff.rateScore || 0);
  if (staff.score !== undefined) return Number(staff.score || 0);
  const objectives = normalizeObjectives(staff);
  if (!objectives.length) return 0;
  return Math.round((objectives.filter((item) => item.completed).length / objectives.length) * 100);
};

const statusStyle = (status?: string) => {
  const normalized = normalizedStatus(status);
  if (normalized.includes("confirm")) return "bg-emerald-50 text-emerald-700";
  if (normalized.includes("terminat")) return "bg-rose-50 text-rose-700";
  if (normalized.includes("extend")) return "bg-blue-50 text-blue-700";
  return "bg-amber-50 text-amber-700";
};

const Probation = () => {
  const { user, isAdmin } = useAuthStore();
  const {
    staff,
    selectedStaff,
    stats,
    isLoading,
    activeAction,
    error,
    clearError,
    fetchProbationStaff,
    fetchProbationStats,
    fetchProbationById,
    addProbationStaff,
    updateProbationStatus,
    updateObjective,
  } = useProbationStore();

  const role = String(user?.role || "").trim().toLowerCase();
  const canManageProbation = isAdmin || ["hr", "hr_staff", "human resources", "admin", "owner", "super_admin"].includes(role);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showAction, setShowAction] = useState(false);
  const [action, setAction] = useState<ProbationAction>("Confirm");
  const [newEndDate, setNewEndDate] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", workMode: "Onsite", role: "", startDate: "", endDate: "", objectives: "" });

  useEffect(() => {
    if (!canManageProbation) return;
    void fetchProbationStaff();
    void fetchProbationStats();
  }, [canManageProbation, fetchProbationStaff, fetchProbationStats]);

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();
    return staff.filter((item) => {
      const matchesStatus = statusFilter === "All" || normalizedStatus(item.status).includes(statusFilter.toLowerCase());
      const matchesSearch = !query || [item.name, item.email, item.role, item.workMode].some((value) => String(value || "").toLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [search, staff, statusFilter]);

  const calculatedStats = useMemo(() => ({
    tracked: staff.length,
    onProbation: staff.filter((item) => !["confirmed", "terminated"].some((status) => normalizedStatus(item.status).includes(status))).length,
    due: staff.filter((item) => { const days = daysRemaining(item.endDate); return days !== null && days >= 0 && days <= 14; }).length,
    extended: staff.filter((item) => normalizedStatus(item.status).includes("extend")).length,
  }), [staff]);

  const displayStats = {
    tracked: stats.tracked || calculatedStats.tracked,
    onProbation: stats.onProbation || calculatedStats.onProbation,
    due: stats.due || calculatedStats.due,
    extended: stats.extended || calculatedStats.extended,
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4000);
  };

  const submitNewStaff = async (event: React.FormEvent) => {
    event.preventDefault();
    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);
    if (endDate <= startDate) {
      showToast("error", "Probation end date must be later than the start date.");
      return;
    }
    const objectives = form.objectives.split(/\r?\n|;/).map((item) => item.trim()).filter(Boolean);
    if (!objectives.length) {
      showToast("error", "Add at least one probation objective.");
      return;
    }
    const success = await addProbationStaff({ name: form.name.trim(), email: form.email.trim(), workMode: form.workMode, role: form.role.trim(), startDate: startDate.toISOString(), endDate: endDate.toISOString(), probationObjectives: objectives });
    if (!success) return;
    setShowAdd(false);
    setForm({ name: "", email: "", workMode: "Onsite", role: "", startDate: "", endDate: "", objectives: "" });
    showToast("success", "Probation staff added successfully.");
  };

  const openDetails = async (item: ProbationStaff) => {
    const id = probationId(item);
    if (!id) return;
    const detail = await fetchProbationById(id);
    if (detail) setShowDetails(true);
  };

  const openAction = (nextAction: ProbationAction) => {
    setAction(nextAction);
    setNewEndDate("");
    setShowAction(true);
  };

  const submitAction = async () => {
    if (!selectedStaff) return;
    if (action === "Extend" && !newEndDate) {
      showToast("error", "Select a new probation end date.");
      return;
    }
    const payload = { probId: probationId(selectedStaff), action, newEndDate: action === "Extend" ? newEndDate : undefined };
    const success = await updateProbationStatus(payload);
    if (!success) return;
    setShowAction(false);
    setShowDetails(false);
    showToast("success", action === "Confirm" ? "Employee confirmed successfully." : action === "Extend" ? "Probation period extended." : "Probation employment terminated.");
  };

  const toggleObjective = async (objective: NormalizedObjective) => {
    if (!selectedStaff) return;
    const success = await updateObjective({ probId: probationId(selectedStaff), objectiveId: objective.id, completed: !objective.completed });
    if (success) showToast("success", "Probation objective updated.");
  };

  if (!canManageProbation) {
    return <div className="mx-auto flex min-h-[65vh] max-w-2xl items-center justify-center"><div className="rounded-3xl border border-amber-100 bg-white p-8 text-center shadow-xs"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"><ShieldAlert size={30} /></div><h2 className="mt-5 text-xl font-semibold text-gray-900">HR access required</h2><p className="mt-2 text-sm leading-6 text-gray-500">Probation records contain restricted employee information and are available only to authorized HR staff.</p></div></div>;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      {toast && <div className={"fixed right-4 top-20 z-70 rounded-2xl border bg-white px-4 py-3 text-sm font-semibold shadow-xl " + (toast.type === "success" ? "border-emerald-100 text-emerald-700" : "border-rose-100 text-rose-700")}>{toast.message}</div>}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#4A1D96]">Employee confirmation</p><h2 className="text-2xl font-semibold text-gray-900">Probation</h2><p className="mt-1 text-sm text-gray-500">Track objectives, review progress, and make confirmation decisions.</p></div><button onClick={() => { clearError(); setShowAdd(true); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4A1D96] px-5 py-3 text-sm font-semibold text-white"><Plus size={17} />Add probation staff</button></div>

      {error && <div className="flex items-center justify-between rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"><span>{error}</span><button onClick={clearError}>Dismiss</button></div>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Stat icon={<Users size={20} />} label="Tracked staff" value={displayStats.tracked} tone="indigo" /><Stat icon={<Clock3 size={20} />} label="On probation" value={displayStats.onProbation} tone="amber" /><Stat icon={<AlertTriangle size={20} />} label="Due within 14 days" value={displayStats.due} tone="rose" /><Stat icon={<TimerReset size={20} />} label="Extended" value={displayStats.extended} tone="blue" /></div>

      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xs"><div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:p-5"><label className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} className={inputClass + " pl-10"} placeholder="Search name, email, role, or work mode" /></label><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={inputClass + " sm:w-52"}><option>All</option><option>On probation</option><option>Extended</option><option>Confirmed</option><option>Terminated</option></select></div>{isLoading ? <div className="flex min-h-72 items-center justify-center text-[#4A1D96]"><Loader2 className="animate-spin" size={28} /></div> : filteredStaff.length ? <div className="divide-y divide-gray-100">{filteredStaff.map((item, index) => <ProbationRow key={probationId(item) || index} staff={item} loading={activeAction === "details-" + probationId(item)} onView={() => void openDetails(item)} />)}</div> : <EmptyState />}</section>

      {showAdd && <Modal title="Add probation staff" subtitle="Create a probation record and define measurable objectives." onClose={() => setShowAdd(false)}><form onSubmit={submitNewStaff} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Field label="Full name"><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} placeholder="Employee name" /></Field><Field label="Email address"><input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={inputClass} placeholder="employee@example.com" /></Field><Field label="Role"><input required value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className={inputClass} placeholder="e.g. Product Analyst" /></Field><Field label="Work mode"><select value={form.workMode} onChange={(event) => setForm({ ...form, workMode: event.target.value })} className={inputClass}><option>Onsite</option><option>Remote</option><option>Hybrid</option></select></Field><Field label="Start date"><input required type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} className={inputClass} /></Field><Field label="End date"><input required min={form.startDate || localToday()} type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} className={inputClass} /></Field></div><Field label="Probation objectives"><textarea required rows={6} value={form.objectives} onChange={(event) => setForm({ ...form, objectives: event.target.value })} className={inputClass + " resize-y"} placeholder={"Complete onboarding milestones;\nDeliver first project independently;\nMeet agreed performance targets"} /><span className="mt-1.5 block text-xs text-gray-400">Enter one objective per line or separate objectives with semicolons.</span></Field><ModalActions onCancel={() => setShowAdd(false)} loading={activeAction === "add"} submitLabel="Add staff" /></form></Modal>}

      {showDetails && selectedStaff && <Modal title="Probation details" subtitle="Review employee progress and update objective completion." onClose={() => setShowDetails(false)}><ProbationDetails staff={selectedStaff} activeAction={activeAction} onToggle={(objective) => void toggleObjective(objective)} /><div className="mt-6 grid gap-2 border-t border-gray-100 pt-5 sm:grid-cols-3"><button onClick={() => openAction("Confirm")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"><UserCheck size={16} />Confirm</button><button onClick={() => openAction("Extend")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"><TimerReset size={16} />Extend</button><button onClick={() => openAction("Terminate")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white"><UserMinus size={16} />Terminate</button></div></Modal>}

      {showAction && selectedStaff && <Modal title={action + " probation"} subtitle={action === "Extend" ? "Choose the revised probation end date." : "Confirm this final probation decision for " + selectedStaff.name + "."} onClose={() => setShowAction(false)}>{action === "Extend" && <Field label="New end date"><input required min={localToday()} type="date" value={newEndDate} onChange={(event) => setNewEndDate(event.target.value)} className={inputClass} /></Field>}<div className={"mt-5 rounded-2xl p-4 text-sm leading-6 " + (action === "Terminate" ? "bg-rose-50 text-rose-700" : action === "Confirm" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700")}>{action === "Confirm" ? "This employee will be marked as confirmed after probation." : action === "Extend" ? "The employee will remain on probation until the new end date." : "This action marks the employee's probation as terminated."}</div><div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button onClick={() => setShowAction(false)} className="rounded-xl px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button><button onClick={() => void submitAction()} disabled={activeAction === "status-" + probationId(selectedStaff)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4A1D96] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{activeAction === "status-" + probationId(selectedStaff) && <Loader2 className="animate-spin" size={16} />}Confirm action</button></div></Modal>}
    </div>
  );
};

const ProbationRow = ({ staff, loading, onView }: { staff: ProbationStaff; loading: boolean; onView: () => void }) => { const days = daysRemaining(staff.endDate); const score = scoreFor(staff); return <article className="p-5 transition hover:bg-[#FAFAFF] sm:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0 flex-1"><div className="mb-3 flex flex-wrap items-center gap-2"><span className={"rounded-full px-3 py-1 text-xs font-semibold " + statusStyle(staff.status)}>{staff.status || "On probation"}</span><span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">{staff.workMode}</span>{days !== null && days >= 0 && days <= 14 && <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">Due in {days} day{days === 1 ? "" : "s"}</span>}</div><h3 className="text-lg font-semibold text-gray-900">{staff.name}</h3><p className="mt-1 text-sm text-gray-500">{staff.role} Â· {staff.email}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-gray-500"><span className="flex items-center gap-1.5"><CalendarClock size={15} className="text-[#4A1D96]" />{formatDate(staff.startDate)} - {formatDate(staff.endDate)}</span><span className="flex items-center gap-1.5"><Target size={15} className="text-[#4A1D96]" />{normalizeObjectives(staff).length} objectives</span></div><div className="mt-4 max-w-md"><div className="mb-1.5 flex items-center justify-between text-xs font-medium"><span className="text-gray-500">Objective score</span><span className="text-[#4A1D96]">{score}%</span></div><div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-[#4A1D96] transition-all" style={{ width: Math.min(100, Math.max(0, score)) + "%" }} /></div></div></div><button onClick={onView} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-[#4A1D96] disabled:opacity-50">{loading ? <Loader2 className="animate-spin" size={16} /> : <Eye size={16} />}View progress</button></div></article>; };

const ProbationDetails = ({ staff, activeAction, onToggle }: { staff: ProbationStaff; activeAction: string | null; onToggle: (objective: NormalizedObjective) => void }) => { const objectives = normalizeObjectives(staff); const score = scoreFor(staff); return <div className="space-y-6"><div className="rounded-3xl bg-linear-to-br from-[#4A1D96] to-[#8B5CF6] p-6 text-white"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm text-indigo-100">{staff.email}</p><h3 className="mt-1 text-2xl font-semibold">{staff.name}</h3><p className="mt-2 text-sm text-indigo-100">{staff.role} Â· {staff.workMode}</p></div><div className="rounded-2xl bg-white/15 px-5 py-4 text-center"><p className="text-3xl font-bold">{score}%</p><p className="mt-1 text-xs text-indigo-100">Objective score</p></div></div></div><InfoGrid items={[["Start date", formatDate(staff.startDate)], ["End date", formatDate(staff.endDate)], ["Status", staff.status || "On probation"], ["Objectives", String(objectives.length)]]} /><section><div className="mb-3 flex items-center justify-between"><div><h4 className="font-semibold text-gray-900">Probation objectives</h4><p className="mt-1 text-xs text-gray-500">The score updates automatically as objectives are completed.</p></div></div>{objectives.length ? <div className="space-y-2">{objectives.map((objective) => <button key={objective.id} onClick={() => onToggle(objective)} disabled={activeAction === "objective-" + objective.id} className="flex w-full items-start gap-3 rounded-2xl border border-gray-100 p-4 text-left transition hover:bg-gray-50 disabled:opacity-50"><span className={"mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border " + (objective.completed ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-300 bg-white text-transparent")}><Check size={14} /></span><span className={"flex-1 text-sm leading-6 " + (objective.completed ? "text-gray-400 line-through" : "text-gray-700")}>{objective.text}</span>{activeAction === "objective-" + objective.id && <Loader2 className="animate-spin text-[#4A1D96]" size={16} />}</button>)}</div> : <p className="rounded-2xl bg-gray-50 p-5 text-sm text-gray-500">No objectives were returned for this employee.</p>}</section></div>; };

const Stat = ({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "indigo" | "amber" | "rose" | "blue" }) => { const colors = { indigo: "bg-indigo-50 text-[#4A1D96]", amber: "bg-amber-50 text-amber-600", rose: "bg-rose-50 text-rose-600", blue: "bg-blue-50 text-blue-600" }; return <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:p-5"><div className={"mb-4 w-fit rounded-xl p-2.5 " + colors[tone]}>{icon}</div><p className="text-2xl font-bold text-gray-900">{value}</p><p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">{label}</p></div>; };
const EmptyState = () => <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center"><div className="rounded-2xl bg-indigo-50 p-4 text-[#4A1D96]"><Award size={28} /></div><h3 className="mt-4 font-semibold text-gray-900">No probation staff found</h3><p className="mt-1 max-w-sm text-sm text-gray-500">Add a probation employee or adjust the current filters.</p></div>;
const Modal = ({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) => <div className="fixed inset-0 z-60 flex items-end justify-center bg-gray-950/45 p-0 backdrop-blur-xs sm:items-center sm:p-4"><div className="mobile-safe-bottom max-h-[94dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7"><div className="mb-6 flex items-start justify-between gap-4"><div><h3 className="text-xl font-semibold text-gray-900">{title}</h3><p className="mt-1 text-sm text-gray-500">{subtitle}</p></div><button onClick={onClose} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100"><X size={20} /></button></div>{children}</div></div>;
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <label><FieldLabel>{label}</FieldLabel>{children}</label>;
const FieldLabel = ({ children }: { children: React.ReactNode }) => <span className="mb-1.5 block text-xs font-semibold text-gray-700">{children}</span>;
const ModalActions = ({ onCancel, loading, submitLabel }: { onCancel: () => void; loading: boolean; submitLabel: string }) => <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} className="rounded-xl px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button><button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4A1D96] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{loading && <Loader2 className="animate-spin" size={16} />}{submitLabel}</button></div>;
const InfoGrid = ({ items }: { items: string[][] }) => <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{items.map(([label, value]) => <div key={label} className="rounded-2xl bg-gray-50 p-3"><p className="text-xs text-gray-400">{label}</p><p className="mt-1 text-sm font-semibold text-gray-800">{value}</p></div>)}</div>;

export default Probation;
