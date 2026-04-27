import { Plus, BookOpen, Users, Award, Clock, Search } from "lucide-react";

const courses = [
  { tag: "Compliance", title: "Workplace Safety & HSE", duration: "4hours", enrolled: 8, completed: 6, total: 8 },
  { tag: "Data Privacy", title: "GDPR Training", duration: "3hours", enrolled: 10, completed: 7, total: 10 },
  { tag: "Customer Service", title: "Effective Communication", duration: "5hours", enrolled: 15, completed: 10, total: 15 },
  { tag: "Conflict Resolution", title: "Dealing with Difficult Customers", duration: "2hours", enrolled: 12, completed: 9, total: 12 },
  { tag: "Time Management", title: "Prioritization Techniques", duration: "4hours", enrolled: 8, completed: 8, total: 8 },
  { tag: "Project Management", title: "Agile Methodologies", duration: "6hours", enrolled: 5, completed: 4, total: 5 },
  { tag: "Diversity & Inclusion", title: "Creating a Welcoming Environment", duration: "3hours", enrolled: 20, completed: 15, total: 20 },
  { tag: "Leadership Skills", title: "Building High-Performance Teams", duration: "5hours", enrolled: 6, completed: 5, total: 6 },
  { tag: "Digital Marketing", title: "SEO Best Practices", duration: "4hours", enrolled: 18, completed: 13, total: 18 },
  { tag: "Financial Literacy", title: "Budgeting Basics", duration: "3hours", enrolled: 9, completed: 7, total: 9 },
  { tag: "Emotional Intelligence", title: "Understanding Yourself and Others", duration: "2hours", enrolled: 11, completed: 10, total: 11 },
  { tag: "Sales Techniques", title: "Negotiation Skills", duration: "5hours", enrolled: 7, completed: 5, total: 7 }
];

const Training = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Training Management</h2>
          <p className="text-sm text-gray-500">Manage employee training and development programs</p>
        </div>
        <button className="bg-purple-50 text-[#3B00D9] px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-purple-100 transition-colors shadow-sm">
          <Plus size={16} /> Add course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3 text-indigo-500">
            <div className="p-2 bg-indigo-50 rounded-lg"><BookOpen size={18} /></div>
            <span className="text-sm font-medium text-gray-600">Active courses</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">3</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3 text-emerald-500">
            <div className="p-2 bg-emerald-50 rounded-lg"><Users size={18} /></div>
            <span className="text-sm font-medium text-gray-600">Enrolled</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">18</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3 text-emerald-500">
            <div className="p-2 bg-emerald-50 rounded-lg"><Award size={18} /></div>
            <span className="text-sm font-medium text-gray-600">Completed</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">7</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3 text-rose-500">
            <div className="p-2 bg-rose-50 rounded-lg"><Clock size={18} /></div>
            <span className="text-sm font-medium text-gray-600">Expiring soon</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">2</h3>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <h3 className="text-lg font-semibold text-gray-800">All courses</h3>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search courses.." 
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                {course.tag}
              </span>
              <span className="text-[11px] text-gray-500">{course.duration}</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-6 text-sm">{course.title}</h4>
            
            <div className="flex items-end justify-between text-xs text-gray-500 mb-2">
              <span>{course.enrolled} enrolled</span>
              <span>{course.completed}/{course.total} completed</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div 
                className="bg-[#3B00D9] h-1.5 rounded-full" 
                style={{ width: `${(course.completed / course.total) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Training;
