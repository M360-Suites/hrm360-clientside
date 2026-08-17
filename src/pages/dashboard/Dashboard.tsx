import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Users,
  UserCheck,
  CalendarOff,
  Clock,
  Calendar,
  Bell,
  TrendingUp,
  ClipboardList,
  Briefcase,
  ArrowUpRight,
  Zap,
  BarChart2,
  Sparkles,
} from "lucide-react";
import { useEmployeeStore } from "../../store/useEmployeeStore";
import { useAttendanceStore } from "../../store/useAttendanceStore";
import { useLeaveStore } from "../../store/useLeaveStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

type Toast = { type: "success" | "error"; message: string };

type EmployeeFormData = {
  name: string;
  email: string;
  role: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyForm: EmployeeFormData = {
  name: "",
  email: "",
  role: "",
};

const validateEmployee = (data: EmployeeFormData) => {
  const errors: Record<string, string> = {};

  if (!data.name.trim()) errors.name = "Name is required.";
  else if (data.name.trim().length < 2) errors.name = "Name must be at least 2 characters.";

  if (!data.email.trim()) errors.email = "Email is required.";
  else if (!emailRegex.test(data.email)) errors.email = "Please enter a valid email address.";

  if (!data.role.trim()) errors.role = "Role / Job title is required.";

  return errors;
};

const formatAttendanceRate = (value: unknown) => {
  const normalized = typeof value === "string" ? value.replace("%", "").trim() : value;
  const rate = Number(normalized);
  if (!Number.isFinite(rate)) return "0.00%";
  return `${rate.toFixed(2)}%`;
};

const getRateNumber = (value: unknown) => {
  const normalized = typeof value === "string" ? value.replace("%", "").trim() : value;
  const rate = Number(normalized);
  return Number.isFinite(rate) ? rate : 0;
};

const getCalendarCells = (baseDate: Date) => {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const mondayFirstOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<number | null> = [];
  for (let i = 0; i < mondayFirstOffset; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);
  while (cells.length < 42) cells.push(null);

  return cells;
};

const Dashboard = () => {
  const fetchedOnce = useRef(false);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<EmployeeFormData>(emptyForm);
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [now, setNow] = useState(new Date());

  const { employees, total, isLoading, error, fetchEmployees, createEmployee } = useEmployeeStore();
  const { todayStats, fetchTodayStats } = useAttendanceStore();
  const { leaves, fetchLeaves } = useLeaveStore();
  const { user, isAdmin } = useAuthStore();

  const employeeName = user?.name?.split(" ")[0] || "Employee";

  useEffect(() => {
    if (!isAdmin) return;
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;
    fetchEmployees();
    fetchTodayStats();
    fetchLeaves();
  }, [isAdmin, fetchEmployees, fetchTodayStats, fetchLeaves]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const calendarCells = useMemo(() => getCalendarCells(calendarMonth), [calendarMonth]);
  const monthLabel = calendarMonth.toLocaleString("default", { month: "long", year: "numeric" });
  const isCurrentMonth =
    calendarMonth.getFullYear() === new Date().getFullYear() &&
    calendarMonth.getMonth() === new Date().getMonth();
  const currentHour = now.getHours();
  const greeting =
    currentHour < 12 ? "Good morning" : currentHour < 17 ? "Good afternoon" : "Good evening";
  const timeLabel = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const dateLabel = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const attendanceRate = formatAttendanceRate(todayStats?.rate);
  const attendanceRateNum = getRateNumber(todayStats?.rate);
  const totalEmployeeCount = total || employees?.length || 0;
  const onLeaveCount =
    leaves?.filter((l: any) => String(l.status).toLowerCase() === "approved").length || 0;

  const showToast = (type: Toast["type"], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const updateField = (field: keyof EmployeeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setFormErrors({});
  };

  const fieldCls = (field: string) =>
    `w-full px-4 py-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
      formErrors[field]
        ? "border-rose-400 focus:ring-rose-200 focus:border-rose-400"
        : "border-gray-200 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9]"
    }`;

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateEmployee(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast("error", "Please complete all required fields.");
      return;
    }
    const success = await createEmployee({
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role.trim(),
      status: "Active",
      basicSalary: 0,
      allowances: 0,
      deductions: 0,
      joinedAt: new Date().toISOString(),
    });
    if (!success) {
      showToast("error", useEmployeeStore.getState().error || error || "Failed to add employee.");
      return;
    }
    showToast("success", "Employee added successfully!");
    setIsModalOpen(false);
    resetForm();
  };

  // Quick actions
  const adminQuickActions = [
    { icon: Users, label: "Employees", sub: "View & manage staff", to: "/employees", color: "text-[#4A1D96]", bg: "bg-purple-50", border: "border-purple-100" },
    { icon: ClipboardList, label: "Attendance", sub: "Track clock-ins", to: "/attendance", color: "text-[#2563EB]", bg: "bg-blue-50", border: "border-blue-100" },
    { icon: CalendarOff, label: "Leave", sub: "Approve requests", to: "/leave", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    { icon: Briefcase, label: "Recruitment", sub: "Open positions", to: "/recruitment", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  ];

  const staffQuickActions = [
    { icon: ClipboardList, label: "Attendance", sub: "View my records", to: "/attendance", color: "text-[#2563EB]", bg: "bg-blue-50", border: "border-blue-100" },
    { icon: CalendarOff, label: "Apply Leave", sub: "Submit a request", to: "/leave", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    { icon: Briefcase, label: "Jobs", sub: "Open positions", to: "/recruitment", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { icon: Bell, label: "Notifications", sub: "What's new", to: "/notifications", color: "text-[#E91EFA]", bg: "bg-pink-50", border: "border-pink-100" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-8">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
          }`}
        >
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* ── HERO WELCOME BANNER ── */}
      <div className="rounded-2xl bg-[#4A1D96] p-7 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1 text-xs font-semibold">
                <Sparkles size={11} className="text-[#E91EFA]" />
                {isAdmin ? "Admin Dashboard" : "My Workspace"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1.5">
              {isAdmin ? "Welcome back" : `${greeting}, ${employeeName}`}
            </h2>
            <p className="text-white/60 text-sm max-w-md">
              {isAdmin
                ? "Here's a snapshot of your organization right now."
                : "Here is your personal workspace snapshot for today."}
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-0.5 shrink-0 bg-white/10 border border-white/15 rounded-xl px-5 py-3">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-white/60" />
              <span className="text-2xl font-bold tabular-nums">{timeLabel}</span>
            </div>
            <div className="text-xs text-white/50 pl-5">{dateLabel}</div>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      {isAdmin ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Employees */}
          <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-200 cursor-default">
            <div className="flex items-center justify-between mb-5">
              <div className="h-14 w-14 rounded-2xl bg-[#4A1D96] flex items-center justify-center">
                <Users size={28} className="text-white" />
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-full">
                <TrendingUp size={11} /> Active
              </span>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Total Employees</p>
            <h3 className="text-5xl font-extrabold text-gray-900 tabular-nums leading-none">
              {totalEmployeeCount}
            </h3>
            <p className="text-xs text-gray-400 mt-2">Staff currently in the organization</p>
          </div>

          {/* Attendance Today */}
          <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-200 cursor-default">
            <div className="flex items-center justify-between mb-5">
              <div className="h-14 w-14 rounded-2xl bg-[#2563EB] flex items-center justify-center">
                <UserCheck size={28} className="text-white" />
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                <BarChart2 size={11} /> {attendanceRate}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Present Today</p>
            <h3 className="text-5xl font-extrabold text-gray-900 tabular-nums leading-none">
              {todayStats?.present || 0}
            </h3>
            <div className="mt-3">
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2563EB] rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(attendanceRateNum, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">of total staff clocked in</p>
            </div>
          </div>

          {/* On Leave */}
          <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-200 cursor-default">
            <div className="flex items-center justify-between mb-5">
              <div className="h-14 w-14 rounded-2xl bg-amber-500 flex items-center justify-center">
                <CalendarOff size={28} className="text-white" />
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
                <CheckCircle size={11} /> Approved
              </span>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">On Leave</p>
            <h3 className="text-5xl font-extrabold text-gray-900 tabular-nums leading-none">
              {onLeaveCount}
            </h3>
            <p className="text-xs text-gray-400 mt-2">Staff on approved leave today</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Clock */}
          <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center mb-5">
              <Clock size={28} className="text-white" />
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Current Time</p>
            <h3 className="text-4xl font-extrabold text-gray-900 tabular-nums">{timeLabel}</h3>
            <p className="text-xs text-gray-400 mt-2">Local workspace time</p>
          </div>

          {/* Date */}
          <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <div className="h-14 w-14 rounded-2xl bg-[#4A1D96] flex items-center justify-center mb-5">
              <Calendar size={28} className="text-white" />
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Today</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900">{dateLabel}</h3>
            <p className="text-xs text-gray-400 mt-2">Plan your workday</p>
          </div>

          {/* Reminder */}
          <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <div className="h-14 w-14 rounded-2xl bg-[#E91EFA] flex items-center justify-center mb-5">
              <Bell size={28} className="text-white" />
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Quick Reminder</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900">Check attendance</h3>
            <p className="text-xs text-gray-400 mt-2">Scan workplace QR or mark clock-in</p>
          </div>
        </div>
      )}

      {/* ── QUICK ACTIONS ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-[#8B5CF6]" />
          <h3 className="text-sm font-semibold text-gray-700">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(isAdmin ? adminQuickActions : staffQuickActions).map(({ icon: Icon, label, sub, to, color, bg, border }) => (
            <button
              key={label}
              type="button"
              onClick={() => navigate(to)}
              className={`group flex flex-col items-start gap-3 p-4 rounded-2xl border ${border} ${bg} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center ${color}`}>
                  <Icon size={22} />
                </div>
                <ArrowUpRight size={15} className={`${color} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── CALENDAR ── */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#4A1D96]">
              <Calendar size={16} />
            </div>
            <h3 className="font-semibold text-gray-800">Calendar</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">{monthLabel}</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() =>
                  setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                }
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() =>
                  setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                }
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 font-semibold text-gray-400">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-700">
          {calendarCells.map((dateNum, i) => {
            const isToday = isCurrentMonth && dateNum === new Date().getDate();
            const isWeekend =
              dateNum !== null &&
              (() => {
                const col = i % 7;
                return col === 5 || col === 6;
              })();
            return (
              <div
                key={`${dateNum}-${i}`}
                className={`p-1.5 rounded-xl min-h-9 flex items-center justify-center text-sm transition-colors ${
                  isToday
                    ? "bg-gradient-to-br from-[#4A1D96] to-[#8B5CF6] text-white font-bold shadow-md"
                    : isWeekend && dateNum
                    ? "text-[#8B5CF6] hover:bg-purple-50"
                    : dateNum
                    ? "hover:bg-gray-50"
                    : ""
                }`}
              >
                {dateNum || ""}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ADD EMPLOYEE MODAL ── */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <div className="mobile-safe-bottom bg-white rounded-t-3xl shadow-2xl w-full max-w-md max-h-[92dvh] overflow-y-auto sm:rounded-3xl">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Add Employee</h3>
                  <p className="text-sm text-gray-500 mt-1">Setup a new member in your team</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <form className="space-y-5" onSubmit={handleAddEmployee} noValidate>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="e.g. Adebayo Johnson"
                    className={fieldCls("name")}
                  />
                  {formErrors.name && <p className="mt-1.5 text-xs text-rose-500 font-medium">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="e.g. adebayo@company.com"
                    className={fieldCls("email")}
                  />
                  {formErrors.email && <p className="mt-1.5 text-xs text-rose-500 font-medium">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => updateField("role", e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className={fieldCls("role")}
                  />
                  {formErrors.role && <p className="mt-1.5 text-xs text-rose-500 font-medium">{formErrors.role}</p>}
                </div>

                <div className="pt-4 flex flex-col-reverse gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                    className="flex-1 py-3.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3.5 bg-[#3B00D9] hover:bg-[#3500c0] text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isLoading && <Loader2 className="animate-spin" size={16} />}
                    Add Member
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

export default Dashboard;
