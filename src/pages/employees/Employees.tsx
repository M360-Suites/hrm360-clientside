import { useState, useEffect } from "react";
import { Search, Plus, MoreVertical, X, ChevronDown, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useEmployeeStore } from "../../store/useEmployeeStore";

type Toast = { type: 'success' | 'error'; message: string };

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmployee = (data: { name: string; email: string; role: string }) => {
  const errors: Record<string, string> = {};
  if (!data.name.trim()) errors.name = "Name is required.";
  else if (data.name.trim().length < 2) errors.name = "Name must be at least 2 characters.";
  if (!data.email.trim()) errors.email = "Email is required.";
  else if (!emailRegex.test(data.email)) errors.email = "Please enter a valid email address.";
  if (!data.role.trim()) errors.role = "Role / Job title is required.";
  return errors;
};

const Employees = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { employees, isLoading, fetchEmployees, createEmployee, updateEmployee, deleteEmployee } = useEmployeeStore();

  const showToast = (type: Toast['type'], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const [formData, setFormData] = useState({ name: "", email: "", role: "" });

  const updateField = (field: string, value: string) => {
    setFormData(p => ({ ...p, [field]: value }));
    setFormErrors(p => ({ ...p, [field]: "" }));
  };

  const fieldCls = (field: string) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
      formErrors[field]
        ? "border-rose-400 focus:ring-rose-200 focus:border-rose-400"
        : "border-gray-200 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9]"
    }`;

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateEmployee(formData);
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setFormErrors({});
    try {
      await createEmployee({
        ...formData,
        status: "Active",
        basicSalary: 0,
        allowances: 0,
        deductions: 0,
        joinedAt: new Date().toISOString(),
      });
      const err = useEmployeeStore.getState().error;
      if (err) {
        showToast('error', `Failed to add employee: ${err}`);
      } else {
        showToast('success', 'Employee added successfully!');
        setIsModalOpen(false);
        setFormData({ name: "", email: "", role: "" });
      }
    } catch {
      showToast('error', 'An unexpected error occurred.');
    }
  };

  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    try {
      await updateEmployee(selectedEmployee._id || selectedEmployee.id, {
        ...formData,
        status: selectedEmployee.status || "Active",
        basicSalary: selectedEmployee.basicSalary || 0,
        allowances: selectedEmployee.allowances || 0,
        deductions: selectedEmployee.deductions || 0,
        joinedAt: selectedEmployee.joinedAt || new Date().toISOString(),
      });
      const err = useEmployeeStore.getState().error;
      if (err) {
        showToast('error', `Update failed: ${err}`);
      } else {
        showToast('success', 'Employee updated successfully!');
        setIsEditModalOpen(false);
        setSelectedEmployee(null);
        setFormData({ name: "", email: "", role: "" });
      }
    } catch {
      showToast('error', 'An unexpected error occurred.');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await deleteEmployee(id);
        const err = useEmployeeStore.getState().error;
        if (err) {
          showToast('error', `Delete failed: ${err}`);
        } else {
          showToast('success', 'Employee deleted successfully!');
        }
      } catch {
        showToast('error', 'An unexpected error occurred.');
      }
    }
    setActiveMenu(null);
  };

  const openEditModal = (emp: any) => {
    setSelectedEmployee(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      role: emp.role,
    });
    setIsEditModalOpen(true);
    setActiveMenu(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all ${
          toast.type === 'success'
            ? 'bg-emerald-600 text-white'
            : 'bg-rose-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Employee Directory</h2>
          <p className="text-sm text-gray-500">Manage employees across your organization</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ name: "", email: "", role: "" });
            setIsModalOpen(true);
          }}
          className="bg-[#3B00D9] text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-[#3500c0] transition-all shadow-sm"
        >
          <Plus size={16} /> Add new employee
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 text-sm">
           <div className="flex gap-4">
              <button className="font-medium text-[#3B00D9] border-b-2 border-[#3B00D9] pb-4 px-2">All Employees</button>
              <button className="font-medium text-gray-500 pb-4 px-2 hover:text-gray-700">Teams</button>
              <button className="font-medium text-gray-500 pb-4 px-2 hover:text-gray-700">Departments</button>
           </div>
        </div>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search employee" 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 text-sm font-medium text-gray-600 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              Filter
            </button>
            <button className="flex items-center gap-2 text-sm font-medium text-gray-600 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px] relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
              <Loader2 className="animate-spin text-[#3B00D9]" size={32} />
            </div>
          )}
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="bg-gray-50/50 text-gray-800 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Organization</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date joined</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees?.map((emp: any, idx: number) => (
                <tr key={emp._id || emp.id || idx} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-[#3B00D9] font-bold">
                        {emp.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{emp.role}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-[#3B00D9]">
                      {typeof emp.orgId === 'object' ? emp.orgId.name : (emp.orgId || "N/A")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                      emp.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${emp.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{new Date(emp.joinedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === emp._id ? null : emp._id)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    {activeMenu === emp._id && (
                      <div className="absolute right-6 top-12 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <button 
                          onClick={() => openEditModal(emp)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Edit Profile
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          View Payroll
                        </button>
                        <div className="h-px bg-gray-100 my-1"></div>
                        <button 
                          onClick={() => handleDeleteEmployee(emp._id || emp.id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Delete Employee
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {employees?.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                       <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                          <Plus size={32} />
                       </div>
                       <p className="text-gray-900 font-medium">No employees found</p>
                       <p className="text-gray-500 text-sm mt-1">Start by adding your first employee to the organization</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Add Employee</h3>
                  <p className="text-sm text-gray-500 mt-1">Setup a new member in your team</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <form className="space-y-5" onSubmit={handleAddEmployee} noValidate>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="e.g. Adebayo Johnson"
                    className={fieldCls("name") + " px-4 py-3.5"}
                  />
                  {formErrors.name && <p className="mt-1.5 text-xs text-rose-500 font-medium">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="e.g. adebayo@company.com"
                    className={fieldCls("email") + " px-4 py-3.5"}
                  />
                  {formErrors.email && <p className="mt-1.5 text-xs text-rose-500 font-medium">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => updateField("role", e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className={fieldCls("role") + " px-4 py-3.5"}
                  />
                  {formErrors.role && <p className="mt-1.5 text-xs text-rose-500 font-medium">{formErrors.role}</p>}
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); setFormErrors({}); }}
                    className="flex-1 py-3.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3.5 bg-[#3B00D9] hover:bg-[#3500c0] text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isLoading && <Loader2 className="animate-spin" size={16} />}
                    Add Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Edit Employee</h3>
                  <p className="text-sm text-gray-500 mt-1">Update employee information</p>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <form className="space-y-5" onSubmit={handleEditEmployee} noValidate>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="e.g. Adebayo Johnson"
                    className={fieldCls("name") + " px-4 py-3.5"}
                  />
                  {formErrors.name && <p className="mt-1.5 text-xs text-rose-500 font-medium">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="e.g. adebayo@company.com"
                    className={fieldCls("email") + " px-4 py-3.5"}
                  />
                  {formErrors.email && <p className="mt-1.5 text-xs text-rose-500 font-medium">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => updateField("role", e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className={fieldCls("role") + " px-4 py-3.5"}
                  />
                  {formErrors.role && <p className="mt-1.5 text-xs text-rose-500 font-medium">{formErrors.role}</p>}
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-3.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3.5 bg-[#3B00D9] hover:bg-[#3500c0] text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Update Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
