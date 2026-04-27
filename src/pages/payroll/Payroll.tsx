import { useEffect, useState } from "react";
import { Download, RefreshCw, Search, Calendar, FileText, MoreVertical, Loader2 } from "lucide-react";
import { usePayrollStore } from "../../store/usePayrollStore";

const Payroll = () => {
  const { summary, employeesSalary, isLoading, fetchSummary, fetchEmployeesSalary, runPayroll } = usePayrollStore();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");

  useEffect(() => {
    fetchSummary();
    fetchEmployeesSalary();
  }, []);

  const handleRunPayroll = async () => {
    const payPeriod = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    await runPayroll(payPeriod, pin);
    setShowPinModal(false);
    setPin("");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Payroll Management</h2>
          <p className="text-sm text-gray-500">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} payroll cycle</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={16} /> Export payroll
          </button>
          <button 
            onClick={() => setShowPinModal(true)}
            className="bg-purple-50 text-[#3B00D9] px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-purple-100 transition-colors shadow-sm"
          >
            <RefreshCw size={16} /> Run payroll
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3 text-indigo-500">
            <div className="p-2 bg-indigo-50 rounded-lg"><Calendar size={18} /></div>
            <span className="text-sm font-medium text-gray-600">Gross Salary</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.totalGrossSalary || 0)}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3 text-rose-500">
            <div className="p-2 bg-rose-50 rounded-lg"><FileText size={18} /></div>
            <span className="text-sm font-medium text-gray-600">Total Deductions</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.totalDeductions || 0)}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3 text-emerald-500">
            <div className="p-2 bg-emerald-50 rounded-lg"><Calendar size={18} /></div>
            <span className="text-sm font-medium text-gray-600">Net Salary</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.totalNetSalary || 0)}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3 text-orange-500">
            <div className="p-2 bg-orange-50 rounded-lg"><FileText size={18} /></div>
            <span className="text-sm font-medium text-gray-600">Pending Payslips</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{summary?.pendingPayslips || 0}</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search employee" 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm"
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
                <th className="px-6 py-4 text-right">Net Pay</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employeesSalary?.map((data: any, idx: number) => (
                <tr key={data.id || idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-[#3B00D9] font-bold">
                        {data.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{data.name}</p>
                        <p className="text-xs text-gray-500">{data.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">{formatCurrency(data.basicSalary)}</td>
                  <td className="px-6 py-4 text-right font-medium">{formatCurrency(data.allowances)}</td>
                  <td className="px-6 py-4 text-right font-medium text-rose-500">{formatCurrency(data.deductions)}</td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">{formatCurrency(data.netSalary)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                      data.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {data.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {employeesSalary?.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    No payroll data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Run Payroll</h3>
            <p className="text-sm text-gray-500 mb-6">Enter your payroll PIN to authorize this cycle.</p>
            
            <input 
              type="password" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] mb-6 text-center text-2xl tracking-[1em]"
              maxLength={4}
            />

            <div className="flex gap-3">
              <button 
                onClick={() => setShowPinModal(false)}
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleRunPayroll}
                disabled={pin.length < 4 || isLoading}
                className="flex-1 py-3 bg-[#3B00D9] text-white rounded-xl font-medium hover:bg-[#3500c0] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="animate-spin" size={18} />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
