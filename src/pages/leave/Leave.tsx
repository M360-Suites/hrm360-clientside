import { useEffect } from "react";
import { Search, MoreVertical, Calendar, Loader2 } from "lucide-react";
import { useLeaveStore } from "../../store/useLeaveStore";

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approved': return 'bg-emerald-50 text-emerald-600';
    case 'rejected': return 'bg-rose-50 text-rose-600';
    case 'pending': return 'bg-amber-50 text-amber-600';
    default: return 'bg-gray-50 text-gray-600';
  }
};

const Leave = () => {
  const { leaves, isLoading, fetchLeaves } = useLeaveStore();

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Leave Management</h2>
        <p className="text-sm text-gray-500">Track and manage employee leave requests</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Annual Leave", count: 32, color: "text-indigo-500", bg: "bg-indigo-50" },
          { label: "Sick Leave", count: 12, color: "text-rose-500", bg: "bg-rose-50" },
          { label: "Maternity", count: 5, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Compassionate", count: 8, color: "text-orange-500", bg: "bg-orange-50" }
        ].map((item, i) => (
          <div key={i} className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-center">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className={`p-1.5 sm:p-2 rounded-lg ${item.bg} ${item.color}`}>
                <Calendar size={16} />
              </div>
              <span className="text-[10px] sm:text-sm font-medium text-gray-600 truncate">{item.label}</span>
            </div>
            <h3 className="text-xl sm:text-3xl font-semibold text-gray-900 mt-1">{item.count}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search employee" 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm"
            />
          </div>
          <button className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            Sort by
          </button>
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
                <th className="px-6 py-4">Leave type</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Reasons</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leaves?.map((leave: any, idx: number) => (
                <tr key={leave.id || idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                        {leave.employeeName?.charAt(0) || 'E'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{leave.employeeName || 'Employee'}</p>
                        <p className="text-xs text-gray-500">{leave.employeeEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{leave.type || 'Annual Leave'}</td>
                  <td className="px-6 py-4">{new Date(leave.startDate).toLocaleDateString()} → {new Date(leave.endDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-gray-500 truncate max-w-xs">{leave.reason}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(leave.status)}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {leaves?.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leave;
