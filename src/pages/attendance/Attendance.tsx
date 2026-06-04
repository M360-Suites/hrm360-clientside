import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import {
	Clock,
	UserPlus,
	UserMinus,
	Search,
	X,
	Loader2,
	QrCode,
	ScanLine,
	CalendarDays,
	CheckCircle2,
	AlertCircle,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useAttendanceStore } from "../../store/useAttendanceStore";
import { useEmployeeStore } from "../../store/useEmployeeStore";

const formatTime = (date: Date) =>
	date.toLocaleTimeString("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

const formatDate = (date: Date) =>
	date.toLocaleDateString("en-GB", {
		weekday: "long",
		day: "2-digit",
		month: "long",
		year: "numeric",
	});

const formatDuration = (ms: number) => {
	const totalSeconds = Math.max(0, Math.floor(ms / 1000));
	const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
	const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
		2,
		"0",
	);
	const seconds = String(totalSeconds % 60).padStart(2, "0");
	return `${hours}:${minutes}:${seconds}`;
};

const normalizeTimeValue = (value?: string) => {
	if (!value) return "";
	const trimmed = String(value).trim();
	if (!trimmed) return "";
	return trimmed;
};

const parseClockTimeToDate = (timeValue?: string) => {
	const normalized = normalizeTimeValue(timeValue);
	if (!normalized) return null;

	if (normalized.includes("T")) {
		const parsed = new Date(normalized);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	}

	const [h, m, s] = normalized.split(":").map(Number);
	if ([h, m, s].some((n) => Number.isNaN(n))) return null;

	const now = new Date();
	return new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
		h,
		m,
		s || 0,
	);
};

const Attendance = () => {
	const {
		dayAttendance,
		todayStats,
		employeeDashboard,
		fetchDayAttendance,
		fetchWeekAttendance,
		fetchTodayStats,
		fetchEmployeeDashboard,
		clockIn,
		clockOut,
		qrCode,
		lastQrAction,
		isLoading,
		error,
		fetchQrCode,
		clockWithQr,
	} = useAttendanceStore();

	const { employees, fetchEmployees } = useEmployeeStore();
	const { isAdmin } = useAuthStore();

	const [time, setTime] = useState(new Date());
	const [searchQuery, setSearchQuery] = useState("");
	const [showQrModal, setShowQrModal] = useState(false);
	const [showScanModal, setShowScanModal] = useState(false);
	const [qrInput, setQrInput] = useState("");
	const [scanMessage, setScanMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [attendancePhase, setAttendancePhase] = useState<
		"idle" | "clocked_in" | "clocked_out"
	>("idle");
	const [localClockInAt, setLocalClockInAt] = useState<Date | null>(null);
	const fetchedOnce = useRef(false);
	const dateKey = new Date();
	const localDateKey = `${dateKey.getFullYear()}-${String(
		dateKey.getMonth() + 1,
	).padStart(2, "0")}-${String(dateKey.getDate()).padStart(2, "0")}`;
	const todayKey = `attendance:${localDateKey}`;

	useEffect(() => {
		if (fetchedOnce.current) return;
		fetchedOnce.current = true;

		if (isAdmin) {
			fetchTodayStats();
			fetchEmployees();
			fetchDayAttendance();
			fetchWeekAttendance();
		} else {
			fetchEmployeeDashboard();
		}
	}, [
		isAdmin,
		fetchEmployees,
		fetchTodayStats,
		fetchDayAttendance,
		fetchWeekAttendance,
		fetchEmployeeDashboard,
	]);

	useEffect(() => {
		const timer = setInterval(() => setTime(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	const employeeToday = employeeDashboard?.today || todayStats;
	const clockInTimeValue =
		employeeToday?.clockIn ||
		employeeToday?.clockInTime ||
		employeeToday?.checkedInAt ||
		employeeToday?.clockedIn;
	const clockOutTimeValue =
		employeeToday?.clockOut ||
		employeeToday?.clockOutTime ||
		employeeToday?.checkedOutAt ||
		employeeToday?.clockedOut;

	const hasClockedIn = Boolean(
		clockInTimeValue ||
			employeeToday?.status === "Present",
	);

	const hasClockedOut = Boolean(
		clockOutTimeValue || employeeToday?.checkedOut,
	);
	const effectiveHasClockedIn =
		attendancePhase === "clocked_in" || attendancePhase === "clocked_out";
	const effectiveHasClockedOut = attendancePhase === "clocked_out";

	const baseWorkDuration =
		employeeToday?.workDuration ||
		employeeToday?.timeSpent ||
		employeeToday?.duration ||
		employeeToday?.hoursWorked ||
		"00:00:00";
	const liveClockInDate = parseClockTimeToDate(clockInTimeValue);
	const liveWorkDuration =
		attendancePhase === "clocked_in" && localClockInAt
			? formatDuration(time.getTime() - localClockInAt.getTime())
			: effectiveHasClockedIn && !effectiveHasClockedOut && liveClockInDate
			? formatDuration(time.getTime() - liveClockInDate.getTime())
			: baseWorkDuration;

	const remainingTime =
		employeeToday?.remainingTime ||
		employeeToday?.timeLeft ||
		"7h 55m left today";

	const checkedInTime =
		(localClockInAt
			? localClockInAt.toLocaleTimeString("en-GB", {
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
			  })
			: "") ||
		clockInTimeValue ||
		employeeToday?.checkedInAt ||
		"09:09:23";

	useEffect(() => {
		const persistedRaw = localStorage.getItem(todayKey);
		if (persistedRaw) {
			try {
				const persisted = JSON.parse(persistedRaw);
				if (persisted?.phase === "clocked_in") {
					setAttendancePhase("clocked_in");
					const parsed = parseClockTimeToDate(persisted?.clockInTime);
					if (parsed) setLocalClockInAt(parsed);
					return;
				}
				if (persisted?.phase === "clocked_out") {
					setAttendancePhase("clocked_out");
					const parsed = parseClockTimeToDate(persisted?.clockInTime);
					if (parsed) setLocalClockInAt(parsed);
					return;
				}
			} catch {
				// ignore malformed local state
			}
		}
	}, [todayKey]);

	useEffect(() => {
		// Backup behavior: if backend dashboard eventually includes today info,
		// sync phase only when local phase is still idle.
		if (attendancePhase !== "idle") return;
		if (hasClockedOut) {
			setAttendancePhase("clocked_out");
			const parsed = parseClockTimeToDate(clockInTimeValue);
			if (parsed) setLocalClockInAt(parsed);
			return;
		}
		if (hasClockedIn) {
			setAttendancePhase("clocked_in");
			const parsed = parseClockTimeToDate(clockInTimeValue);
			if (parsed) setLocalClockInAt(parsed);
		}
	}, [attendancePhase, hasClockedIn, hasClockedOut, clockInTimeValue]);

	const filteredEmployees = useMemo(() => {
		return employees.filter(
			(emp: any) =>
				emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				emp.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				emp.email?.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [employees, searchQuery]);

	const handleClockIn = async (employeeId: string) => {
		await clockIn(employeeId);
		await fetchTodayStats();
	};

	const handleClockOut = async (employeeId: string) => {
		await clockOut(employeeId);
		await fetchTodayStats();
	};

	const handleQrSubmit = useCallback(
		async (value?: string) => {
			const qrData = value || qrInput;

			if (!qrData.trim()) {
				setScanMessage("Please scan or paste a valid QR code.");
				return;
			}

			const result = await clockWithQr(qrData.trim());

			if (result.success) {
				const action = result.action || lastQrAction;

				setShowScanModal(false);
				setQrInput("");
				setScanMessage("");
				await fetchEmployeeDashboard();

				// Use backend action source of truth from POST /attendance/qr response.
				if (action === "clock-in") {
					const nowTime = new Date();
					setAttendancePhase("clocked_in");
					setLocalClockInAt(nowTime);
					localStorage.setItem(
						todayKey,
						JSON.stringify({
							phase: "clocked_in",
							clockInTime: nowTime.toTimeString().slice(0, 8),
						}),
					);
					setSuccessMessage("Clock-in recorded successfully.");
				} else if (action === "clock-out") {
					setAttendancePhase("clocked_out");
					localStorage.setItem(
						todayKey,
						JSON.stringify({
							phase: "clocked_out",
							clockInTime: localClockInAt
								? localClockInAt.toTimeString().slice(0, 8)
								: "",
						}),
					);
					setSuccessMessage("Clock-out recorded successfully.");
				} else {
					// Fallback toggle if action is unexpectedly missing.
					if (attendancePhase === "clocked_in") {
						setAttendancePhase("clocked_out");
						setSuccessMessage("Clock-out recorded successfully.");
					} else {
						const nowTime = new Date();
						setAttendancePhase("clocked_in");
						setLocalClockInAt(nowTime);
						setSuccessMessage("Clock-in recorded successfully.");
					}
				}
				setTimeout(() => setSuccessMessage(""), 3500);
			} else {
				setScanMessage(
					"QR verification failed. Please scan the active admin QR code.",
				);
			}
		},
		[
			qrInput,
			clockWithQr,
			fetchEmployeeDashboard,
			attendancePhase,
			lastQrAction,
			localClockInAt,
			todayKey,
		],
	);

	const days = [
		{ date: 1, day: "Sun", status: "neutral" },
		{ date: 2, day: "Mon", status: "punctual" },
		{ date: 3, day: "Tue", status: "late" },
		{ date: 4, day: "Wed", status: "punctual" },
		{ date: 5, day: "Fri", status: "holiday" },
		{ date: 6, day: "Sat", status: "weekend" },
		{ date: 7, day: "Sun", status: "weekend" },
		{ date: 8, day: "Mon", status: "active" },
		{ date: 9, day: "Tue", status: "holiday" },
	];

	const statusStyles: Record<string, string> = {
		punctual: "border-emerald-300 text-emerald-600 bg-emerald-50",
		late: "border-orange-300 text-orange-600 bg-orange-50",
		holiday: "border-pink-300 text-pink-600 bg-pink-50",
		weekend: "border-slate-200 text-slate-500 bg-slate-50",
		active:
			"border-violet-500 text-violet-700 bg-violet-50 ring-2 ring-violet-100",
		neutral: "border-slate-200 text-slate-500 bg-white",
	};

	if (!isAdmin) {
		return (
			<div className="w-full max-w-5xl mx-auto pb-12">
				<div className="flex flex-col items-start justify-between gap-3 mb-6 sm:flex-row sm:gap-4">
					<div>
						<h2 className="text-lg font-semibold text-slate-900">
							Attendance
						</h2>
						<p className="text-sm text-slate-500">
							Scan your workplace QR code to check in or out.
						</p>
					</div>

					<div className="flex items-center gap-2 text-xs text-slate-500">
						<CalendarDays size={14} />
						<span>
							{time.toLocaleDateString("en-GB", {
								month: "long",
								year: "numeric",
							})}
						</span>
					</div>
				</div>

				<div className="ios-scroll flex gap-2 overflow-x-auto pb-3 mb-6 sm:mb-8">
					{days.map((item) => (
						<div
							key={`${item.date}-${item.day}`}
							className={`min-w-12 rounded-full border px-3 py-2 text-center ${statusStyles[item.status]}`}
						>
							<p className="text-xs font-semibold">{item.date}</p>
							<p className="text-[10px]">{item.day}</p>
						</div>
					))}
				</div>

				<div className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-6">
					<div className="flex flex-col items-center justify-center py-6 sm:py-8">
						<div className="relative flex h-56 w-56 items-center justify-center rounded-full border-[10px] border-violet-200 bg-white shadow-[0_0_35px_rgba(124,58,237,0.18)] sm:h-64 sm:w-64">
							<div className="absolute inset-[-10px] rounded-full border-[10px] border-violet-500 border-r-violet-200" />

							<div className="relative z-10 text-center px-6">
								{attendancePhase === "clocked_in" ? (
									<>
										<p className="text-xs text-slate-500 mb-2">
											Work duration
										</p>
										<h1 className="text-3xl font-bold text-slate-900 tabular-nums">
											{liveWorkDuration}
										</h1>
										<div className="mt-3 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-slate-700">
											<Clock size={12} />
											{remainingTime}
										</div>
									</>
								) : (
									<span className="text-xl font-semibold text-slate-900">
										{attendancePhase === "clocked_out"
											? "Checked-out"
											: "Check-in"}
									</span>
								)}
							</div>
						</div>

						<button
							onClick={() => setShowScanModal(true)}
							disabled={isLoading || attendancePhase === "clocked_out"}
							className={`mt-8 inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-semibold text-white transition disabled:opacity-70 ${
								effectiveHasClockedIn && !effectiveHasClockedOut
									? "bg-rose-500 hover:bg-rose-600"
									: "bg-violet-600 hover:bg-violet-700"
							}`}
						>
							{isLoading ? (
								<Loader2 className="animate-spin" size={18} />
							) : (
								<ScanLine size={18} />
							)}
							{attendancePhase === "clocked_in"
								? "Scan QR to check out"
								: attendancePhase === "clocked_out"
								? "Attendance complete"
								: "Scan QR to check in"}
						</button>

						{effectiveHasClockedIn && (
							<div className="mt-6 w-full rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
								Checked in: {checkedInTime}
							</div>
						)}
						{attendancePhase === "clocked_out" && (
							<div className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
								Checked-out
							</div>
						)}
						{successMessage && (
							<div className="mt-4 flex w-full items-start gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
								<CheckCircle2 size={16} className="mt-0.5 shrink-0" />
								<span>{successMessage}</span>
							</div>
						)}

						{error && (
							<div className="mt-4 flex w-full items-start gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
								<AlertCircle size={16} className="mt-0.5 shrink-0" />
								<span>{error}</span>
							</div>
						)}
					</div>

					<div className="rounded-2xl border border-slate-100 bg-white p-4">
						<div className="flex items-center justify-between mb-3">
							<p className="text-sm font-semibold text-slate-900">Note</p>
							<Clock size={14} className="text-slate-400" />
						</div>

						<div className="grid grid-cols-1 gap-3 text-xs text-slate-600 min-[380px]:grid-cols-2">
							<div className="flex items-center gap-2">
								<span className="h-2 w-7 rounded-full bg-emerald-300" />
								Punctual
							</div>
							<div className="flex items-center gap-2">
								<span className="h-2 w-7 rounded-full bg-slate-300" />
								Sunday & Saturdays
							</div>
							<div className="flex items-center gap-2">
								<span className="h-2 w-7 rounded-full bg-orange-300" />
								Warning/Late
							</div>
							<div className="flex items-center gap-2">
								<span className="h-2 w-7 rounded-full bg-pink-300" />
								Public holidays
							</div>
						</div>
					</div>
				</div>

				{showScanModal && (
					<ScanQrModal
						isLoading={isLoading}
						qrInput={qrInput}
						setQrInput={setQrInput}
						scanMessage={scanMessage}
						onClose={() => {
							setShowScanModal(false);
							setQrInput("");
							setScanMessage("");
						}}
						onSubmit={handleQrSubmit}
					/>
				)}
			</div>
		);
	}

	return (
		<div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
			<div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
				<div>
					<h2 className="text-xl font-semibold text-gray-800 mb-1">
						Attendance Tracking
					</h2>
					<p className="text-sm text-gray-500">
						Generate today’s QR code and monitor employee attendance.
					</p>
				</div>

				<div className="text-left sm:text-right w-full sm:w-auto p-4 bg-white rounded-2xl border border-gray-100 sm:bg-transparent sm:border-0 sm:p-0">
					<p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
						Current Time
					</p>
					<div className="text-2xl font-bold text-gray-900 tabular-nums">
						{formatTime(time)}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
				<StatCard
					label="Present Today"
					value={todayStats?.present || 0}
					tone="indigo"
				/>
				<StatCard
					label="Late Arrivals"
					value={todayStats?.late || 0}
					tone="amber"
				/>
				<StatCard
					label="Absent Today"
					value={todayStats?.absent || 0}
					tone="rose"
				/>
				<StatCard
					label="Attendance Rate"
					value={todayStats?.rate || "0%"}
					tone="emerald"
				/>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 space-y-4">
					<div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
						<div className="p-6 border-b border-gray-100">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
								<div>
									<h3 className="font-bold text-gray-900">
										Manage Attendance
									</h3>
									<p className="mt-1 text-xs text-gray-500">
										Admins can manually correct attendance when needed.
									</p>
								</div>

								<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
									<span className="hidden sm:inline-block text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full font-semibold">
										{employees.length} Employees
									</span>

									<button
										onClick={() => {
											fetchQrCode();
											setShowQrModal(true);
										}}
										className="flex items-center justify-center gap-1.5 text-xs bg-[#3B00D9] text-white px-3 py-2 rounded-full font-medium hover:bg-indigo-700 transition-colors shadow-sm"
									>
										<QrCode size={14} />
										Show Today’s QR
									</button>
								</div>
							</div>

							<div className="relative">
								<Search
									className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
									size={16}
								/>
								<input
									type="text"
									placeholder="Search employee..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] text-sm"
								/>
							</div>
						</div>

						<div className="ios-scroll overflow-x-auto">
							<table className="w-full min-w-[680px] text-left text-sm text-gray-600 whitespace-nowrap">
								<thead className="bg-gray-50/50 text-gray-800 font-medium border-b border-gray-100">
									<tr>
										<th className="px-6 py-4">Employee</th>
										<th className="px-6 py-4">Role</th>
										<th className="px-6 py-4 text-right">Manual Action</th>
									</tr>
								</thead>

								<tbody className="divide-y divide-gray-50">
									{filteredEmployees.map((emp: any) => {
										const employeeId = emp._id || emp.id;
										const isClockedIn = dayAttendance.some(
											(record: any) =>
												(record.employeeId === employeeId ||
													record.employeeId?._id === employeeId ||
													record.employee?._id === employeeId) &&
												!record.clockOut &&
												!record.clockOutTime,
										);

										return (
											<tr
												key={employeeId}
												className="hover:bg-gray-50/40 transition-colors"
											>
												<td className="px-6 py-4">
													<div className="flex items-center gap-3">
														<div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-[#3B00D9] font-bold text-xs">
															{emp.name?.charAt(0) || "E"}
														</div>
														<div>
															<p className="font-semibold text-gray-900">
																{emp.name}
															</p>
															<p className="text-[10px] text-gray-400">
																{emp.email}
															</p>
														</div>
													</div>
												</td>

												<td className="px-6 py-4 text-xs font-medium text-gray-500">
													{emp.role || "Employee"}
												</td>

												<td className="px-6 py-4 text-right">
													{isClockedIn ? (
														<button
															onClick={() => handleClockOut(employeeId)}
															className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors"
														>
															<UserMinus size={14} />
															Clock Out
														</button>
													) : (
														<button
															onClick={() => handleClockIn(employeeId)}
															className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
														>
															<UserPlus size={14} />
															Clock In
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
												className="px-6 py-10 text-center text-gray-400 text-xs italic"
											>
												No employees found.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				<div className="space-y-4">
					<div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
						<div className="p-6 border-b border-gray-100">
							<h3 className="font-bold text-gray-900">Today’s Logs</h3>
							<p className="mt-1 text-xs text-gray-500">
								{formatDate(time)}
							</p>
						</div>

						<div className="p-4 space-y-4 max-h-125 overflow-y-auto">
							{dayAttendance.length > 0 ? (
								dayAttendance.map((record: any, idx: number) => (
									<div
										key={record.id || record._id || idx}
										className="flex gap-3 p-3 rounded-xl bg-gray-50/50 border border-gray-100"
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

										<div className="min-w-0 flex-1">
											<p className="text-xs font-bold text-gray-900 truncate">
												{record.employeeName ||
													record.employee?.name ||
													record.employeeId?.name ||
													"Employee"}
											</p>
											<p className="text-[10px] text-gray-500">
												{record.clockOut || record.clockOutTime
													? `Out: ${record.clockOut || record.clockOutTime}`
													: `In: ${record.clockIn || record.clockInTime || "-"}`}
											</p>
										</div>

										<div className="ml-auto">
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
								<div className="text-center py-10 text-gray-400 text-xs italic">
									No activity logs yet today.
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{showQrModal && (
				<AdminQrModal
					qrCode={qrCode}
					isLoading={isLoading}
					onClose={() => setShowQrModal(false)}
				/>
			)}
		</div>
	);
};

const StatCard = ({
	label,
	value,
	tone,
}: {
	label: string;
	value: string | number;
	tone: "indigo" | "amber" | "rose" | "emerald";
}) => {
	const tones = {
		indigo: "text-indigo-500 shadow-indigo-500/5",
		amber: "text-amber-500 shadow-amber-500/5",
		rose: "text-rose-500 shadow-rose-500/5",
		emerald: "text-emerald-500 shadow-emerald-500/5",
	};

	return (
		<div
			className={`bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm ${tones[tone]}`}
		>
			<p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 sm:mb-2">
				{label}
			</p>
			<h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
				{value}
			</h3>
		</div>
	);
};

const AdminQrModal = ({
	qrCode,
	isLoading,
	onClose,
}: {
	qrCode: any;
	isLoading: boolean;
	onClose: () => void;
}) => {
	const handleDownloadQr = async () => {
		try {
			if (typeof qrCode !== "string") return;

			const filename = `attendance-qr-${new Date()
				.toISOString()
				.slice(0, 10)}.png`;

			if (qrCode.startsWith("data:image")) {
				const link = document.createElement("a");
				link.href = qrCode;
				link.download = filename;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				return;
			}

			if (qrCode.startsWith("http")) {
				const response = await fetch(qrCode);
				const blob = await response.blob();
				const objectUrl = URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = objectUrl;
				link.download = filename;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(objectUrl);
			}
		} catch (error) {
			console.error("Failed to download QR code:", error);
		}
	};

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
			<div className="mobile-safe-bottom bg-white rounded-t-3xl shadow-2xl w-full max-w-sm p-6 relative sm:rounded-3xl">
				<button
					onClick={onClose}
					className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
				>
					<X size={20} />
				</button>

				<h3 className="text-xl font-bold text-gray-900 mb-2">
					Today’s QR Code
				</h3>
				<p className="text-sm text-gray-500 mb-6">
					Display this for employees to scan. Do not share it outside your
					workplace.
				</p>

				<div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-8 border border-gray-100 min-h-[250px]">
					{isLoading && !qrCode ? (
						<Loader2 className="animate-spin text-[#3B00D9]" size={32} />
					) : qrCode ? (
						<div className="text-center w-full">
							<div className="w-48 h-48 bg-white p-2 border border-gray-200 rounded-xl shadow-sm mb-4 mx-auto flex items-center justify-center overflow-hidden">
								{typeof qrCode === "string" &&
								(qrCode.startsWith("http") ||
									qrCode.startsWith("data:image")) ? (
									<img
										src={qrCode}
										alt="Today's QR"
										className="max-w-full max-h-full"
									/>
								) : (
									<div className="text-[10px] break-all text-gray-600 p-2 font-mono bg-gray-50 rounded w-full h-full overflow-auto">
										{typeof qrCode === "object"
											? JSON.stringify(qrCode)
											: qrCode}
									</div>
								)}
							</div>

							<p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
								Unique Daily Code
							</p>
							<button
								type="button"
								onClick={handleDownloadQr}
								className="mt-4 inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
							>
								Download QR
							</button>
						</div>
					) : (
						<p className="text-sm text-rose-500 font-medium">
							Failed to load QR code.
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

const ScanQrModal = ({
	isLoading,
	qrInput,
	setQrInput,
	scanMessage,
	onClose,
	onSubmit,
}: {
	isLoading: boolean;
	qrInput: string;
	setQrInput: (value: string) => void;
	scanMessage: string;
	onClose: () => void;
	onSubmit: (value?: string) => void;
}) => {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const scannerRef = useRef<QrScanner | null>(null);

	const [cameraError, setCameraError] = useState("");
	const [isCameraReady, setIsCameraReady] = useState(false);
	const [hasScanned, setHasScanned] = useState(false);

	useEffect(() => {
		if (!videoRef.current) return;

		const scanner = new QrScanner(
			videoRef.current,
			async (result) => {
				const scannedValue =
					typeof result === "string" ? result : result.data;

				if (!scannedValue || hasScanned) return;

				setHasScanned(true);
				setQrInput(scannedValue);

				scanner.stop();
				await onSubmit(scannedValue);
			},
			{
				preferredCamera: "environment",
				highlightScanRegion: false,
				highlightCodeOutline: false,
				maxScansPerSecond: 5,
			},
		);

		scannerRef.current = scanner;

		scanner
			.start()
			.then(() => {
				setIsCameraReady(true);
				setCameraError("");
			})
			.catch(() => {
				setCameraError(
					"Camera access failed. Allow camera permission or paste the QR data manually.",
				);
			});

		return () => {
			scanner.stop();
			scanner.destroy();
			scannerRef.current = null;
		};
	}, [hasScanned, onSubmit, setQrInput]);

	return (
		<div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
			<div className="relative h-[100dvh] w-full max-w-md overflow-hidden bg-black text-white sm:h-[760px] sm:rounded-[2rem]">
				<button
					onClick={() => {
						scannerRef.current?.stop();
						onClose();
					}}
					className="absolute right-4 top-4 z-30 rounded-full border border-white/30 p-1 text-white"
				>
					<X size={18} />
				</button>

				<div className="relative z-10 p-6">
					<h3 className="text-lg font-semibold">Scan QR Code</h3>
					<p className="mt-1 text-sm text-white/70">
						Point your camera at the admin attendance QR code.
					</p>
				</div>

				<div className="relative z-10 mt-6 flex justify-center px-4 sm:mt-10 sm:px-6">
					<div className="relative h-72 w-full overflow-hidden rounded-3xl border border-white/20 bg-slate-900 sm:h-80">
						<video
							ref={videoRef}
							className="h-full w-full object-cover"
							muted
							playsInline
						/>

						<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
							<div className="relative h-52 w-52 rounded-3xl border-2 border-white/90 sm:h-64 sm:w-64">
								<div className="absolute left-0 top-0 h-10 w-10 rounded-tl-3xl border-l-4 border-t-4 border-white" />
								<div className="absolute right-0 top-0 h-10 w-10 rounded-tr-3xl border-r-4 border-t-4 border-white" />
								<div className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-3xl border-b-4 border-l-4 border-white" />
								<div className="absolute bottom-0 right-0 h-10 w-10 rounded-br-3xl border-b-4 border-r-4 border-white" />
								<div className="absolute left-6 right-6 top-1/2 h-0.5 bg-violet-400 shadow-[0_0_20px_rgba(167,139,250,0.9)]" />
							</div>
						</div>

						{!isCameraReady && !cameraError && (
							<div className="absolute inset-0 flex items-center justify-center bg-black/60">
								<Loader2 className="animate-spin text-white" size={28} />
							</div>
						)}
					</div>
				</div>

				<div className="mobile-safe-bottom absolute bottom-0 left-0 right-0 z-20 rounded-t-3xl bg-white p-5 text-slate-900">
					{cameraError ? (
						<div className="mb-3 flex items-start gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-xs text-rose-600">
							<AlertCircle size={16} className="mt-0.5 shrink-0" />
							<span>{cameraError}</span>
						</div>
					) : (
						<div className="mb-3 flex items-center gap-2 rounded-2xl bg-violet-50 px-4 py-3 text-xs text-violet-700">
							<ScanLine size={16} />
							Camera scanner active. Hold the QR code inside the frame.
						</div>
					)}

					<input
						type="text"
						value={qrInput}
						onChange={(e) => setQrInput(e.target.value)}
						placeholder="Paste QR data manually..."
						className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
					/>

					{scanMessage && (
						<p className="mt-2 flex items-start gap-2 text-xs text-rose-600">
							<AlertCircle size={14} className="mt-0.5 shrink-0" />
							{scanMessage}
						</p>
					)}

					<button
						onClick={() => onSubmit()}
						disabled={isLoading || !qrInput.trim()}
						className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-70"
					>
						{isLoading ? (
							<Loader2 className="animate-spin" size={18} />
						) : (
							<CheckCircle2 size={18} />
						)}
						Verify QR Attendance
					</button>
				</div>
			</div>
		</div>
	);
};

export default Attendance;
