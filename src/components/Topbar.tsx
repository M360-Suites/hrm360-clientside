import { useState, useRef, useEffect } from "react";
import { Bell, User, LogOut, ChevronDown, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

interface TopbarProps {
  onMenuClick?: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const title = location.pathname.split('/')[1] || "Dashboard";
  const formattedTitle = title.charAt(0).toUpperCase() + title.slice(1).replace(/-/g, ' ');

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 shrink-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate max-w-[150px] sm:max-w-none">
          {formattedTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <button className="hidden sm:flex w-10 h-10 rounded-xl border border-gray-200 items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all relative">
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white"></span>
        </button>

        {/* User menu */}
        <div className="relative sm:pl-6 sm:border-l border-gray-100" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-900 leading-tight">{user?.name || "User"}</p>
              <p className="text-[10px] font-bold text-[#3B00D9] uppercase tracking-wider">{user?.role || "Administrator"}</p>
            </div>
            <div className="w-9 h-9 sm:w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#3B00D9] overflow-hidden shadow-sm shadow-indigo-500/5">
              {user?.image
                ? <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                : <User size={18} className="sm:size-5" />
              }
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-black/5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-xs font-bold text-gray-900 truncate">{user?.name || "User"}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email || ""}</p>
              </div>
              <div className="p-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;

