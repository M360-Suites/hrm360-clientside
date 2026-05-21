import { Plus, BookOpen, Users, Award, Clock, Search, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useTrainingStore } from "../../store/useTrainingStore";
import { useAuthStore } from "../../store/useAuthStore";

const Training = () => {
  const { isAdmin } = useAuthStore();
  const {
    courses,
    stats,
    employeeStats,
    courseDetails,
    fetchCourses,
    fetchStats,
    fetchEmployeeStats,
    fetchCourseDetails,
    addCourse,
    enrollInCourse,
    isLoading,
    error,
  } = useTrainingStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    instructor: "",
    duration: "",
    endDate: "",
    maxCapacity: 0,
    description: "",
    courseType: "internal",
    modules: []
  });

  useEffect(() => {
    fetchCourses();
    if (isAdmin) {
      fetchStats();
      return;
    }
    fetchEmployeeStats();
  }, [isAdmin, fetchCourses, fetchStats, fetchEmployeeStats]);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addCourse(formData);
    if (success) {
      setShowAddModal(false);
      setFormData({
        title: "",
        category: "",
        instructor: "",
        duration: "",
        endDate: "",
        maxCapacity: 0,
        description: "",
        courseType: "internal",
        modules: []
      });
    }
  };

  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.category.toLowerCase().includes(searchQuery.toLowerCase()));
  const trainingStats = isAdmin ? stats : employeeStats;

  const openCourseDetails = async (id: string) => {
    await fetchCourseDetails(id);
    setShowDetailsModal(true);
  };

  const handleEnroll = async (id: string) => {
    const success = await enrollInCourse(id);
    if (success) {
      await fetchCourseDetails(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Training Management</h2>
          <p className="text-sm text-gray-500">Manage employee training and development programs</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto bg-purple-50 text-[#3B00D9] px-4 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-purple-100 transition-colors shadow-xs">
            <Plus size={16} /> Add course
          </button>
        )}
      </div>

      {trainingStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center gap-3 mb-3 text-indigo-500">
              <div className="p-2 bg-indigo-50 rounded-lg"><BookOpen size={18} /></div>
              <span className="text-sm font-medium text-gray-600">Active courses</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{trainingStats.activeCourses || trainingStats.courses || courses.length || 0}</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center gap-3 mb-3 text-emerald-500">
              <div className="p-2 bg-emerald-50 rounded-lg"><Users size={18} /></div>
              <span className="text-sm font-medium text-gray-600">Enrolled</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{trainingStats.totalEnrolled || trainingStats.enrolled || 0}</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center gap-3 mb-3 text-emerald-500">
              <div className="p-2 bg-emerald-50 rounded-lg"><Award size={18} /></div>
              <span className="text-sm font-medium text-gray-600">Completed</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{trainingStats.totalCompleted || trainingStats.completed || 0}</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center gap-3 mb-3 text-rose-500">
              <div className="p-2 bg-rose-50 rounded-lg"><Clock size={18} /></div>
              <span className="text-sm font-medium text-gray-600">Expiring soon</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{trainingStats.expiringSoon || trainingStats.inProgress || 0}</h3>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-8">
        <h3 className="text-lg font-semibold text-gray-800">All courses</h3>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search courses.." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredCourses.length > 0 ? filteredCourses.map((course, idx) => {
          const enrolled = course.enrolled || 0;
          const total = course.maxCapacity || course.total || 1;
          const completed = course.completed || 0;
          
          return (
          <div
            key={course._id || idx}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                {course.category || course.tag}
              </span>
              <span className="text-[11px] text-gray-500">{course.duration}</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-6 text-sm">{course.title}</h4>
            
            <div className="flex items-end justify-between text-xs text-gray-500 mb-2">
              <span>{enrolled} enrolled</span>
              <span>{completed}/{total} completed</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div 
                className="bg-[#3B00D9] h-1.5 rounded-full" 
                style={{ width: `${Math.min((completed / total) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => openCourseDetails(course._id)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                View details
              </button>
              {!isAdmin && (
                <button
                  type="button"
                  onClick={() => handleEnroll(course._id)}
                  className="w-full px-3 py-2 rounded-lg bg-[#3B00D9] text-white text-xs font-medium hover:bg-[#3500c0]"
                >
                  Enroll
                </button>
              )}
            </div>
          </div>
        )}) : (
          <div className="col-span-full p-10 text-center text-gray-500 text-sm italic">
            No courses found.
          </div>
        )}
      </div>

      {/* Add Course Modal */}
      {showAddModal && isAdmin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-2xl h-[92vh] sm:h-auto sm:max-h-[92vh] flex flex-col">
            <div className="p-5 sm:p-6 border-b border-gray-100 relative shrink-0">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
              <h3 className="text-xl font-bold text-gray-900 pr-8">Add Training Course</h3>
            </div>

            <form onSubmit={handleAddCourse} className="flex-1 min-h-0 flex flex-col">
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Course Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm" placeholder="e.g. Compliance" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Instructor</label>
                  <input required type="text" value={formData.instructor} onChange={e => setFormData({...formData, instructor: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
                  <input required type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm" placeholder="e.g. 4 hours" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                  <input required type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Max Capacity</label>
                  <input required type="number" min="1" value={formData.maxCapacity || ""} onChange={e => setFormData({...formData, maxCapacity: parseInt(e.target.value) || 0})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Course Type</label>
                  <select value={formData.courseType} onChange={e => setFormData({...formData, courseType: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm bg-white">
                    <option value="internal">Internal</option>
                    <option value="external">External</option>
                  </select>
                </div>
              </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm resize-none" placeholder="Course overview..." />
                </div>
              </div>

              <div className="p-5 sm:p-6 border-t border-gray-100 shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 bg-white">
                <button type="button" onClick={() => setShowAddModal(false)} className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors border border-gray-200 sm:border-0">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-medium bg-[#3B00D9] text-white hover:bg-[#3500c0] transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                  {isLoading && <Loader2 className="animate-spin" size={16} />}
                  Add Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && courseDetails && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-xl h-[82vh] sm:h-auto sm:max-h-[88vh] flex flex-col">
            <div className="p-5 sm:p-6 border-b border-gray-100 relative shrink-0">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
              <h3 className="text-xl font-bold text-gray-900 pr-8">Course Details</h3>
              <p className="text-sm text-gray-500 mt-1">{courseDetails.title}</p>
            </div>

            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <p><span className="text-gray-500">Category:</span> {courseDetails.category}</p>
                <p><span className="text-gray-500">Instructor:</span> {courseDetails.instructor}</p>
                <p><span className="text-gray-500">Duration:</span> {courseDetails.duration}</p>
                <p><span className="text-gray-500">End Date:</span> {courseDetails.endDate ? new Date(courseDetails.endDate).toLocaleDateString() : "-"}</p>
                <p><span className="text-gray-500">Type:</span> {courseDetails.courseType}</p>
                <p><span className="text-gray-500">Capacity:</span> {courseDetails.maxCapacity || "-"}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-1.5">Description</h4>
                <p className="text-sm text-gray-600">{courseDetails.description || "-"}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-1.5">Modules</h4>
                {courseDetails.modules?.length ? (
                  <ul className="space-y-2">
                    {courseDetails.modules.map((mod: any, idx: number) => (
                      <li key={idx} className="text-sm text-gray-600 border border-gray-100 rounded-lg px-3 py-2">
                        {mod?.title || `Module ${idx + 1}`} {mod?.duration ? `- ${mod.duration}` : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No modules available.</p>
                )}
              </div>
            </div>

            {!isAdmin && (
              <div className="p-5 sm:p-6 border-t border-gray-100 shrink-0">
                <button
                  type="button"
                  onClick={() => handleEnroll(courseDetails._id)}
                  className="w-full px-4 py-3 rounded-xl bg-[#3B00D9] text-white text-sm font-medium hover:bg-[#3500c0]"
                >
                  Enroll in Course
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Training;
