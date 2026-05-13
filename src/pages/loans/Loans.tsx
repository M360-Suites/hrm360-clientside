import { TrendingUp, CheckCircle2, Award, Clock, Search, MoreVertical, Send } from "lucide-react";

const loans = [
  { name: "Zainab Mohammed", email: "zainab@healthcare.com", amount: "₦900,000", tenure: "20 months", repayment: "₦45,000", reason: "Healthcare", status: "Approved" },
  { name: "Zainab Mohammed", email: "zainab@healthcare.com", amount: "₦900,000", tenure: "20 months", repayment: "₦45,000", reason: "Healthcare", status: "Pending" },
  { name: "Zainab Mohammed", email: "zainab@healthcare.com", amount: "₦900,000", tenure: "20 months", repayment: "₦45,000", reason: "Healthcare", status: "Rejected" },
  { name: "Zainab Mohammed", email: "zainab@healthcare.com", amount: "₦900,000", tenure: "20 months", repayment: "₦45,000", reason: "Healthcare", status: "Rejected" },
  { name: "Zainab Mohammed", email: "zainab@healthcare.com", amount: "₦900,000", tenure: "20 months", repayment: "₦45,000", reason: "Healthcare", status: "Approved" }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Approved': return 'bg-emerald-50 text-emerald-600';
    case 'Rejected': return 'bg-rose-50 text-rose-600';
    case 'Pending': return 'bg-amber-50 text-amber-600';
    default: return 'bg-gray-50 text-gray-600';
  }
};

const Loans = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Loan Management</h2>
          <p className="text-sm text-gray-500">Track and manage employee loans</p>
        </div>
        <button className="bg-purple-50 text-[#3B00D9] px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-100 transition-colors shadow-xs">
          View loan policy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-2 bg-indigo-50 text-indigo-500 rounded-full"><TrendingUp size={20} /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Active Loans</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">8</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-2 bg-emerald-50 text-emerald-500 rounded-full"><CheckCircle2 size={20} /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Disbursed</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">₦4.2M</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-2 bg-emerald-50 text-emerald-500 rounded-full"><Award size={20} /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Pending Request</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">3</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-2 bg-rose-50 text-rose-500 rounded-full"><Clock size={20} /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Monthly repayments</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">₦680K</h3>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 border-b border-gray-200 pb-4">
        <div className="flex gap-6 text-sm font-medium">
          <button className="text-gray-800 border-b-2 border-gray-800 pb-4 mb-[-17px]">All</button>
          <button className="text-gray-500 hover:text-gray-800 transition-colors pb-4 mb-[-17px]">Approved</button>
          <button className="text-gray-500 hover:text-gray-800 transition-colors pb-4 mb-[-17px]">Pending</button>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search courses.." 
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="bg-white text-gray-800 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Tenure</th>
                <th className="px-6 py-4">Repayment</th>
                <th className="px-6 py-4">Reasons</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loans.map((loan, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors relative group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={`https://i.pravatar.cc/150?img=${idx + 20}`} alt="avatar" className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-semibold text-gray-900">{loan.name}</p>
                        <p className="text-xs text-gray-500">{loan.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">{loan.amount}</td>
                  <td className="px-6 py-4">{loan.tenure}</td>
                  <td className="px-6 py-4">{loan.repayment}</td>
                  <td className="px-6 py-4 text-gray-500">{loan.reason}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(loan.status)}`}>
                      {loan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical size={18} />
                    </button>
                    {/* Tooltip mockup */}
                    {idx === 0 && (
                      <div className="absolute right-12 top-1/2 -translate-y-1/2 bg-white border border-gray-100 shadow-lg rounded-xl p-2 z-10 flex items-center gap-2 text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                        <Send size={14} className="text-blue-500" /> View Details
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
            &larr; Previous
          </button>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 text-[#3B00D9] text-sm font-medium">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 text-sm">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 text-sm">3</button>
            <span className="text-gray-400 mx-1">..</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 text-sm">8</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 text-sm">9</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 text-sm">10</button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
            Next &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Loans;
