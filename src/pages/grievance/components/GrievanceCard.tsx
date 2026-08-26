import type { Grievance } from "../../../store/useGrievanceStore";

export const GrievanceCard = ({ grievance }: { grievance: Grievance }) => {
	
	const getIntensityColors = (intensity: string) => {
		switch(intensity?.toLowerCase()) {
			case 'high': return 'bg-red-50 text-red-600';
			case 'medium': return 'bg-amber-50 text-amber-600';
			case 'low': return 'bg-emerald-50 text-emerald-600';
			default: return 'bg-gray-50 text-gray-600';
		}
	};

	// Determine user info
	let name = "Anonymous";
	let email = "";
	let role = "";
	let initials = "A";
	
	if (!grievance.anonymous && grievance.employeeId) {
		const emp = grievance.employeeId;
		name = emp.name || emp.fullName || "Employee";
		email = emp.email || "";
		role = emp.role || "";
		initials = name.charAt(0).toUpperCase();
	}

	return (
		<div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs transition-shadow hover:shadow-sm">
			<div className="flex flex-col sm:flex-row justify-between items-start gap-4">
				
				<div className="flex gap-3">
					<div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-[#4A1D96] flex items-center justify-center text-white font-bold text-sm shrink-0">
						{initials}
					</div>
					<div>
						<h4 className="text-gray-900 font-semibold text-sm">{name}</h4>
						{email && <p className="text-gray-400 text-xs mt-0.5">{email} &bull; {role}</p>}
					</div>
				</div>

				<div className="flex gap-2 shrink-0">
					<span className={`px-3 py-1 rounded-full text-xs font-medium ${getIntensityColors(grievance.intensity)}`}>
						{grievance.intensity || "Low"}
					</span>
					<span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
						{grievance.category}
					</span>
				</div>
			</div>
			
			<div className="mt-4 text-sm text-gray-600">
				<span className="font-semibold text-gray-900 mr-2">Note:</span>
				{grievance.description && grievance.description.length > 100 
					? `${grievance.description.substring(0, 100)}... ` 
					: grievance.description
				}
				{grievance.description && grievance.description.length > 100 && (
					<button className="text-blue-600 font-medium hover:underline text-xs">Read more....</button>
				)}
			</div>
		</div>
	);
};
