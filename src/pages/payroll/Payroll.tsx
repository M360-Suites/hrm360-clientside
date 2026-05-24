import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Download,
  RefreshCw,
  Search,
  Calendar,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import { usePayrollStore } from "../../store/usePayrollStore";
import { useAuthStore } from "../../store/useAuthStore";

const Payroll = () => {
  const {
    summary,
    employeesSalary,
    isLoading,
    error,
    fetchSummary,
    fetchEmployeesSalary,
    configurePayrollPin,
    runPayroll,
    payPayroll,
    isPayrollPinConfigured,
  } = usePayrollStore();
  const { isAdmin } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showRunPinModal, setShowRunPinModal] = useState(false);
  const [showPayPinModal, setShowPayPinModal] = useState(false);
  const [showSetupPinModal, setShowSetupPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [setupPin, setSetupPin] = useState("");
  const [confirmSetupPin, setConfirmSetupPin] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const payPeriod = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    fetchSummary();
    fetchEmployeesSalary();
  }, [fetchSummary, fetchEmployeesSalary]);

  useEffect(() => {
    if (!error) return;
    setToast({ type: "error", message: error });
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  const filteredEmployees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return employeesSalary;

    return employeesSalary.filter((emp: any) => {
      const name = String(emp.name || "").toLowerCase();
      const email = String(emp.email || "").toLowerCase();
      const role = String(emp.role || "").toLowerCase();
      const status = String(emp.status || "").toLowerCase();
      return [name, email, role, status].join(" ").includes(query);
    });
  }, [employeesSalary, searchQuery]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRunPayroll = async () => {
    if (!isPayrollPinConfigured) {
      setShowSetupPinModal(true);
      return;
    }
    const success = await runPayroll(payPeriod, pin);
    if (!success) return;
    showToast("success", "Payroll run completed successfully.");
    setShowRunPinModal(false);
    setPin("");
  };

  const openPayModal = (employee: any) => {
    setSelectedEmployee(employee);
    setPin("");
    setShowPayPinModal(true);
  };

  const handlePayPayroll = async () => {
    if (!isPayrollPinConfigured) {
      setShowSetupPinModal(true);
      return;
    }
    if (!selectedEmployee) return;
    const employeeId = selectedEmployee.id || selectedEmployee._id;
    if (!employeeId) {
      showToast("error", "Employee ID is missing.");
      return;
    }
    const success = await payPayroll(payPeriod, employeeId, pin);
    if (!success) return;
    showToast("success", `Payroll paid for ${selectedEmployee.name || "employee"}.`);
    setShowPayPinModal(false);
    setSelectedEmployee(null);
    setPin("");
  };

  const handleConfigurePin = async () => {
    if (setupPin.trim().length < 4) {
      showToast("error", "PIN must be at least 4 digits.");
      return;
    }
    if (setupPin !== confirmSetupPin) {
      showToast("error", "PIN confirmation does not match.");
      return;
    }
    const success = await configurePayrollPin(setupPin.trim());
    if (!success) return;
    showToast("success", "Payroll PIN configured successfully.");
    setShowSetupPinModal(false);
    setSetupPin("");
    setConfirmSetupPin("");
    setPin("");
    fetchSummary();
  };

  const handleExportPayroll = () => {
    const headers = [
      "Name",
      "Email",
      "Role",
      "Status",
      "Basic Salary",
      "Allowances",
      "Deductions",
      "Gross Salary",
      "Net Salary",
    ];

    const rows = filteredEmployees.map((emp: any) => [
      emp.name || "",
      emp.email || "",
      emp.role || "",
      emp.status || "",
      emp.basicSalary || 0,
      emp.allowances || 0,
      emp.deductions || 0,
      emp.grossSalary || 0,
      emp.netSalary || 0,
    ]);

    const escapeCsv = (value: string | number) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Payroll Management</h2>
          <p className="text-sm text-gray-500">{payPeriod} payroll cycle</p>
        </div>
        <div className="flex w-full sm:w-auto gap-3">
          <button
            onClick={handleExportPayroll}
            className="flex-1 sm:flex-none bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-xs"
          >
            <Download size={16} /> Export payroll
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowSetupPinModal(true)}
              className="flex-1 sm:flex-none bg-white border border-purple-200 text-[#3B00D9] px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors shadow-xs"
            >
              <ShieldCheck size={16} /> {isPayrollPinConfigured ? "Update PIN" : "Set Payroll PIN"}
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setShowRunPinModal(true)}
              className="flex-1 sm:flex-none bg-purple-50 text-[#3B00D9] px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-purple-100 transition-colors shadow-xs"
            >
              <RefreshCw size={16} /> Run payroll
            </button>
          )}
        </div>
      </div>

      {isAdmin && !isPayrollPinConfigured && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-800">Payroll PIN setup required</p>
            <p className="text-sm text-amber-700 mt-1">
              Configure your organization payroll PIN before running payroll or paying employees.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSetupPinModal(true)}
            className="shrink-0 px-4 py-2 rounded-lg bg-[#3B00D9] text-white text-sm font-semibold hover:bg-[#3500c0]"
          >
            Configure PIN
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <SummaryCard
          label="Employees"
          value={summary?.totalEmployees || 0}
          tone="indigo"
          icon={<Calendar size={18} />}
          format={false}
        />
        <SummaryCard
          label="Gross Salary"
          value={summary?.totalGrossSalary || 0}
          tone="indigo"
          icon={<Calendar size={18} />}
          formatter={formatCurrency}
        />
        <SummaryCard
          label="Deductions"
          value={summary?.totalDeductions || 0}
          tone="rose"
          icon={<FileText size={18} />}
          formatter={formatCurrency}
        />
        <SummaryCard
          label="Net Salary"
          value={summary?.totalNetSalary || 0}
          tone="emerald"
          icon={<Wallet size={18} />}
          formatter={formatCurrency}
        />
        <SummaryCard
          label="Pending Payslips"
          value={summary?.pendingPayslips || 0}
          tone="amber"
          icon={<FileText size={18} />}
          format={false}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px] relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
              <Loader2 className="animate-spin text-[#3B00D9]" size={32} />
            </div>
          )}
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="bg-white text-gray-800 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4 text-right">Basic Salary</th>
                <th className="px-6 py-4 text-right">Allowances</th>
                <th className="px-6 py-4 text-right">Deductions</th>
                <th className="px-6 py-4 text-right">Gross Salary</th>
                <th className="px-6 py-4 text-right">Net Pay</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredEmployees?.map((emp: any, idx: number) => (
                <tr key={emp.id || emp._id || idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-[#3B00D9] font-bold">
                        {emp.name?.charAt(0) || "E"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">{formatCurrency(emp.basicSalary)}</td>
                  <td className="px-6 py-4 text-right font-medium">{formatCurrency(emp.allowances)}</td>
                  <td className="px-6 py-4 text-right font-medium text-rose-500">{formatCurrency(emp.deductions)}</td>
                  <td className="px-6 py-4 text-right font-medium">{formatCurrency(emp.grossSalary)}</td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">{formatCurrency(emp.netSalary)}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                        String(emp.status).toLowerCase() === "paid"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {emp.status || "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={() => openPayModal(emp)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#3B00D9] text-white hover:bg-[#3500c0]"
                      >
                        Pay
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">No action</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredEmployees?.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                    No payroll data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showRunPinModal && (
        <PinModal
          title="Run Payroll"
          description={`Enter your payroll PIN to run payroll for ${payPeriod}.`}
          pin={pin}
          setPin={setPin}
          isLoading={isLoading}
          onCancel={() => {
            setShowRunPinModal(false);
            setPin("");
          }}
          onConfirm={handleRunPayroll}
          confirmLabel="Run Payroll"
        />
      )}

      {showPayPinModal && selectedEmployee && (
        <PinModal
          title="Pay Payroll"
          description={`Enter your payroll PIN to pay ${selectedEmployee.name || "this employee"} for ${payPeriod}.`}
          pin={pin}
          setPin={setPin}
          isLoading={isLoading}
          onCancel={() => {
            setShowPayPinModal(false);
            setSelectedEmployee(null);
            setPin("");
          }}
          onConfirm={handlePayPayroll}
          confirmLabel="Pay Now"
        />
      )}

      {showSetupPinModal && (
        <SetupPinModal
          setupPin={setupPin}
          confirmSetupPin={confirmSetupPin}
          setSetupPin={setSetupPin}
          setConfirmSetupPin={setConfirmSetupPin}
          isLoading={isLoading}
          onCancel={() => {
            setShowSetupPinModal(false);
            setSetupPin("");
            setConfirmSetupPin("");
          }}
          onConfirm={handleConfigurePin}
        />
      )}
    </div>
  );
};

const SummaryCard = ({
  label,
  value,
  tone,
  icon,
  formatter,
  format = true,
}: {
  label: string;
  value: number;
  tone: "indigo" | "rose" | "emerald" | "amber";
  icon: ReactNode;
  formatter?: (value: number) => string;
  format?: boolean;
}) => {
  const tones = {
    indigo: "text-indigo-500 bg-indigo-50",
    rose: "text-rose-500 bg-rose-50",
    emerald: "text-emerald-500 bg-emerald-50",
    amber: "text-amber-500 bg-amber-50",
  };

  const displayValue = format ? formatter?.(value) || value : value;

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${tones[tone]}`}>{icon}</div>
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <h3 className="text-2xl font-bold text-gray-900">{displayValue}</h3>
    </div>
  );
};

const PinModal = ({
  title,
  description,
  pin,
  setPin,
  isLoading,
  onCancel,
  onConfirm,
  confirmLabel,
}: {
  title: string;
  description: string;
  pin: string;
  setPin: (value: string) => void;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
}) => {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{description}</p>

        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter PIN"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] mb-6 text-center text-2xl tracking-[1em]"
          maxLength={6}
        />

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={pin.length < 4 || isLoading}
            className="flex-1 py-3 bg-[#3B00D9] text-white rounded-xl font-medium hover:bg-[#3500c0] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="animate-spin" size={18} />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const SetupPinModal = ({
  setupPin,
  confirmSetupPin,
  setSetupPin,
  setConfirmSetupPin,
  isLoading,
  onCancel,
  onConfirm,
}: {
  setupPin: string;
  confirmSetupPin: string;
  setSetupPin: (value: string) => void;
  setConfirmSetupPin: (value: string) => void;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Configure Payroll PIN</h3>
        <p className="text-sm text-gray-500 mb-6">
          Set a secure PIN for payroll actions like running payroll and paying employees.
        </p>

        <div className="space-y-3 mb-6">
          <input
            type="password"
            value={setupPin}
            onChange={(e) => setSetupPin(e.target.value)}
            placeholder="New PIN"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-center text-2xl tracking-[1em]"
            maxLength={6}
          />
          <input
            type="password"
            value={confirmSetupPin}
            onChange={(e) => setConfirmSetupPin(e.target.value)}
            placeholder="Confirm PIN"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-center text-2xl tracking-[1em]"
            maxLength={6}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={setupPin.length < 4 || confirmSetupPin.length < 4 || isLoading}
            className="flex-1 py-3 bg-[#3B00D9] text-white rounded-xl font-medium hover:bg-[#3500c0] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="animate-spin" size={18} />}
            Save PIN
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payroll;
