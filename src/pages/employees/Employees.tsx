import { useEffect, useRef, useState } from "react";
import {
	Search,
	Plus,
	MoreVertical,
	X,
	Loader2,
	CheckCircle,
	AlertCircle,
} from "lucide-react";
import { useEmployeeStore } from "../../store/useEmployeeStore";

type Toast = { type: "success" | "error"; message: string };

type EmployeeFormData = {
	name: string;
	email: string;
	role: string;
	workMode: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyForm: EmployeeFormData = {
	name: "",
	email: "",
	role: "",
	workMode: "Remote",
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

	if (!data.workMode || !data.workMode.trim())
		errors.workMode = "Work mode is required.";

	return errors;
};

const Employees = () => {
	const fetchedOnce = useRef(false);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
	const [activeMenu, setActiveMenu] = useState<string | null>(null);
	const [toast, setToast] = useState<Toast | null>(null);
	const [formErrors, setFormErrors] = useState<
		Record<string, string>
	>({});
	const [formData, setFormData] =
		useState<EmployeeFormData>(emptyForm);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [modeFilter, setModeFilter] = useState("all");
	const [roleFilter, setRoleFilter] = useState("all");

	const {
		employees,
		isLoading,
		error,
		fetchEmployees,
		createEmployee,
		updateEmployee,
		deleteEmployee,
	} = useEmployeeStore();

	useEffect(() => {
		if (fetchedOnce.current) return;
		fetchedOnce.current = true;
		fetchEmployees();
	}, [fetchEmployees]);

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
		`w-full px-4 py-3.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 transition-all ${
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
			workMode: formData.workMode,
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

	const handleEditEmployee = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!selectedEmployee) return;

		const errors = validateEmployee(formData);

		if (Object.keys(errors).length > 0) {
			setFormErrors(errors);
			showToast("error", "Please complete all required fields.");
			return;
		}

		const employeeId = selectedEmployee._id || selectedEmployee.id;

		const success = await updateEmployee(employeeId, {
			name: formData.name.trim(),
			email: formData.email.trim(),
			role: formData.role.trim(),
			workMode: formData.workMode,
			status: selectedEmployee.status || "Active",
			basicSalary: selectedEmployee.basicSalary || 0,
			allowances: selectedEmployee.allowances || 0,
			deductions: selectedEmployee.deductions || 0,
			joinedAt: selectedEmployee.joinedAt || new Date().toISOString(),
		});

		if (!success) {
			showToast(
				"error",
				useEmployeeStore.getState().error ||
					error ||
					"Update failed.",
			);
			return;
		}

		showToast("success", "Employee updated successfully!");
		setIsEditModalOpen(false);
		setSelectedEmployee(null);
		resetForm();
	};

	const handleDeleteEmployee = async (id: string) => {
		const confirmed = window.confirm(
			"Are you sure you want to delete this employee?",
		);

		if (!confirmed) return;

		const success = await deleteEmployee(id);

		if (!success) {
			showToast(
				"error",
				useEmployeeStore.getState().error ||
					error ||
					"Delete failed.",
			);
			return;
		}

		showToast("success", "Employee deleted successfully!");
		setActiveMenu(null);
	};

	const openEditModal = (employee: any) => {
		setSelectedEmployee(employee);

		setFormData({
			name: employee.name || "",
			email: employee.email || "",
			role: employee.role || "",
			workMode: employee.workMode || "Remote",
		});

		setFormErrors({});
		setIsEditModalOpen(true);
		setActiveMenu(null);
	};

	const uniqueRoles = Array.from(
		new Set(
			employees
				.map((emp: any) => String(emp.role || "").trim())
				.filter(Boolean),
		),
	).sort((a, b) => a.localeCompare(b));

	const filteredEmployees = employees.filter((emp: any) => {
		const query = searchQuery.trim().toLowerCase();
		const employeeName = String(emp.name || "").toLowerCase();
		const employeeEmail = String(emp.email || "").toLowerCase();
		const employeeRole = String(emp.role || "").toLowerCase();
		const employeeMode = String(emp.workMode || "Remote").toLowerCase();
		const employeeStatus = String(emp.status || "Active").toLowerCase();

		const searchMatches =
			!query ||
			employeeName.includes(query) ||
			employeeEmail.includes(query) ||
			employeeRole.includes(query) ||
			employeeMode.includes(query);

		const statusMatches =
			statusFilter === "all" ||
			employeeStatus === statusFilter.toLowerCase();
		const modeMatches =
			modeFilter === "all" ||
			employeeMode === modeFilter.toLowerCase();
		const roleMatches =
			roleFilter === "all" ||
			employeeRole === roleFilter.toLowerCase();

		return searchMatches && statusMatches && modeMatches && roleMatches;
	});

	const handleExport = () => {
		const csvHeaders = [
			"Name",
			"Email",
			"Role",
			"Work Mode",
			"Organization",
			"Status",
			"Date Joined",
		];

		const rows = filteredEmployees.map((emp: any) => {
			const organization =
				typeof emp.orgId === "object"
					? emp.orgId?.name || ""
					: emp.orgId || "";
			const dateJoined = emp.joinedAt
				? new Date(emp.joinedAt).toLocaleDateString()
				: "";

			return [
				emp.name || "",
				emp.email || "",
				emp.role || "",
				emp.workMode || "Remote",
				organization,
				emp.status || "Active",
				dateJoined,
			];
		});

		const toCsvCell = (value: string) => {
			const safe = String(value).replace(/"/g, '""');
			return `"${safe}"`;
		};

		const csvContent = [
			csvHeaders.map(toCsvCell).join(","),
			...rows.map((row) => row.map(toCsvCell).join(",")),
		].join("\n");

		const blob = new Blob([csvContent], {
			type: "text/csv;charset=utf-8;",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		const date = new Date().toISOString().split("T")[0];
		link.href = url;
		link.setAttribute("download", `employees-${date}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	return (
		<div className='max-w-7xl mx-auto space-y-6'>
			{toast && (
				<div
					className={`fixed top-6 right-6 z-100 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${
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

			<div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
				<div>
					<h2 className='text-xl font-semibold text-gray-800 mb-1'>
						Employee Directory
					</h2>
					<p className='text-sm text-gray-500'>
						Manage employees across your organization
					</p>
				</div>

				<button
					onClick={() => {
						resetForm();
						setIsModalOpen(true);
					}}
					className='w-full sm:w-auto bg-[#3B00D9] text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#3500c0] transition-all shadow-xs'
				>
					<Plus size={16} /> Add new employee
				</button>
			</div>

			<div className='bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden'>
				<div className='p-4 border-b border-gray-100 overflow-x-auto'>
					<div className='flex gap-4 min-w-max text-sm'>
						<button className='font-medium text-[#3B00D9] border-b-2 border-[#3B00D9] pb-4 px-2'>
							All Employees
						</button>
						{/* <button className='font-medium text-gray-500 pb-4 px-2 hover:text-gray-700'>
							Teams
						</button> */}
					</div>
				</div>

				<div className='p-4 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4'>
					<div className='relative flex-1 sm:max-w-md'>
						<Search
							className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
							size={18}
						/>
						<input
							type='text'
							placeholder='Search employee'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm'
						/>
					</div>

					<div className='flex gap-2'>
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className='flex-1 sm:flex-none text-sm font-medium text-gray-600 px-4 py-2.5 rounded-xl border border-gray-200 bg-white'
						>
							<option value='all'>All Status</option>
							<option value='active'>Active</option>
							<option value='inactive'>Inactive</option>
						</select>
						<select
							value={modeFilter}
							onChange={(e) => setModeFilter(e.target.value)}
							className='flex-1 sm:flex-none text-sm font-medium text-gray-600 px-4 py-2.5 rounded-xl border border-gray-200 bg-white'
						>
							<option value='all'>All Modes</option>
							<option value='remote'>Remote</option>
							<option value='on site'>On-site</option>
							<option value='hybrid'>Hybrid</option>
						</select>
						<select
							value={roleFilter}
							onChange={(e) => setRoleFilter(e.target.value)}
							className='flex-1 sm:flex-none text-sm font-medium text-gray-600 px-4 py-2.5 rounded-xl border border-gray-200 bg-white'
						>
							<option value='all'>All Roles</option>
							{uniqueRoles.map((role) => (
								<option key={role} value={role.toLowerCase()}>
									{role}
								</option>
							))}
						</select>
						<button
							onClick={handleExport}
							className='flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-medium text-gray-600 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors'
						>
							Export
						</button>
					</div>
				</div>

				<div className='overflow-x-auto min-h-100 relative'>
					{isLoading && (
						<div className='absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10'>
							<Loader2
								className='animate-spin text-[#3B00D9]'
								size={32}
							/>
						</div>
					)}

					<table className='w-full text-left text-sm text-gray-600 whitespace-nowrap hidden md:table'>
						<thead className='bg-gray-50/50 text-gray-800 font-medium border-b border-gray-100'>
							<tr>
								<th className='px-6 py-4'>Employee</th>
								<th className='px-6 py-4'>Role</th>
								<th className='px-6 py-4'>Work Mode</th>
								<th className='px-6 py-4'>Organization</th>
								<th className='px-6 py-4'>Status</th>
								<th className='px-6 py-4'>Date joined</th>
								<th className='px-6 py-4' />
							</tr>
						</thead>

						<tbody className='divide-y divide-gray-50'>
							{filteredEmployees?.map((emp: any, index: number) => {
								const employeeId = emp._id || emp.id || String(index);

								return (
									<tr
										key={employeeId}
										className='hover:bg-gray-50/50 transition-colors group'
									>
										<td className='px-6 py-4'>
											<div className='flex items-center gap-3'>
												<div className='w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-[#3B00D9] font-bold'>
													{emp.name?.charAt(0)}
												</div>

												<div>
													<p className='font-semibold text-gray-900'>
														{emp.name}
													</p>
													<p className='text-xs text-gray-500'>
														{emp.email}
													</p>
												</div>
											</div>
										</td>

										<td className='px-6 py-4 text-gray-600 font-medium'>
											{emp.role}
										</td>

										<td className='px-6 py-4 text-gray-600 font-medium'>
											{emp.workMode || "Remote"}
										</td>

										<td className='px-6 py-4'>
											<span className='inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-[#3B00D9]'>
												{typeof emp.orgId === "object"
													? emp.orgId.name
													: emp.orgId || "N/A"}
											</span>
										</td>

										<td className='px-6 py-4'>
											<span
												className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
													emp.status === "Active"
														? "bg-green-50 text-green-600"
														: "bg-gray-50 text-gray-600"
												}`}
											>
												<span
													className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
														emp.status === "Active"
															? "bg-green-500"
															: "bg-gray-400"
													}`}
												/>
												{emp.status}
											</span>
										</td>

										<td className='px-6 py-4 text-gray-500'>
											{emp.joinedAt
												? new Date(emp.joinedAt).toLocaleDateString()
												: "N/A"}
										</td>

										<td className='px-6 py-4 text-right relative'>
											<button
												type='button'
												onClick={() =>
													setActiveMenu(
														activeMenu === employeeId
															? null
															: employeeId,
													)
												}
												className='text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100'
											>
												<MoreVertical size={18} />
											</button>

											{activeMenu === employeeId && (
												<div className='absolute right-6 top-12 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-2'>
													<button
														type='button'
														onClick={() => openEditModal(emp)}
														className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'
													>
														Edit Profile
													</button>

													<div className='h-px bg-gray-100 my-1' />

													<button
														type='button'
														onClick={() =>
															handleDeleteEmployee(employeeId)
														}
														className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50'
													>
														Delete Employee
													</button>
												</div>
											)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>

					{/* Mobile Card Layout */}
					<div className='md:hidden divide-y divide-gray-100'>
						{filteredEmployees?.map((emp: any, index: number) => {
							const employeeId = emp._id || emp.id || String(index);

							return (
								<div key={employeeId} className='p-4 space-y-4'>
									<div className='flex items-center justify-between'>
										<div className='flex items-center gap-3'>
											<div className='w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-[#3B00D9] font-bold text-lg'>
												{emp.name?.charAt(0)}
											</div>
											<div>
												<p className='font-semibold text-gray-900'>
													{emp.name}
												</p>
												<p className='text-xs text-gray-500'>
													{emp.email}
												</p>
											</div>
										</div>

										<div className='relative'>
											<button
												type='button'
												onClick={() =>
													setActiveMenu(
														activeMenu === employeeId ? null : employeeId,
													)
												}
												className='text-gray-400 p-2 rounded-lg hover:bg-gray-50'
											>
												<MoreVertical size={20} />
											</button>

											{activeMenu === employeeId && (
												<div className='absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-2'>
													<button
														type='button'
														onClick={() => openEditModal(emp)}
														className='w-full text-left px-4 py-3 text-sm text-gray-700 active:bg-gray-50'
													>
														Edit Profile
													</button>
													<div className='h-px bg-gray-100 my-1' />
													<button
														type='button'
														onClick={() => handleDeleteEmployee(employeeId)}
														className='w-full text-left px-4 py-3 text-sm text-red-600 active:bg-red-50'
													>
														Delete Employee
													</button>
												</div>
											)}
										</div>
									</div>

									<div className='grid grid-cols-2 gap-4 text-sm'>
										<div>
											<p className='text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1'>Role</p>
											<p className='text-gray-700 font-medium'>{emp.role}</p>
										</div>
										<div>
											<p className='text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1'>Work Mode</p>
											<p className='text-gray-700 font-medium'>{emp.workMode || "Remote"}</p>
										</div>
										<div>
											<p className='text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1'>Status</p>
											<span
												className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
													emp.status === "Active"
														? "bg-green-50 text-green-600"
														: "bg-gray-50 text-gray-600"
												}`}
											>
												{emp.status}
											</span>
										</div>
										<div>
											<p className='text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1'>Organization</p>
											<p className='text-gray-700 font-medium truncate text-xs'>
												{typeof emp.orgId === "object" ? emp.orgId.name : emp.orgId || "N/A"}
											</p>
										</div>
										<div>
											<p className='text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1'>Joined</p>
											<p className='text-gray-700 font-medium'>
												{emp.joinedAt ? new Date(emp.joinedAt).toLocaleDateString() : "N/A"}
											</p>
										</div>
									</div>
								</div>
							);
						})}
					</div>

					{filteredEmployees?.length === 0 && !isLoading && (
						<div className='px-6 py-20 text-center'>
							<div className='flex flex-col items-center justify-center'>
								<div className='w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4'>
									<Plus size={32} />
								</div>
								<p className='text-gray-900 font-medium'>No employees found</p>
								<p className='text-gray-500 text-sm mt-1'>
									Try adjusting your search or filters
								</p>
							</div>
						</div>
					)}
				</div>
			</div>

			{isModalOpen && (
				<div className='fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4'>
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

								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1.5'>
										Work Mode
									</label>
									<select
										value={formData.workMode}
										onChange={(e) =>
											updateField("workMode", e.target.value)
										}
										className={fieldCls("workMode")}
									>
										<option value='Remote'>Remote</option>
										<option value='On site'>On-site</option>
										<option value='Hybrid'>Hybrid</option>
									</select>
									{formErrors.workMode && (
										<p className='mt-1.5 text-xs text-rose-500 font-medium'>
											{formErrors.workMode}
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

			{isEditModalOpen && (
				<div className='fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4'>
					<div className='bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden'>
						<div className='p-8'>
							<div className='flex items-center justify-between mb-8'>
								<div>
									<h3 className='text-2xl font-bold text-gray-900'>
										Edit Employee
									</h3>
									<p className='text-sm text-gray-500 mt-1'>
										Update employee information
									</p>
								</div>

								<button
									type='button'
									onClick={() => {
										setIsEditModalOpen(false);
										resetForm();
									}}
									className='p-2 hover:bg-gray-100 rounded-full'
								>
									<X size={20} className='text-gray-400' />
								</button>
							</div>

							<form
								className='space-y-5'
								onSubmit={handleEditEmployee}
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

								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1.5'>
										Work Mode
									</label>
									<select
										value={formData.workMode}
										onChange={(e) =>
											updateField("workMode", e.target.value)
										}
										className={fieldCls("workMode")}
									>
										<option value='Remote'>Remote</option>
										<option value='On site'>On-site</option>
										<option value='Hybrid'>Hybrid</option>
									</select>
									{formErrors.workMode && (
										<p className='mt-1.5 text-xs text-rose-500 font-medium'>
											{formErrors.workMode}
										</p>
									)}
								</div>

								<div className='pt-4 flex gap-3'>
									<button
										type='button'
										onClick={() => {
											setIsEditModalOpen(false);
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
