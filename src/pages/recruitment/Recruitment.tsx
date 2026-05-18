import { Plus, Building2, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRecruitmentStore } from "../../store/useRecruitmentStore";


const Recruitment = () => {
  const { jobs, fetchJobs, postJob, isLoading } = useRecruitmentStore();
  const [showPostModal, setShowPostModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    type: "Full-time",
    salaryRange: "",
    closingDate: "",
    department: "",
    requirements: "",
    responsibilities: ""
  });

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await postJob(formData);
    if (success) {
      setShowPostModal(false);
      setFormData({
        title: "",
        description: "",
        location: "",
        type: "Full-time",
        salaryRange: "",
        closingDate: "",
        department: "",
        requirements: "",
        responsibilities: ""
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Recruitment</h2>
          <p className="text-sm text-gray-500">Track job openings and applicant pipeline</p>
        </div>
        <button 
          onClick={() => setShowPostModal(true)}
          className="w-full sm:w-auto bg-purple-50 text-[#3B00D9] px-4 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-purple-100 transition-colors shadow-xs"
        >
          <Plus size={16} /> Post jobs
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl"><Building2 size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-600">Open Positions</p>
            <h3 className="text-2xl font-bold text-gray-900">{jobs.length}</h3>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Open positions</h3>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden divide-y divide-gray-100">
          {jobs.length > 0 ? jobs.map((job, idx) => (
            <div key={job._id || idx} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{job.title}</h4>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                  <span className="font-medium text-[#3B00D9] bg-indigo-50 px-2 py-0.5 rounded">{job.department}</span>
                  • {job.location} • {job.type}
                  {job.createdAt && ` • Posted ${new Date(job.createdAt).toLocaleDateString()}`}
                </div>
              </div>
              <div className="flex items-center gap-6 self-start sm:self-auto">
                <div className="text-left sm:text-center">
                  <p className="text-sm font-medium text-gray-800">{job.applicants || 0} applicants</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-50 text-pink-600 mt-1">
                    {job.interviewing || 0} interviewing
                  </span>
                </div>
                <button className="bg-[#4D82F3] hover:bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-xs">
                  View
                </button>
              </div>
            </div>
          )) : (
            <div className="p-10 text-center text-gray-500 text-sm italic">
              No jobs posted yet.
            </div>
          )}
        </div>
      </div>

      {/* Post Job Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 relative my-8">
            <button onClick={() => setShowPostModal(false)} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Post a New Job</h3>
            
            <form onSubmit={handlePostJob} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Job Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm" placeholder="e.g. Senior Frontend Engineer" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                  <input required type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm" placeholder="e.g. Engineering" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                  <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm" placeholder="e.g. Remote, New York" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Job Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm bg-white">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Salary Range</label>
                  <input required type="text" value={formData.salaryRange} onChange={e => setFormData({...formData, salaryRange: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm" placeholder="e.g. $80,000 - $120,000" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Closing Date</label>
                  <input required type="date" value={formData.closingDate} onChange={e => setFormData({...formData, closingDate: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Job Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm resize-none" placeholder="Brief overview of the role..." />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Requirements</label>
                <textarea required value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm resize-none" placeholder="List of requirements..." />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Responsibilities</label>
                <textarea required value={formData.responsibilities} onChange={e => setFormData({...formData, responsibilities: e.target.value})} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm resize-none" placeholder="List of responsibilities..." />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowPostModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="px-5 py-2.5 rounded-xl text-sm font-medium bg-[#3B00D9] text-white hover:bg-[#3500c0] transition-colors disabled:opacity-70 flex items-center gap-2">
                  {isLoading && <Loader2 className="animate-spin" size={16} />}
                  Post Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recruitment;
