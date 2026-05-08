import { useState, useEffect, useRef } from "react";
import { Clock, UserPlus, UserMinus, Search } from "lucide-react";
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
			<div className='flex items-end justify-between'>
				<div>
					<h2 className='text-xl font-semibold text-gray-800 mb-1'>
						Attendance Tracking
					</h2>
					<p className='text-sm text-gray-500'>
						Real-time presence management for your organization
					</p>
				</div>
				<div className='text-right'>
					<p className='text-xs text-gray-400 font-medium uppercase tracking-wider mb-1'>
						Current Time
					</p>
					<div className='text-2xl font-bold text-gray-900 tabular-nums'>
						{time.toLocaleTimeString("en-US", { hour12: false })}
					</div>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
				<div className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm shadow-indigo-500/5'>
					<p className='text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2'>
						Present Today
					</p>
					<h3 className='text-3xl font-bold text-gray-900'>
						{todayStats?.present || 0}
					</h3>
				</div>
				<div className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm shadow-amber-500/5'>
					<p className='text-xs font-bold text-amber-500 uppercase tracking-wider mb-2'>
						Late Arrivals
					</p>
					<h3 className='text-3xl font-bold text-gray-900'>
						{todayStats?.late || 0}
					</h3>
				</div>
				<div className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm shadow-rose-500/5'>
					<p className='text-xs font-bold text-rose-500 uppercase tracking-wider mb-2'>
						Absent Today
					</p>
					<h3 className='text-3xl font-bold text-gray-900'>
						{todayStats?.absent || 0}
					</h3>
				</div>
				<div className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm shadow-emerald-500/5'>
					<p className='text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2'>
						Attendance Rate
					</p>
					<h3 className='text-3xl font-bold text-gray-900'>
						{todayStats?.rate || "0%"}
					</h3>
				</div>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Employee List for Clocking In/Out */}
				<div className='lg:col-span-2 space-y-4'>
					<div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col'>
						<div className='p-6 border-b border-gray-100'>
							<div className='flex items-center justify-between mb-4'>
								<h3 className='font-bold text-gray-900'>
									Manage Attendance
								</h3>
								<span className='text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full font-semibold'>
									{employees.length} Employees
								</span>
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
									className='w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm'
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
					<div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
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
		</div>
	);
};

export default Attendance;
