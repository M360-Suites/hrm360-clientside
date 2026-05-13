import { Plus, Building2, Users, Clock, CheckCircle2 } from "lucide-react";

const positions = [
  { title: "Finance Analyst", platform: "LinkedIn", posted: "2026-01-28", applicants: 8, interviewing: 2 },
  { title: "Marketing Coordinator", platform: "Indeed", posted: "2026-01-29", applicants: 15, interviewing: 5 },
  { title: "Software Engineer", platform: "Glassdoor", posted: "2026-01-30", applicants: 20, interviewing: 3 },
  { title: "Product Manager", platform: "Remote.co", posted: "2026-01-31", applicants: 10, interviewing: 4 },
  { title: "UX Designer", platform: "Workable", posted: "2026-02-01", applicants: 12, interviewing: 6 },
  { title: "Data Scientist", platform: "LinkedIn", posted: "2026-02-02", applicants: 9, interviewing: 2 }
];

const Recruitment = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Recruitment</h2>
          <p className="text-sm text-gray-500">Track job openings and applicant pipeline</p>
        </div>
        <button className="bg-purple-50 text-[#3B00D9] px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-purple-100 transition-colors shadow-xs">
          <Plus size={16} /> Post jobs
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl"><Building2 size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-600">Open Positions</p>
            <h3 className="text-2xl font-bold text-gray-900">3</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl"><Users size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Applicants</p>
            <h3 className="text-2xl font-bold text-gray-900">18</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl"><Clock size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-600">In Review</p>
            <h3 className="text-2xl font-bold text-gray-900">7</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl"><CheckCircle2 size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-600">Hired This Month</p>
            <h3 className="text-2xl font-bold text-gray-900">2</h3>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Open positions</h3>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden divide-y divide-gray-100">
          {positions.map((job, idx) => (
            <div key={idx} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{job.title}</h4>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center text-white font-bold text-[10px]">in</div>
                  {job.platform} - Posted {job.posted}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-800">{job.applicants} applicants</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-50 text-pink-600 mt-1">
                    {job.interviewing} interviewing
                  </span>
                </div>
                <button className="bg-[#4D82F3] hover:bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-xs">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Recruitment;
