import { Plus, BookOpen, Users, Award, Clock, Search, X, Loader2, Calendar, ChevronRight } from "lucide-react";
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
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#4A1D96]">Development</p>
          <h2 className="text-2xl font-semibold text-gray-900">Training Management</h2>
          <p className="mt-1 text-sm text-gray-500">Manage employee training and development programs.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAddModal(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4A1D96] px-5 py-3 text-sm font-semibold text-white">
            <Plus size={17} />Add Course
          </button>
        )}
      
