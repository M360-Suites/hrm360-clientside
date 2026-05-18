import { useState, useEffect, useRef } from "react";
import { Clock, UserPlus, UserMinus, Search, X, Loader2, QrCode, ScanLine } from "lucide-react";
import { useAttendanceStore } from "../../store/useAttendanceStore";
import { useEmployeeStore } from "../../store/useEmployeeStore";

const Attendance = () => {
	const {
		dayAttendance,
		todayStats,
		fetchDayAttendance,
		fetchTodayStats,
		clockIn,
		clockOut,
		qrCode,
		isLoading,
		fetchQrCode,
		clockWithQr
	} = useAttendanceStore();

	const fetchedOnce = useRef(false);

	useEffect(() => {
		const timer = setInterval(() => setTime(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);
	const { employees, fetchEmployees } = useEmployeeStore();
	useEffect(() => {
		if (fetchedOnce.current) return;
		fetchedOnce.current = true;

		fetchDayAttendance();
		fetchTodayStats();
		fetchEmployees();
	}, [fetchDayAttendance, fetchTodayStats, fetchEmployees]);

	const [time, setTime] = useState(new Date());
	const [searchQuery, setSearchQuery] = useState("");
	const [showQrModal, setShowQrModal] = useState(false);
	const [showScanModal, setShowScanModal] = useState(false);
	const [qrInput, setQrInput] = useState("");

	useEffect(() => {
		fetchDayAttendance();
		fetchTodayStats();
		fetchEmployees();

		const timer = setInterval(() => setTime(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	const handleClockIn = async (employeeId: string) => {
		await clockIn(employeeId);
		fetchTodayStats(); // Refresh stats
	};

	const handleClockOut = async (employeeId: string) => {
		await clockOut(employeeId);
		fetchTodayStats(); // Refresh stats
	};

	const filteredEmployees = employees.filter(
		(emp) =>
			emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			emp.role.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<div className='max-w-7xl mx-auto space-y-6 pb-12'>
			<div className='flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4'>
				<div>
					<h2 className='text-xl font-semibold text-gray-800 mb-1'>
						Attendance Tracking
					</h2>
					<p className='text-sm text-gray-500'>
						Real-time presence management for your organization
					</p>
				</div>
				<div className='text-left sm:text-right w-full sm:w-auto p-4 bg-white rounded-2xl border border-gray-100 sm:bg-transparent sm:border-0 sm:p-0'>
					<p className='text-xs text-gray-400 font-medium uppercase tracking-wider mb-1'>
						Current Time
					</p>
					<div className='text-2xl font-bold text-gray-900 tabular-nums'>
						{time.toLocaleTimeString("en-US", { hour12: false })}
					</div>
				</div>
			</div>

			<div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
				<div className='bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs shadow-indigo-500/5'>
					<p className='text-[10px] sm:text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1 sm:mb-2'>
						Present Today
					</p>
					<h3 className='text-2xl sm:text-3xl font-bold text-gray-900'>
						{todayStats?.present || 0}
					</h3>
				</div>
				<div className='bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs shadow-amber-500/5'>
					<p className='text-[10px] sm:text-xs font-bold text-amber-500 uppercase tracking-wider mb-1 sm:mb-2'>
						Late Arrivals
					</p>
					<h3 className='text-2xl sm:text-3xl font-bold text-gray-900'>
						{todayStats?.late || 0}
					</h3>
				</div>
				<div className='bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs shadow-rose-500/5'>
					<p className='text-[10px] sm:text-xs font-bold text-rose-500 uppercase tracking-wider mb-1 sm:mb-2'>
						Absent Today
					</p>
					<h3 className='text-2xl sm:text-3xl font-bold text-gray-900'>
						{todayStats?.absent || 0}
					</h3>
				</div>
				<div className='bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs shadow-emerald-500/5'>
					<p className='text-[10px] sm:text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1 sm:mb-2'>
						Attendance Rate
					</p>
					<h3 className='text-2xl sm:text-3xl font-bold text-gray-900'>
						{todayStats?.rate || "0%"}
					</h3>
				</div>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Employee List for Clocking In/Out */}
				<div className='lg:col-span-2 space-y-4'>
					<div className='bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden flex flex-col'>
						<div className='p-6 border-b border-gray-100'>
							<div className='flex items-center justify-between mb-4'>
								<h3 className='font-bold text-gray-900'>
									Manage Attendance
								</h3>
								<div className="flex items-center gap-2">
									<span className='hidden sm:inline-block text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full font-semibold'>
										{employees.length} Employees
									</span>
									<button onClick={() => { fetchQrCode(); setShowQrModal(true); }} className="flex items-center gap-1.5 text-xs bg-[#3B00D9] text-white px-3 py-1.5 rounded-full font-medium hover:bg-indigo-700 transition-colors shadow-xs">
										<QrCode size={14} /> Today's QR
									</button>
									<button onClick={() => setShowScanModal(true)} className="flex items-center gap-1.5 text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-full font-medium hover:bg-emerald-700 transition-colors shadow-xs">
										<ScanLine size={14} /> Scan QR
									</button>
								</div>
							</div>
							<div className='relative'>
								<Search
									className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
									size={16}
								/>
								<input
									type='text'
									placeholder='Search employee to clock in...'
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className='w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm'
								/>
							</div>
						</div>

						<div className='overflow-x-auto'>
							<table className='w-full text-left text-sm text-gray-600 whitespace-nowrap'>
								<thead className='bg-gray-50/50 text-gray-800 font-medium border-b border-gray-100'>
									<tr>
										<th className='px-6 py-4'>Employee</th>
										<th className='px-6 py-4'>Role</th>
										<th className='px-6 py-4 text-right'>Actions</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-gray-50'>
									{filteredEmployees.map((emp: any) => {
										const isClockedIn = dayAttendance.some(
											(record) =>
												(record.employeeId === emp._id ||
													record.employeeId === emp.id) &&
												!record.clockOut,
										);

										return (
											<tr
												key={emp._id || emp.id}
												className='hover:bg-gray-50/30 transition-colors'
											>
												<td className='px-6 py-4'>
													<div className='flex items-center gap-3'>
														<div className='w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[#3B00D9] font-bold text-xs'>
															{emp.name?.charAt(0)}
														</div>
														<div>
															<p className='font-semibold text-gray-900'>
																{emp.name}
															</p>
															<p className='text-[10px] text-gray-400'>
																{emp.email}
															</p>
														</div>
													</div>
												</td>
												<td className='px-6 py-4 text-xs font-medium text-gray-500'>
													{emp.role}
												</td>
												<td className='px-6 py-4 text-right'>
													{isClockedIn ? (
														<button
															onClick={() =>
																handleClockOut(emp._id || emp.id)
															}
															className='inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors'
														>
															<UserMinus size={14} /> Clock Out
														</button>
													) : (
														<button
															onClick={() =>
																handleClockIn(emp._id || emp.id)
															}
															className='inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors'
														>
															<UserPlus size={14} /> Clock In
														</button>
													)}
												</td>
											</tr>
										);
									})}
									{filteredEmployees.length === 0 && (
										<tr>
											<td
												colSpan={3}
												className='px-6 py-10 text-center text-gray-400 text-xs italic'
											>
												No employees found matching your search.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				{/* Real-time Activity Feed */}
				<div className='space-y-4'>
					<div className='bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden'>
						<div className='p-6 border-b border-gray-100'>
							<h3 className='font-bold text-gray-900'>
								Today's Logs
							</h3>
						</div>
						<div className='p-4 space-y-4 max-h-[500px] overflow-y-auto'>
							{dayAttendance.length > 0 ? (
								dayAttendance.map((record: any, idx: number) => (
									<div
										key={record.id || idx}
										className='flex gap-3 p-3 rounded-xl bg-gray-50/50 border border-gray-100'
									>
										<div
											className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
												record.clockOut
													? "bg-rose-100 text-rose-600"
													: "bg-emerald-100 text-emerald-600"
											}`}
										>
											<Clock size={14} />
										</div>
										<div className='min-w-0'>
											<p className='text-xs font-bold text-gray-900 truncate'>
												{record.employeeName || "Employee"}
											</p>
											<p className='text-[10px] text-gray-500'>
												{record.clockOut
													? `Out: ${record.clockOut}`
													: `In: ${record.clockIn}`}
											</p>
										</div>
										<div className='ml-auto'>
											<span
												className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
													record.status === "Present"
														? "bg-emerald-50 text-emerald-600"
														: "bg-amber-50 text-amber-600"
												}`}
											>
												{record.status || "Present"}
											</span>
										</div>
									</div>
								))
							) : (
								<div className='text-center py-10 text-gray-400 text-xs italic'>
									No activity logs yet today.
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* QR Modals */}
			{showQrModal && (
				<div className='fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4'>
					<div className='bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 relative'>
						<button onClick={() => setShowQrModal(false)} className='absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors'><X size={20}/></button>
						<h3 className='text-xl font-bold text-gray-900 mb-2'>Today's QR Code</h3>
						<p className='text-sm text-gray-500 mb-6'>Employees can scan this to clock in/out.</p>
						<div className='flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-8 border border-gray-100 min-h-[250px]'>
							{isLoading && !qrCode ? (
								<Loader2 className='animate-spin text-[#3B00D9]' size={32} />
							) : qrCode ? (
								<div className="text-center w-full">
									<div className="w-48 h-48 bg-white p-2 border border-gray-200 rounded-xl shadow-sm mb-4 mx-auto flex items-center justify-center overflow-hidden">
										{typeof qrCode === 'string' && (qrCode.startsWith('http') || qrCode.startsWith('data:image')) ? (
											<img src={qrCode} alt="Today's QR" className="max-w-full max-h-full" />
										) : (
											<div className="text-[10px] break-all text-gray-600 p-2 font-mono bg-gray-50 rounded w-full h-full overflow-auto">
												{typeof qrCode === 'object' ? JSON.stringify(qrCode) : qrCode}
											</div>
										)}
									</div>
									<p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Unique Daily Code</p>
								</div>
							) : (
								<p className="text-sm text-rose-500 font-medium">Failed to load QR code</p>
							)}
						</div>
					</div>
				</div>
			)}

			{showScanModal && (
				<div className='fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4'>
					<div className='bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 relative'>
						<button onClick={() => setShowScanModal(false)} className='absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors'><X size={20}/></button>
						<h3 className='text-xl font-bold text-gray-900 mb-2'>Scan QR Code</h3>
						<p className='text-sm text-gray-500 mb-6'>Enter or scan QR data to clock in/out.</p>
						<div className='space-y-4'>
							<input 
								type="text" 
								value={qrInput}
								onChange={(e) => setQrInput(e.target.value)}
								placeholder="Paste or scan QR data..." 
								className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm"
							/>
							<button 
								onClick={async () => {
									if(!qrInput) return;
									const success = await clockWithQr(qrInput);
									if(success) {
										setShowScanModal(false);
										setQrInput("");
									}
								}}
								disabled={isLoading || !qrInput}
								className="w-full py-3 bg-[#3B00D9] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#3500c0] disabled:opacity-70 transition-all shadow-xs"
							>
								{isLoading ? <Loader2 className="animate-spin" size={16} /> : "Submit QR Data"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Attendance;
