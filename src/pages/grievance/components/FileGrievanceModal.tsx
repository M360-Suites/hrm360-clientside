import { useState, useEffect } from "react";
import { X, UploadCloud, CheckCircle2, Loader2 } from "lucide-react";
import { useGrievanceStore } from "../../../store/useGrievanceStore";
import { useEmployeeStore } from "../../../store/useEmployeeStore";

export const FileGrievanceModal = ({ onClose }: { onClose: () => void }) => {
	const { fileGrievance, categories, intensities, isSubmitting } = useGrievanceStore();
	const { employees, fetchEmployees } = useEmployeeStore();

	const [step, setStep] = useState<"form" | "confirm" | "success">("form");
	const [formData, setFormData] = useState({
		title: "",
		category: "",
		intensity: "",
		description: "",
		anonymous: false,
		doc: "",
		staffs: [] as string[]
	});

	useEffect(() => {
		fetchEmployees({ limit: 100 });
	}, []);

	const handleStaffToggle = (staffId: string) => {
		setFormData(prev => ({
			...prev,
			staffs: prev.staffs.includes(staffId) 
				? prev.staffs.filter(id => id !== staffId)
				: [...prev.staffs, staffId]
		}));
	};

	const submit = async () => {
		try {
			await fileGrievance(formData);
			setStep("success");
		} catch (error) {
			console.error(error);
			setStep("form");
		}
	};

	if (step === "confirm") {
		return (
			<div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
				<div className="bg-white rounded-3xl w-full max-w-md p-8 text-center shadow-xl animate-in fade-in zoom-in-95 duration-200">
					<h2 className="text-xl font-bold text-gray-900 mb-2">You are about to submit a grievance</h2>
					<p className="text-gray-500 mb-8">Are you sure you want to submit this?</p>
					
					<div className="flex gap-4 justify-center">
						<button 
							onClick={() => setStep("form")}
							className="px-8 py-3 rounded-xl bg-gray-200 text-gray-600 font-semibold hover:bg-gray-300 transition-colors"
						>
							Cancel
						</button>
						<button 
							onClick={submit}
							disabled={isSubmitting}
							className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"
						>
							{isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
							Confirm
						</button>
					</div>
				</div>
			</div>
		);
	}

	if (step === "success") {
		return (
			<div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
				<div className="bg-white rounded-3xl w-full max-w-md p-8 text-center shadow-xl animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center">
					<div className="w-20 h-20 text-emerald-500 mb-4">
						<CheckCircle2 className="w-full h-full fill-emerald-100" />
					</div>
					<h2 className="text-xl font-bold text-gray-900 mb-8">Grievance submitted</h2>
					<button 
						onClick={onClose}
						className="text-[#4A1D96] font-semibold text-sm hover:underline"
					>
						Back to Home 
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 bg-black/40 z-[100] flex justify-center items-start overflow-y-auto p-4 sm:p-6">
			<div className="bg-white rounded-3xl w-full max-w-2xl my-auto shadow-2xl relative animate-in slide-in-from-bottom-8 duration-300">
				
				<button 
					onClick={onClose}
					className="absolute right-6 top-6 bg-purple-50 text-[#4A1D96] px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 hover:bg-purple-100 transition-colors"
				>
					Close <X size={14} />
				</button>

				<div className="p-8 pb-6">
					<h2 className="text-2xl font-bold text-gray-900 mb-1">File a case</h2>
					<p className="text-gray-500 text-sm mb-6">All submissions are handled confidentially by HR</p>
					
					<form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setStep("confirm"); }}>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
							<input 
								required
								value={formData.title}
								onChange={e => setFormData({...formData, title: e.target.value})}
								placeholder="e.g. Harassment incident" 
								className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4A1D96] focus:ring-1 focus:ring-[#4A1D96] outline-none transition-all text-sm"
							/>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5">Select Category</label>
								<select 
									required
									value={formData.category}
									onChange={e => setFormData({...formData, category: e.target.value})}
									className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4A1D96] outline-none text-sm bg-white"
								>
									<option value="" disabled>Select...</option>
									{categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5">Select intensity</label>
								<select 
									required
									value={formData.intensity}
									onChange={e => setFormData({...formData, intensity: e.target.value})}
									className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4A1D96] outline-none text-sm bg-white"
								>
									<option value="" disabled>Select...</option>
									{intensities.map((c, i) => <option key={i} value={c}>{c}</option>)}
								</select>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">Select staff(s) involved</label>
							<div className="border border-gray-200 rounded-xl max-h-40 overflow-y-auto p-2 space-y-1">
								{employees.map(emp => (
									<label key={emp.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
										<input 
											type="checkbox" 
											checked={formData.staffs.includes(emp.id)}
											onChange={() => handleStaffToggle(emp.id)}
											className="w-4 h-4 text-[#4A1D96] rounded border-gray-300 focus:ring-[#4A1D96]"
										/>
										<div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-[#4A1D96]">
											{(emp.name || emp.fullName || "A").charAt(0)}
										</div>
										<span className="text-sm font-medium text-gray-700">{emp.name || emp.fullName}</span>
									</label>
								))}
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">Enter description</label>
							<textarea 
								required
								value={formData.description}
								onChange={e => setFormData({...formData, description: e.target.value})}
								rows={4}
								className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4A1D96] outline-none text-sm resize-none"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">Add evidence ( optional)</label>
							<div className="border-2 border-dashed border-[#4A1D96]/20 bg-[#4A1D96]/5 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#4A1D96]/10 transition-colors">
								<UploadCloud className="w-8 h-8 text-[#4A1D96] mb-2" />
								<p className="text-sm font-semibold text-gray-900 mb-1">Upload a document</p>
								<p className="text-xs text-[#4A1D96]">Not more than 5mb</p>
								{/* In a real app, file input would go here, and it would handle uploading to cloud storage and setting the url in formData.doc */}
							</div>
						</div>

						<div className="flex items-center justify-between py-2 border-t border-gray-100">
							<span className="text-sm font-medium text-gray-700">Submit as anonymous</span>
							<label className="relative inline-flex items-center cursor-pointer">
								<input 
									type="checkbox" 
									className="sr-only peer" 
									checked={formData.anonymous}
									onChange={e => setFormData({...formData, anonymous: e.target.checked})}
								/>
								<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4A1D96]"></div>
							</label>
						</div>

						<button 
							type="submit"
							className="w-full bg-[#4A1D96] hover:bg-[#3000b3] text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm"
						>
							Submit Grievance
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};
