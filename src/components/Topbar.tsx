import { Bell, User } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const Topbar = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  
  const title = location.pathname.split('/')[1] || "Dashboard";
  const formattedTitle = title.charAt(0).toUpperCase() + title.slice(1).replace(/-/g, ' ');

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
      <h1 className="text-xl font-bold text-gray-900">{formattedTitle}</h1>
      
      <div className="flex items-center gap-6">
        <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all relative">
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 leading-tight">{user?.name || "User"}</p>
            <p className="text-[10px] font-bold text-[#3B00D9] uppercase tracking-wider">{user?.role || "Administrator"}</p>
          </div>
          
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#3B00D9] overflow-hidden shadow-sm shadow-indigo-500/5 hover:scale-105 transition-transform cursor-pointer">
            {user?.image ? (
              <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User size={20} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
