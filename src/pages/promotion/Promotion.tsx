import { TrendingUp, Plus, CheckCircle2, Award, Clock, Star, Search } from "lucide-react";

const promotions = [
  { name: "John Smith", currentRole: "Finance Analyst", newRole: "Senior Finance Analyst", date: "2026-04-05", status: "Approved", performance: "4.8 performance", tenure: "3years in current role" },
  { name: "John Smith", currentRole: "Finance Analyst", newRole: "Senior Finance Analyst", date: "2026-04-05", status: "Pending", performance: "4.8 performance", tenure: "3years in current role" },
  { name: "John Smith", currentRole: "Finance Analyst", newRole: "Senior Finance Analyst", date: "2026-04-05", status: "Under review", performance: "4.8 performance", tenure: "3years in current role" },
  { name: "John Smith", currentRole: "Finance Analyst", newRole: "Senior Finance Analyst", date: "2026-04-05", status: "Under review", performance: "4.8 performance", tenure: "3years in current role" }
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Approved': return 'bg-emerald-50 text-emerald-600';
    case 'Pending': return 'bg-amber-50 text-amber-600';
    case 'Under review': return 'bg-pink-50 text-pink-600';
    default: return 'bg-gray-50 text-gray-600';
  }
};

const Promotion = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Promotions</h2>
          <p className="text-sm text-gray-500">Track and manage employee career progression</p>
        </div>
        <button className="bg-purple-50 text-[#3B00D9] px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-purple-100 transition-colors shadow-sm">
          <Plus size={16} /> New Promotion
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-2 bg-indigo-50 text-indigo-500 rounded-full"><TrendingUp size={20} /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Promotions</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">3</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-2 bg-emerald-50 text-emerald-500 rounded-full"><CheckCircle2 size={20} /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Approved</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">1</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-2 bg-emerald-50 text-emerald-500 rounded-full"><Award size={20} /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Pending</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">1</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-2 bg-rose-50 text-rose-500 rounded-full"><Clock size={20} /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Under review</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">1</h3>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 border-b border-gray-200 pb-4">
        <div className="flex gap-6 text-sm font-medium">
          <button className="text-[#3B00D9] border-b-2 border-[#3B00D9] pb-4 -mb-[17px]">All</button>
          <button className="text-gray-500 hover:text-gray-800 transition-colors pb-4 -mb-[17px]">Approved</button>
          <button className="text-gray-500 hover:text-gray-800 transition-colors pb-4 -mb-[17px]">Under review</button>
          <button className="text-gray-500 hover:text-gray-800 transition-colors pb-4 -mb-[17px]">Pending</button>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search courses.." 
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <div className="lg:col-span-2 space-y-4">
          {promotions.map((promo, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <img src={`https://i.pravatar.cc/150?img=${idx + 15}`} alt="avatar" className="w-12 h-12 rounded-full" />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg mb-1">{promo.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <span>{promo.currentRole}</span>
                      <TrendingUp size={14} className="text-green-500" />
                      <span className="font-medium text-green-600">{promo.newRole}</span>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5"><Star size={14} className="text-yellow-400 fill-yellow-400" /> {promo.performance}</span>
                      <span>{promo.tenure}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(promo.status)}`}>
                    {promo.status}
                  </span>
                  <span className="text-xs text-gray-400">{promo.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center justify-center text-center h-80 sticky top-6">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4">
            <TrendingUp size={20} />
          </div>
          <h4 className="font-semibold text-[#3B00D9] mb-2">Select a record</h4>
          <p className="text-sm text-gray-500">Click on a promotion to view details.</p>
        </div>
      </div>
    </div>
  );
};

export default Promotion;
