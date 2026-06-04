import { TrendingUp, CheckCircle2, Award, ChevronDown, Search, Plus, FileEdit } from "lucide-react";

const Performance = () => {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Performance Management</h2>
          <p className="text-sm text-gray-500">Review cycles, goal tracking, and competency evaluation</p>
        </div>
        <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-xs">
          <CalendarIcon size={16} /> Q1 2026 <ChevronDown size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center gap-3 mb-2 text-indigo-500">
            <div className="p-2 bg-indigo-50 rounded-full"><TrendingUp size={16} /></div>
            <span className="text-sm font-medium text-gray-600">Total reviews done</span>
          </div>
          <h3 className="text-3xl font-semibold text-gray-900 mb-2">10</h3>
          <span className="flex items-center text-xs font-medium text-emerald-600 w-fit">
            <TrendingUp size={12} className="mr-1" /> +2.3% vs Q4
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center gap-3 mb-2 text-emerald-500">
            <div className="p-2 bg-emerald-50 rounded-full"><CheckCircle2 size={16} /></div>
            <span className="text-sm font-medium text-gray-600">Goals completion</span>
          </div>
          <h3 className="text-3xl font-semibold text-gray-900 mb-2">10</h3>
          <span className="flex items-center text-xs font-medium text-emerald-600 w-fit">
            <TrendingUp size={12} className="mr-1" /> +2.3% vs Q4
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center gap-3 mb-2 text-rose-500">
            <div className="p-2 bg-rose-50 rounded-full"><Award size={16} /></div>
            <span className="text-sm font-medium text-gray-600">Top Performer</span>
          </div>
          <h3 className="text-3xl font-semibold text-gray-900 mb-2">10</h3>
          <span className="flex items-center text-xs font-medium text-emerald-600 w-fit">
            <TrendingUp size={12} className="mr-1" /> +2.3% vs Q4
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200 border-dashed bg-purple-50/30 flex flex-col justify-center">
          <div className="bg-[#3B00D9] text-white text-sm font-medium text-center py-2 rounded-lg mb-3 shadow-xs">
            Quick Actions
          </div>
          <div className="space-y-2">
            <button className="w-full py-2 bg-purple-50 text-[#3B00D9] font-medium rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-purple-100 transition-colors">
              <Plus size={16} /> Create Goal
            </button>
            <button className="w-full py-2 bg-white border border-gray-200 text-gray-600 font-medium rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
              <FileEdit size={16} /> Start Review
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 border-b border-gray-200 pb-4">
        <div className="flex gap-6 text-sm font-medium">
          <button className="text-gray-800 border-b-2 border-gray-800 pb-4 mb-[-17px]">Overview</button>
          <button className="text-gray-500 hover:text-gray-800 transition-colors pb-4 mb-[-17px]">Goals</button>
          <button className="text-gray-500 hover:text-gray-800 transition-colors pb-4 mb-[-17px]">Reviews & Feedback</button>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs h-80 flex flex-col">
             <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Performance Overview</h3>
              <button className="flex items-center gap-2 text-sm font-medium text-[#3B00D9] bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                Q1 2026 <ChevronDown size={14} />
              </button>
            </div>
            {/* Chart Placeholder */}
            <div className="flex-1 relative border-b border-gray-100">
               <svg className="w-full h-full absolute inset-0 pt-4" preserveAspectRatio="none" viewBox="0 0 100 50">
                  <path d="M0,35 Q10,20 20,40 T40,25 T60,30 T80,45 T100,20" fill="none" stroke="#FF6B00" strokeWidth="1.5" />
                  <path d="M0,35 Q10,20 20,40 T40,25 T60,30 T80,45 T100,20 L100,50 L0,50 Z" fill="url(#gradient2)" stroke="none" opacity="0.1"/>
                  <defs>
                    <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Y Axis Grid lines approx */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-400 pb-6 w-full">
                  <div className="flex items-center w-full border-b border-gray-50 pb-1 pt-2"><span>200</span></div>
                  <div className="flex items-center w-full border-b border-gray-50 pb-1"><span>150</span></div>
                  <div className="flex items-center w-full border-b border-gray-50 pb-1"><span>100</span></div>
                  <div className="flex items-center w-full border-b border-gray-50 pb-1"><span>50</span></div>
                  <div className="flex items-center w-full pb-1"><span>0</span></div>
                </div>
            </div>
            {/* X Axis labels */}
            <div className="flex justify-between px-6 text-[10px] text-gray-400 mt-2">
              <span>12:00</span><span>13:00</span><span>14:00</span><span>15:00</span><span>16:00</span><span>17:00</span><span>18:00</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs h-64">
                <h3 className="font-semibold text-gray-800 mb-2">Recent activities</h3>
                <p className="text-xs text-gray-500 mb-6">Average score by team</p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1 text-gray-700"><span>Finance</span></div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-[#9c88ff] h-2.5 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1 text-gray-700"><span>Operations</span></div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-[#9c88ff] h-2.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1 text-gray-700"><span>IT and Tech</span></div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-[#9c88ff] h-2.5 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                </div>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs h-64 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Top performer</h3>
                  <button className="flex items-center gap-1 text-xs font-medium text-[#3B00D9] bg-indigo-50 px-2 py-1 rounded-lg">
                    Q1 2026 <ChevronDown size={12} />
                  </button>
                </div>
                <div className="flex-1 relative overflow-hidden flex items-end">
                  {/* Tiny chart */}
                  <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 100 50">
                    <path d="M0,50 Q15,45 25,50 T50,40 T75,50 T90,40 T100,50" fill="none" stroke="#FF6B00" strokeWidth="1" />
                  </svg>
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-400 w-full pb-4 pt-2">
                    <div className="flex items-center w-full border-b border-gray-50 pb-1"><span>200</span></div>
                    <div className="flex items-center w-full border-b border-gray-50 pb-1"><span>150</span></div>
                    <div className="flex items-center w-full border-b border-gray-50 pb-1"><span>100</span></div>
                  </div>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 h-fit">
          <h3 className="font-semibold text-gray-800 mb-1">Team Comparison</h3>
          <p className="text-xs text-gray-500 mb-6">Average score by team</p>
          <div className="space-y-6">
             <div>
              <div className="flex justify-between text-sm mb-2 text-gray-700"><span>Finance</span></div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-[#9c88ff] h-3 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2 text-gray-700"><span>Operations</span></div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-[#9c88ff] h-3 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2 text-gray-700"><span>IT and Tech</span></div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-[#9c88ff] h-3 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2 text-gray-700"><span>Marketing</span></div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-[#9c88ff] h-3 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2 text-gray-700"><span>Sales</span></div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-[#9c88ff] h-3 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dummy icon to avoid full lucide import for just one missing one in context
const CalendarIcon = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);

export default Performance;
