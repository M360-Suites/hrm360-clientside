import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useGrievanceStore } from "../../store/useGrievanceStore";
import { TrendingUp, CheckCircle2, Clock, Plus, Loader2 } from "lucide-react";
import { GrievanceCard } from "./components/GrievanceCard";
import { FileGrievanceModal } from "./components/FileGrievanceModal";

export default function Grievances() {
	const { user } = useAuthStore();
	const isAdmin = user?.role === "admin" || user?.role === "hr_staff";
	
	const {
		grievances,
		stats,
		isLoading,
		fetchGrievances,
		fetchUserGrievances,
		fetchOrgStats,
		fetchUserStats,
		fetchCategories
	} = useGrievanceStore();

	const [activeTab, setActiveTab] = useState<"disciplinary" | "grievances">("grievances");
	const [showFileModal, setShowFileModal] = useState(false);

	useEffect(() => {
		fetchCategories();
		if (isAdmin) {
			fetchGrievances();
			fetchOrgStats();
		} else {
			fetchUserGrievances();
			fetchUserStats();
		}
	}, [isAdmin]);

	const StatCard = ({ icon, label, value, tone }: { icon: React.ReactNode, label: string, value: number, tone: "purple" | "emerald" | "amber" }) => {
		const colors = {
			purple: "bg-[#4A1D96]/10 text-[#4A1D96]",
			emerald: "bg-emerald-50 text-emerald-600",
			amber: "bg-amber-50 text-amber-600"
		};
		return (
			<div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col justify-center gap-4">
				<div className={`w-10 h-10 rounded-full flex items-center justify-center ${colors[tone]}`}>
					{icon}
				</div>
				<div>
					<p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
					<p className="text-2xl font-bold text-gray-900">{value}</p>
				</div>
			</div>
		);
	};

	return (
		<div className="p-6 max-w-7xl mx-auto pb-24">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">{isAdmin ? "Grievances" : "My Grievances"}</h1>
					<p className="text-gray-500 text-sm mt-1">Manage misconducts in work place</p>
				</div>
				<button 
					onClick={() => setShowFileModal(true)}
					className="bg-[#4A1D96]/5 hover:bg-[#4A1D96]/10 text-[#4A1D96] font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors text-sm"
				>
					<Plus size={16} />
					File a case
				</button>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
				<StatCard 
					icon={<TrendingUp size={20} />} 
					label="Active disciplines" 
					value={isAdmin ? stats?.inProgress || 0 : stats?.inProgress || 0} 
					tone="purple" 
				/>
				<StatCard 
					icon={<CheckCircle2 size={20} />} 
					label="Total grievances" 
					value={isAdmin ? stats?.total || 0 : stats?.total || 0} 
					tone="emerald" 
				/>
				<StatCard 
					icon={<Clock size={20} />} 
					label="Resolved grievances" 
					value={isAdmin ? stats?.resolved || 0 : stats?.resolved || 0} 
					tone="amber" 
				/>
				<StatCard 
					icon={<CheckCircle2 size={20} />} 
					label="Resolved disciplines" 
					value={0} // Mocked as per API ambiguity
					tone="emerald" 
				/>
			</div>

			{/* Tabs */}
			<div className="flex border-b border-gray-200 mb-6">
				<button 
					onClick={() => setActiveTab("disciplinary")}
					className={`flex-1 text-center py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "disciplinary" ? "border-[#4A1D96] text-[#4A1D96]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
				>
					Disciplinary
				</button>
				<button 
					onClick={() => setActiveTab("grievances")}
					className={`flex-1 text-center py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "grievances" ? "border-[#4A1D96] text-[#4A1D96]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
				>
					Grievances
				</button>
			</div>

			{/* Content */}
			{activeTab === "disciplinary" ? (
				<div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-2xl border border-gray-100 p-8 text-center">
					<div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
						<TrendingUp size={32} />
					</div>
					<h3 className="text-gray-900 font-semibold mb-1">No Disciplinary Records</h3>
					<p className="text-gray-500 text-sm max-w-sm">There are currently no disciplinary records to display in this view.</p>
				</div>
			) : (
				<div className="space-y-4">
					{isLoading ? (
						<div className="flex items-center justify-center min-h-[300px]">
							<Loader2 className="w-8 h-8 animate-spin text-[#4A1D96]" />
						</div>
					) : grievances.length > 0 ? (
						grievances.map((grievance, index) => (
							<GrievanceCard key={grievance._id || index} grievance={grievance} />
						))
					) : (
						<div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-2xl border border-gray-100 p-8 text-center">
							<div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
								<CheckCircle2 size={32} />
							</div>
							<h3 className="text-gray-900 font-semibold mb-1">No Grievances</h3>
							<p className="text-gray-500 text-sm max-w-sm">There are no grievances matching the current filters.</p>
						</div>
					)}
				</div>
			)}

			{showFileModal && (
				<FileGrievanceModal onClose={() => setShowFileModal(false)} />
			)}
		</div>
	);
}
