import { useEffect, useRef, useState } from "react";
import {
	TrendingUp,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	X,
	Loader2,
	CheckCircle,
	AlertCircle,
} from "lucide-react";
import { useEmployeeStore } from "../../store/useEmployeeStore";
import { useAttendanceStore } from "../../store/useAttendanceStore";
import { useLeaveStore } from "../../store/useLeaveStore";

type Toast = { type: "success" | "error"; message: string };

type EmployeeFormData = {
	name: string;
	email: string;
	role: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyForm: EmployeeFormData = {
	name: "",
	email: "",
	role: "",
};

const validateEmployee = (data: EmployeeFormData) => {
	const errors: Record<string, string> = {};

	if (!data.name.trim()) errors.name = "Name is required.";
	else if (data.name.trim().length < 2) {
		errors.name = "Name must be at least 2 characters.";
	}

	if (!data.email.trim()) errors.email = "Email is required.";
	else if (!emailRegex.test(data.email)) {
		errors.email = "Please enter a valid email address.";
	}

	if (!data.role.trim())
		errors.role = "Role / Job title is required.";

	return errors;
};

const Dashboard = () => {
	const fetchedOnce = useRef(false);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [toast, setToast] = useState<Toast | null>(null);
	const [formErrors, setFormErrors] = useState<
		Record<string, string>
	>({});
	const [formData, setFormData] =
		useState<EmployeeFormData>(emptyForm);

	const {
		employees,
		isLoading,
		error,
		fetchEmployees,
		createEmployee,
	} = useEmployeeStore();

	const { todayStats, fetchTodayStats } = useAttendanceStore();
	const { leaves, fetchLeaves } = useLeaveStore();

	useEffect(() => {
		if (fetchedOnce.current) return;
		fetchedOnce.current = true;

		fetchEmployees();
		fetchTodayStats();
		fetchLeaves();
	}, [fetchEmployees, fetchTodayStats, fetchLeaves]);

	const showToast = (type: Toast["type"], message: string) => {
		setToast({ type, message });
		setTimeout(() => setToast(null), 4000);
	};

	const updateField = (
		field: keyof EmployeeFormData,
		value: string,
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setFormErrors((prev) => ({ ...prev, [field]: "" }));
	};

	const resetForm = () => {
		setFormData(emptyForm);
		setFormErrors({});
	};

	const fieldCls = (field: string) =>
		`w-full px-4 py-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
			formErrors[field]
				? "border-rose-400 focus:ring-rose-200 focus:border-rose-400"
				: "border-gray-200 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9]"
		}`;

	const handleAddEmployee = async (e: React.FormEvent) => {
		e.preventDefault();

		const errors = validateEmployee(formData);

		if (Object.keys(errors).length > 0) {
			setFormErrors(errors);
			showToast("error", "Please complete all required fields.");
			return;
		}

		const success = await createEmployee({
			name: formData.name.trim(),
			email: formData.email.trim(),
			role: formData.role.trim(),
			status: "Active",
			basicSalary: 0,
			allowances: 0,
			deductions: 0,
			joinedAt: new Date().toISOString(),
		});

		if (!success) {
			showToast(
				"error",
				useEmployeeStore.getState().error ||
					error ||
					"Failed to add employee.",
			);
			return;
		}

		showToast("success", "Employee added successfully!");
		setIsModalOpen(false);
		resetForm();
	};

	return (
		<div className='max-w-7xl mx-auto space-y-6'>
			{toast && (
				<div
					className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${
						toast.type === "success"
							? "bg-emerald-600 text-white"
							: "bg-rose-600 text-white"
					}`}
				>
					{toast.type === "success" ? (
						<CheckCircle size={18} />
					) : (
						<AlertCircle size={18} />
					)}
					{toast.message}
				</div>
			)}

			<div>
				<h2 className='text-xl font-semibold text-gray-800 mb-1'>
					Welcome back
				</h2>
				<p className='text-sm text-gray-500'>
					Here is an overview of what is happening across your
					organization today
				</p>
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
				<div className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative'>
					<p className='text-sm font-medium text-gray-600 mb-2'>
						Total Employee
					</p>
					<div className='flex items-end gap-3 mb-4'>
						<h3 className='text-3xl sm:text-4xl font-bold text-gray-900'>
							{employees?.length || 0}
						</h3>
						<span className='flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md mb-1'>
							<TrendingUp size={12} className='mr-1' /> +2.3%
						</span>
					</div>
					<div className='flex items-center gap-4 text-xs text-gray-500 overflow-x-auto whitespace-nowrap pb-1'>
						<div className='flex items-center gap-1.5'>
							<div className='w-2.5 h-2.5 rounded-full bg-pink-500'></div>{" "}
							Remote - 0
						</div>
						<div className='flex items-center gap-1.5'>
							<div className='w-2.5 h-2.5 rounded-full bg-indigo-500'></div>{" "}
							Onsite - {employees?.length || 0}
						</div>
					</div>
				</div>

				<div className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm'>
					<p className='text-sm font-medium text-gray-600 mb-2'>
						Attendance Today
					</p>
					<div className='flex items-end gap-3 mb-4'>
						<h3 className='text-3xl sm:text-4xl font-bold text-gray-900'>
							{todayStats?.present || 0}
						</h3>
						<span className='flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md mb-1'>
							<TrendingUp size={12} className='mr-1' />{" "}
							{todayStats?.rate || "0%"}
						</span>
					</div>
				</div>

				<div className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm sm:col-span-2 lg:col-span-1'>
					<p className='text-sm font-medium text-gray-600 mb-2'>
						On leave Today
					</p>
					<div className='flex items-end gap-3 mb-4'>
						<h3 className='text-3xl sm:text-4xl font-bold text-gray-900'>
							{leaves?.filter((l: any) => l.status === "Approved")
								.length || 0}
						</h3>
						<span className='flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md mb-1'>
							<TrendingUp size={12} className='mr-1' /> +2.3%
						</span>
					</div>
				</div>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				<div className='lg:col-span-2 space-y-6'>
					<div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm'>
						<div className='flex items-center justify-between mb-6'>
							<h3 className='font-semibold text-gray-800'>
								Employee Overview
							</h3>
							<button className='flex items-center gap-2 text-sm font-medium text-[#3B00D9] bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100'>
								Today <ChevronDown size={14} />
							</button>
						</div>

						<div className='h-64 flex items-end justify-between relative pt-8 border-b border-gray-100'>
							<div className='absolute inset-0 top-10 flex items-center justify-center'>
								<svg
									className='w-full h-full'
									preserveAspectRatio='none'
									viewBox='0 0 100 50'
								>
									<path
										d='M0,25 Q10,10 20,25 T40,25 T60,20 T80,35 T100,20'
										fill='none'
										stroke='#FF6B00'
										strokeWidth='1.5'
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>

				<div className='space-y-6'>
					<div className='bg-white p-4 rounded-2xl border border-purple-200 border-dashed bg-purple-50/30'>
						<button
							type='button'
							onClick={() => {
								resetForm();
								setIsModalOpen(true);
							}}
							className='w-full py-2.5 bg-purple-100 text-[#3B00D9] font-medium rounded-xl text-sm flex items-center justify-center gap-2 mb-3'
						>
							<span className='text-lg'>+</span> Add new employee
						</button>
					</div>

					<div className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm'>
						<h3 className='font-semibold text-gray-800 mb-4'>
							Calendar
						</h3>

						<div className='flex items-center justify-between mb-4'>
							<span className='text-sm font-medium'>
								{new Date().toLocaleString("default", {
									month: "long",
									year: "numeric",
								})}
							</span>

							<div className='flex gap-2 text-gray-400'>
								<button>
									<ChevronLeft size={16} />
								</button>
								<button>
									<ChevronRight size={16} />
								</button>
							</div>
						</div>

						<div className='grid grid-cols-7 gap-1 text-center text-xs mb-2 text-gray-500'>
							<div>Mo</div>
							<div>Tu</div>
							<div>We</div>
							<div>Th</div>
							<div>Fr</div>
							<div>Sa</div>
							<div>Su</div>
						</div>

						<div className='grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-700'>
							{Array(31)
								.fill(0)
								.map((_, i) => (
									<div
										key={i}
										className={`p-1 ${
											i + 1 === new Date().getDate()
												? "bg-[#FF0055] text-white rounded-full"
												: ""
										}`}
									>
										{i + 1}
									</div>
								))}
						</div>
					</div>
				</div>
			</div>

			{isModalOpen && (
				<div className='fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
					<div className='bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden'>
						<div className='p-8'>
							<div className='flex items-center justify-between mb-8'>
								<div>
									<h3 className='text-2xl font-bold text-gray-900'>
										Add Employee
									</h3>
									<p className='text-sm text-gray-500 mt-1'>
										Setup a new member in your team
									</p>
								</div>

								<button
									type='button'
									onClick={() => {
										setIsModalOpen(false);
										resetForm();
									}}
									className='p-2 hover:bg-gray-100 rounded-full'
								>
									<X size={20} className='text-gray-400' />
								</button>
							</div>

							<form
								className='space-y-5'
								onSubmit={handleAddEmployee}
								noValidate
							>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1.5'>
										Full Name
									</label>
									<input
										type='text'
										value={formData.name}
										onChange={(e) =>
											updateField("name", e.target.value)
										}
										placeholder='e.g. Adebayo Johnson'
										className={fieldCls("name")}
									/>
									{formErrors.name && (
										<p className='mt-1.5 text-xs text-rose-500 font-medium'>
											{formErrors.name}
										</p>
									)}
								</div>

								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1.5'>
										Email Address
									</label>
									<input
										type='email'
										value={formData.email}
										onChange={(e) =>
											updateField("email", e.target.value)
										}
										placeholder='e.g. adebayo@company.com'
										className={fieldCls("email")}
									/>
									{formErrors.email && (
										<p className='mt-1.5 text-xs text-rose-500 font-medium'>
											{formErrors.email}
										</p>
									)}
								</div>

								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1.5'>
										Job Role
									</label>
									<input
										type='text'
										value={formData.role}
										onChange={(e) =>
											updateField("role", e.target.value)
										}
										placeholder='e.g. Senior Software Engineer'
										className={fieldCls("role")}
									/>
									{formErrors.role && (
										<p className='mt-1.5 text-xs text-rose-500 font-medium'>
											{formErrors.role}
										</p>
									)}
								</div>

								<div className='pt-4 flex gap-3'>
									<button
										type='button'
										onClick={() => {
											setIsModalOpen(false);
											resetForm();
										}}
										className='flex-1 py-3.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50'
									>
										Cancel
									</button>

									<button
										type='submit'
										disabled={isLoading}
										className='flex-1 py-3.5 bg-[#3B00D9] hover:bg-[#3500c0] text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-70'
									>
										{isLoading && (
											<Loader2 className='animate-spin' size={16} />
										)}
										Add Member
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

export default Dashboard;
