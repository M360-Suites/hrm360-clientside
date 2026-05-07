import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Tag, Layout, Image as ImageIcon, Loader2 } from "lucide-react";
import { useOrgStore } from "../../store/useOrgStore";
import { useAuthStore } from "../../store/useAuthStore";

const Onboarding = () => {
  const [formData, setFormData] = useState({
    name: "",
    subtext: "",
    tagline: "",
    image: "",
  });
  const { createOrg, isLoading, error } = useOrgStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createOrg({
      ...formData,
      createdBy: user?.id || user?._id, 
      stats: [
        { label: "Employees", value: "0", icon: "users" },
        { label: "Departments", value: "0", icon: "briefcase" },
        { label: "Projects", value: "0", icon: "clipboard" }
      ],
    });
    
    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-12">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-indigo-50 text-[#3B00D9] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building2 size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Setup your Organization</h2>
        <p className="text-gray-500">Create your workspace to start managing your employees</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
            <Building2 size={16} className="text-gray-400" /> Organization Name
          </label>
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="e.g. BTech 360 Solutions" 
            required
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
            <Layout size={16} className="text-gray-400" /> Industry/Subtext
          </label>
          <input 
            type="text" 
            value={formData.subtext}
            onChange={(e) => setFormData({...formData, subtext: e.target.value})}
            placeholder="e.g. Technology & Innovation" 
            required
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
            <Tag size={16} className="text-gray-400" /> Tagline
          </label>
          <input 
            type="text" 
            value={formData.tagline}
            onChange={(e) => setFormData({...formData, tagline: e.target.value})}
            placeholder="e.g. Powering the future of HR" 
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
            <ImageIcon size={16} className="text-gray-400" /> Logo URL (Optional)
          </label>
          <input 
            type="url" 
            value={formData.image}
            onChange={(e) => setFormData({...formData, image: e.target.value})}
            placeholder="https://example.com/logo.png" 
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] transition-all text-sm"
          />
        </div>

        <button 
          disabled={isLoading}
          className="w-full py-4 bg-[#3B00D9] hover:bg-[#3500c0] text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
        >
          {isLoading && <Loader2 className="animate-spin" size={18} />}
          Create Organization
        </button>
      </form>
    </div>
  );
};

export default Onboarding;
