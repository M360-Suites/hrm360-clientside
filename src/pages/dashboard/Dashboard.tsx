import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useEmployeeStore } from "../../store/useEmployeeStore";
import { useAttendanceStore } from "../../store/useAttendanceStore";
import { useLeaveStore } from "../../store/useLeaveStore";
import { useAuthStore } from "../../store/useAuthStore";

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<EmployeeFormData>(emptyForm);
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [now, setNow] = useState(new Date());

  const { employees, isLoading, error, fetchEmployees, createEmployee } = useEmployeeStore();
  const { todayStats, fetchTodayStats } = useAttendanceStore();
  const { leaves, fetchLeaves } = useLeaveStore();
  const { user, isAdmin } = useAuthStore();

  const employeeName = user?.name?.split(" ")[0] || "Employee";

  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;
    fetchEmployees();
    fetchTodayStats();
    fetchLeaves();
  }, [fetchEmployees, fetchTodayStats, fetchLeaves]);

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
    currentHour < 12
      ? "Good morning"
      : currentHour < 17
      ? "Good afternoon"
      : "Good evening";

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

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-100 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
          }`}
        >
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            {isAdmin ? "Welcome back" : `${greeting}, ${employeeName}`}
          </h2>
          <p className="text-sm text-gray-500">
            Here is an overview of what is happening across your organization today
          </p>
        </div>
        {/* {isAdmin && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#3B00D9] text-white rounded-xl text-sm font-medium hover:bg-[#3500c0]"
          >
            Add new employee
          </button>
        )} */}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <p className="text-sm font-medium text-gray-600 mb-2">Total Employee</p>
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">{employees?.length || 0}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <p className="text-sm font-medium text-gray-600 mb-2">Attendance Today</p>
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">{todayStats?.present || 0}</h3>
          <p className="text-xs text-gray-500 mt-2">Rate: {todayStats?.rate || "0%"}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs sm:col-span-2 lg:col-span-1">
          <p className="text-sm font-medium text-gray-600 mb-2">On Leave</p>
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {leaves?.filter((l: any) => String(l.status).toLowerCase() === "approved").length || 0}
          </h3>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <h3 className="font-semibold text-gray-800 mb-4">Calendar</h3>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">{monthLabel}</span>
          <div className="flex gap-2 text-gray-400">
            <button
              type="button"
              onClick={() =>
                setCalendarMonth(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                )
              }
              className="p-1 rounded hover:bg-gray-100"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() =>
                setCalendarMonth(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                )
              }
              className="p-1 rounded hover:bg-gray-100"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-gray-500">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-700">
          {calendarCells.map((dateNum, i) => {
            const isToday = isCurrentMonth && dateNum === new Date().getDate();
            return (
              <div
                key={`${dateNum}-${i}`}
                className={`p-1.5 rounded-full min-h-8 flex items-center justify-center ${
                  isToday ? "bg-[#FF0055] text-white" : "text-gray-700"
                }`}
              >
                {dateNum || ""}
              </div>
            );
          })}
        </div>
      </div>

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
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
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
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
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
