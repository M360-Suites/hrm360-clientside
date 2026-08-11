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
	TrendingUp,
	BadgeCheck,
	ClipboardCheck,
	LineChart,
	// Wallet,
	// CheckCircle2,
	Megaphone,
	Settings,
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
	{ icon: BadgeCheck, label: "Permissions", path: "/permissions" },
	{ icon: TrendingUp, label: "Promotions", path: "/promotion" },
	{ icon: ClipboardCheck, label: "Probation", path: "/probation" },
	{ icon: LineChart, label: "Task Manager", path: "/task-manager" },
	// { icon: Wallet, label: "Loans", path: "/loans" },
	// { icon: CheckCircle2, label: "Confirmation", path: "/confirmation" },
	{ icon: Megaphone, label: "Announcement", path: "/announcement" },
	{ icon: Settings, label: "Settings", path: "/settings" },
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
	const { isAdmin, user } = useAuthStore();
	const role = String(user?.role || "").trim().toLowerCase();
	const canManageProbation =
		isAdmin ||
		["hr", "hr_staff", "human resources", "admin", "owner", "super_admin"].includes(role);

	useEffect(() => {
		fetchOrganizations();
	}, [fetchOrganizations]);

	const activeOrgId = getCookie("orgId");
	const userOrganizations = organizations.filter((org) => {
		const nestedOrg = org.organization || org.org || org;
		const orgId = nestedOrg._id || nestedOrg.id || org._id || org.id;
		return orgId === activeOrgId;
	});

	return (
		<aside
			className={`
      fixed inset-y-0 left-0 z-50 h-[100dvh] w-[min(18rem,86vw)] bg-[#4A1D96] border-r border-[#3d177d] flex flex-col transition-transform duration-300 ease-in-out lg:static lg:w-64 lg:translate-x-0
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
    `}
		>
			<div className='p-6 flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<span className='font-bold text-xl text-white tracking-wide'>
						HRM<span className="text-[#E91EFA]">360</span>
					</span>
					<span className="w-2 h-2 rounded-full bg-[#E91EFA] animate-pulse"></span>
				</div>
				<button
					onClick={onClose}
					className='lg:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors'
				>
					<X size={20} />
				</button>
			</div>

			<div className='flex-1 overflow-y-auto px-4 custom-scrollbar pb-6'>
				<nav className='space-y-1 mb-8'>
					{navItems
						.filter((item) => {
							if (item.path === "/probation") return canManageProbation;
							if (isAdmin) return true;
							return [
								"/dashboard",
								"/attendance",
								"/leave",
								"/announcement",
								"/training",
								"/task-manager",
								"/permissions",
								"/promotion",
								"/settings",
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
									className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
										isActive
											? "text-white bg-[#8B5CF6] font-medium shadow-md shadow-[#8B5CF6]/30"
											: "text-white/80 hover:bg-[#8B5CF6]/40 hover:text-white"
									}`}
								>
									<Icon
										size={18}
										className={
											isActive ? "text-white" : "text-white/70"
										}
									/>
									{item.label}
								</Link>
							);
						})}
				</nav>

				<div className='bg-white/10 rounded-2xl p-4 border border-white/10'>
					<p className='text-xs font-semibold text-white/70 mb-3 uppercase tracking-wider'>
						Organization
					</p>
					<div className='space-y-2'>
						{userOrganizations.map((org, index) => {
							const nestedOrg = org.organization || org.org || org;
							const colorClass =
								ORG_COLORS[index % ORG_COLORS.length];
							const orgId =
								nestedOrg._id || nestedOrg.id || org._id || org.id;
							const orgName =
								nestedOrg.name || org.name || "Organization";

							return (
								<button
									key={orgId}
									className='flex items-center gap-3 w-full p-2 hover:bg-white/10 rounded-lg transition-colors text-left group'
								>
									<div
										className={`w-6 h-6 rounded-md ${colorClass} flex items-center justify-center shrink-0`}
									>
										<div className='w-2.5 h-2.5 bg-white/30 rounded-xs'></div>
									</div>
									<span className='text-sm text-white/90 truncate group-hover:text-white'>
										{orgName}
									</span>
								</button>
							);
						})}
					</div>
				</div>
			</div>
		</aside>
	);
};

export default Sidebar;
