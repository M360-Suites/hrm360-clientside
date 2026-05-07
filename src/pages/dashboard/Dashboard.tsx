import { useEffect } from "react";
import { TrendingUp, ChevronDown, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { useEmployeeStore } from "../../store/useEmployeeStore";
import { useAttendanceStore } from "../../store/useAttendanceStore";
import { useLeaveStore } from "../../store/useLeaveStore";

const Dashboard = () => {
  const { employees, fetchEmployees } = useEmployeeStore();
  const { todayStats, fetchTodayStats } = useAttendanceStore();
  const { leaves, fetchLeaves } = useLeaveStore();

  useEffect(() => {
    fetchEmployees();
    fetchTodayStats();
    fetchLeaves();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Welcome back</h2>
        <p className="text-sm text-gray-500">Here is an overview of what is happening across your organization today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Cards */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative">
          <p className="text-sm font-medium text-gray-600 mb-2">Total Employee</p>
          <div className="flex items-end gap-3 mb-4">
            <h3 className="text-4xl font-bold text-gray-900">{employees?.length || 0}</h3>
            <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md mb-1">
              <TrendingUp size={12} className="mr-1" /> +2.3%
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-pink-500"></div> Remote - 0</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div> Onsite - {employees?.length || 0}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-600 mb-2">Attendance Today</p>
          <div className="flex items-end gap-3 mb-4">
            <h3 className="text-4xl font-bold text-gray-900">{todayStats?.present || 0}</h3>
            <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md mb-1">
              <TrendingUp size={12} className="mr-1" /> {todayStats?.rate || '0%'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div> On leave - {todayStats?.onLeave || 0}</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Sign in - {todayStats?.present || 0}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-600 mb-2">On leave Today</p>
          <div className="flex items-end gap-3 mb-4">
            <h3 className="text-4xl font-bold text-gray-900">{leaves?.filter((l: any) => l.status === 'Approved').length || 0}</h3>
            <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md mb-1">
              <TrendingUp size={12} className="mr-1" /> +2.3%
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Sick - 0</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div> Annual - {leaves?.filter((l: any) => l.status === 'Approved').length || 0}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Placeholder */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-800">Employee Overview</h3>
              <button className="flex items-center gap-2 text-sm font-medium text-[#3B00D9] bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                Today <ChevronDown size={14} />
              </button>
            </div>
            <div className="h-64 flex items-end justify-between relative pt-8 border-b border-gray-100">
              <div className="absolute inset-0 top-10 flex items-center justify-center">
                 <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 50">
                    <path d="M0,25 Q10,10 20,25 T40,25 T60,20 T80,35 T100,20" fill="none" stroke="#FF6B00" strokeWidth="1.5" />
                    <path d="M0,25 Q10,10 20,25 T40,25 T60,20 T80,35 T100,20 L100,50 L0,50 Z" fill="url(#gradient)" stroke="none" opacity="0.1"/>
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                 </svg>
              </div>
              
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-400 pb-6 w-full">
                <div className="flex items-center w-full border-b border-gray-50 pb-1"><span>200</span></div>
                <div className="flex items-center w-full border-b border-gray-50 pb-1"><span>150</span></div>
                <div className="flex items-center w-full border-b border-gray-50 pb-1"><span>100</span></div>
                <div className="flex items-center w-full border-b border-gray-50 pb-1"><span>50</span></div>
                <div className="flex items-center w-full pb-1"><span>0</span></div>
              </div>

              <div className="absolute bottom-0 w-full flex justify-between px-6 text-[10px] text-gray-400">
                <span>12:00</span><span>13:00</span><span>14:00</span><span>15:00</span><span>16:00</span><span>17:00</span><span>18:00</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Recent Activities</h3>
                <button className="text-xs font-medium text-[#3B00D9] bg-indigo-50 px-3 py-1 rounded-full">See all</button>
              </div>
              <div className="space-y-4">
                {leaves?.slice(0, 3).map((leave: any, i: number) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold">
                      {leave.employeeName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 font-medium">{leave.employeeName}</p>
                      <p className="text-sm text-gray-500">submitted leave request</p>
                      <p className="text-xs text-gray-400 mt-0.5">Today</p>
                    </div>
                  </div>
                ))}
                {leaves?.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No recent activities</p>}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Pending approvals</h3>
                <button className="text-xs font-medium text-[#3B00D9] bg-indigo-50 px-3 py-1 rounded-full">See all</button>
              </div>
              <div className="space-y-4">
                {leaves?.filter((l: any) => l.status === 'Pending').slice(0, 3).map((leave: any, i: number) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-bold">
                      {leave.employeeName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 font-medium">{leave.employeeName}</p>
                      <p className="text-sm text-gray-500">Leave Approval Pending</p>
                      <p className="text-xs text-gray-400 mt-0.5">New Request</p>
                    </div>
                  </div>
                ))}
                {leaves?.filter((l: any) => l.status === 'Pending').length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No pending approvals</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-purple-200 border-dashed bg-purple-50/30">
            <button className="w-full py-2.5 bg-purple-100 text-[#3B00D9] font-medium rounded-xl text-sm flex items-center justify-center gap-2 mb-3">
              <span className="text-lg">+</span> Add new employee
            </button>
            <div className="space-y-2">
              <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-600 font-medium rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                 Generate Report
              </button>
              <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-600 font-medium rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                <CheckCircle2 size={16} /> Approve leaves
              </button>
              <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-600 font-medium rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                Process Payroll
              </button>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Calendar</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              <div className="flex gap-2 text-gray-400">
                <button><ChevronLeft size={16}/></button>
                <button><ChevronRight size={16}/></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-gray-500">
              <div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div><div>Su</div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-700">
              {Array(31).fill(0).map((_, i) => (
                <div key={i} className={`p-1 ${i + 1 === new Date().getDate() ? 'bg-[#FF0055] text-white rounded-full' : ''}`}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Notes</h3>
                <button className="text-xs font-medium text-[#3B00D9] bg-indigo-50 px-3 py-1 rounded-full">See all</button>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex gap-3">
                  <div className="mt-1"><div className="w-4 h-4 rounded bg-green-500 flex items-center justify-center text-white"><CheckCircle2 size={12}/></div></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Follow up on interview</p>
                    <p className="text-xs text-gray-500 mt-0.5">Follow an Interview with Adeleke Jahson</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">📅 March, 2026</p>
                  </div>
                </div>
              </div>
              <button className="w-full py-2.5 bg-indigo-50 text-[#3B00D9] font-medium rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors">
                Add new notes
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
