import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
	LayoutDashboard,
	Users,
	Clock,
	CalendarOff,
	Banknote,
	UserPlus,
	GraduationCap,
	// TrendingUp,
	// LineChart,
	// Wallet,
	// CheckCircle2,
	Megaphone,
	// FileText,
	X,
} from "lucide-react";
import { useOrgStore } from "../store/useOrgStore";
import { useAuthStore } from "../store/useAuthStore";

const navItems = [
	{ icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
	{ icon: Users, label: "Employees", path: "/employees" },
	{ icon: Clock, label: "Attendance", path: "/attendance" },
	{ icon: CalendarOff, label: "Leave", path: "/leave" },
	{ icon: Banknote, label: "Payroll", path: "/payroll" },
	{ icon: UserPlus, label: "Recruitment", path: "/recruitment" },
	{ icon: GraduationCap, label: "Training", path: "/training" },
	// { icon: TrendingUp, label: "Promotion", path: "/promotion" },
	// { icon: LineChart, label: "Performance", path: "/performance" },
	// { icon: Wallet, label: "Loans", path: "/loans" },
	// { icon: CheckCircle2, label: "Confirmation", path: "/confirmation" },
	{ icon: Megaphone, label: "Announcement", path: "/announcement" },
	// { icon: FileText, label: "Documents", path: "/documents" },
];

import { getCookie } from "../utils/cookies";

const ORG_COLORS = [
	"bg-orange-500",
	"bg-pink-500",
	"bg-blue-500",
	"bg-emerald-500",
	"bg-purple-500",
	"bg-amber-500",
];

interface SidebarProps {
	isOpen?: boolean;
	onClose?: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
	const location = useLocation();
	const { organizations, fetchOrganizations } = useOrgStore();
	const { isAdmin } = useAuthStore();

	useEffect(() => {
		fetchOrganizations();
	}, [fetchOrganizations]);

	const activeOrgId = getCookie("orgId");
	const userOrganizations = organizations.filter((org) => {
		const orgId = org._id || org.id;
		return orgId === activeOrgId;
	});

	return (
		<aside
			className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col h-full transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
    `}
		>
			<div className='p-6 flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<span className='font-bold text-xl text-[#3B00D9]'>
						Hrm360
					</span>
				</div>
				<button
					onClick={onClose}
					className='lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors'
				>
					<X size={20} />
				</button>
			</div>

			<div className='flex-1 overflow-y-auto px-4 custom-scrollbar pb-6'>
				<nav className='space-y-1 mb-8'>
				{navItems
					.filter((item) => {
						if (isAdmin) return true;
						return [
							"/dashboard",
							"/attendance",
							"/leave",
							"/announcement",
							"/training",
						].includes(item.path);
					})
					.map((item) => {
						const isActive = location.pathname === item.path;
						const Icon = item.icon;
						return (
							<Link
								key={item.path}
								to={item.path}
								onClick={() => {
									if (window.innerWidth < 1024) onClose?.();
								}}
								className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
									isActive
										? "text-white bg-[#3B00D9] font-medium border border-indigo-100 shadow-xs"
										: "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
								}`}
							>
								<Icon
									size={18}
									className={
										isActive ? "text-white" : "text-gray-400"
									}
								/>
								{item.label}
							</Link>
						);
					})}
			</nav>

				<div className='bg-[#3B00D9] rounded-2xl p-4'>
					<p className='text-xs font-semibold text-white mb-3 uppercase tracking-wider'>
						Organizations
					</p>
					<div className='space-y-2'>
						{userOrganizations.map((org, index) => {
							const colorClass =
								ORG_COLORS[index % ORG_COLORS.length];
							const orgId = org._id || org.id;

							return (
								<button
									key={orgId}
									className='flex items-center gap-3 w-full p-2 hover:bg-white rounded-lg transition-colors text-left group'
								>
									<div
										className={`w-6 h-6 rounded-md ${colorClass} flex items-center justify-center shrink-0`}
									>
										<div className='w-2.5 h-2.5 bg-white/30 rounded-xs'></div>
									</div>
									<span className='text-sm text-white truncate group-hover:text-gray-900'>
										{org.name}
									</span>
								</button>
							);
						})}

						{/* <button className="flex items-center gap-2 w-full p-2 mt-2 text-[#3B00D9] hover:bg-indigo-50 rounded-lg transition-colors justify-center">
              <Plus size={16} />
              <span className="text-sm font-medium">Add New Company</span>
            </button> */}
					</div>
				</div>
			</div>
		</aside>
	);
};

export default Sidebar;
