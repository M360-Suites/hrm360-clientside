import { create } from "zustand";
import api from "../api/axios";
import { getCookie } from "../utils/cookies";

interface AttendanceState {
	dayAttendance: any[];
	weekAttendance: any[];
	weekOverview: any | null;
	todayStats: any | null;
	employeeDashboard: any | null;
	lastQrAction: "clock-in" | "clock-out" | null;
	isLoading: boolean;
	error: string | null;
	fetchDayAttendance: () => Promise<void>;
	fetchWeekOverview: () => Promise<void>;
	fetchWeekAttendance: () => Promise<void>;
	fetchTodayStats: () => Promise<void>;
	fetchEmployeeDashboard: () => Promise<void>;
	clockIn: (employeeId: string) => Promise<void>;
	clockOut: (employeeId: string) => Promise<void>;
	qrCode: any | null;
	fetchQrCode: () => Promise<void>;
	clockWithQr: (
		qrData: string,
	) => Promise<{ success: boolean; action?: "clock-in" | "clock-out" }>;
}

const getErrorMessage = (error: any, fallback: string) =>
	error?.response?.data?.message?.message ||
	error?.response?.data?.message ||
	error?.response?.data?.error ||
	error?.message ||
	fallback;

const normalizeAttendanceRecord = (record: any) => {
	const employeeObj =
		typeof record?.employee === "object"
			? record.employee
			: typeof record?.employeeId === "object"
				? record.employeeId
				: null;

	return {
		...record,
		employee: employeeObj || null,
		employeeId:
			record?.employeeId ||
			employeeObj?._id ||
			employeeObj?.id ||
			record?.employee ||
			null,
		employeeName:
			record?.employeeName || employeeObj?.name || "Employee",
		clockIn: record?.clockIn || record?.clockInTime || "",
		clockOut: record?.clockOut || record?.clockOutTime || "",
		clockInTime: record?.clockInTime || record?.clockIn || "",
		clockOutTime: record?.clockOutTime || record?.clockOut || "",
		timeSpent: record?.timeSpent || record?.workDuration || record?.duration || "",
		status: record?.status || "Present",
	};
};

const normalizeEmployeeDashboard = (data: any) => {
	if (!data || typeof data !== "object") return {};

	const todayRaw =
		data?.today || data?.attendanceToday || data?.attendance || data?.data || data;

	const today =
		todayRaw && typeof todayRaw === "object"
			? {
					...todayRaw,
					clockIn:
						todayRaw?.clockIn ||
						todayRaw?.clockInTime ||
						todayRaw?.checkedInAt ||
						"",
					clockOut:
						todayRaw?.clockOut ||
						todayRaw?.clockOutTime ||
						todayRaw?.checkedOutAt ||
						"",
					clockInTime:
						todayRaw?.clockInTime ||
						todayRaw?.clockIn ||
						todayRaw?.checkedInAt ||
						"",
					clockOutTime:
						todayRaw?.clockOutTime ||
						todayRaw?.clockOut ||
						todayRaw?.checkedOutAt ||
						"",
					timeSpent:
						todayRaw?.timeSpent ||
						todayRaw?.workDuration ||
						todayRaw?.duration ||
						todayRaw?.hoursWorked ||
						"",
				}
			: {};

	return { ...data, today };
};

const getOrgConfig = () => {
	const orgId = getCookie("orgId");
	if (!orgId) {
		throw new Error(
			"Organization ID missing. Please complete onboarding first.",
		);
	}
	return {
		headers: {
			"x-org-id": orgId,
		},
	};
};

export const useAttendanceStore = create<AttendanceState>(
	(set, get) => ({
		dayAttendance: [],
		weekAttendance: [],
		weekOverview: null,
		todayStats: null,
		employeeDashboard: null,
		lastQrAction: null,
		qrCode: null,
		isLoading: false,
		error: null,

		fetchDayAttendance: async () => {
			set({ isLoading: true, error: null });
			try {
				const response = await api.get("/attendance", getOrgConfig());
				let data = response.data?.data || response.data;
				if (!Array.isArray(data) && typeof data === "object") {
					data =
						data.attendance ||
						Object.values(data).find((val) => Array.isArray(val)) ||
						[];
				}
				set({
					dayAttendance: Array.isArray(data)
						? data.map(normalizeAttendanceRecord)
						: [],
					isLoading: false,
				});
			} catch (error: any) {
				set({
					error: getErrorMessage(error, "Failed to fetch day attendance"),
					isLoading: false,
				});
			}
		},

		fetchWeekOverview: async () => {
			set({ isLoading: true, error: null });
			try {
				const response = await api.get("/attendance/overview", getOrgConfig());
				set({
					weekOverview: response.data.data || response.data,
					isLoading: false,
				});
			} catch (error: any) {
				set({
					error: getErrorMessage(error, "Failed to fetch week overview"),
					isLoading: false,
				});
			}
		},

		fetchWeekAttendance: async () => {
			set({ isLoading: true, error: null });
			try {
				const response = await api.get("/attendance/week", getOrgConfig());
				const data = response.data?.data || response.data;
				const logs = Array.isArray(data)
					? data
					: Array.isArray(data?.attendance)
						? data.attendance
						: Array.isArray(data?.logs)
							? data.logs
							: [];
				set({
					weekAttendance: logs.map(normalizeAttendanceRecord),
					isLoading: false,
				});
			} catch (error: any) {
				set({
					error: getErrorMessage(error, "Failed to fetch week attendance"),
					isLoading: false,
				});
			}
		},

		fetchTodayStats: async () => {
			set({ isLoading: true, error: null });
			try {
				const response = await api.get("/attendance/stats", getOrgConfig());
				set({
					todayStats: response.data.data || response.data,
					isLoading: false,
				});
			} catch (error: any) {
				set({
					error: getErrorMessage(error, "Failed to fetch today stats"),
					isLoading: false,
				});
			}
		},

		fetchEmployeeDashboard: async () => {
			set({ isLoading: true, error: null });
			try {
				const response = await api.get(
					"/attendance/employee-dashboard",
					getOrgConfig(),
				);
				const data = response.data?.data || response.data;
				set({
					employeeDashboard: normalizeEmployeeDashboard(data),
					isLoading: false,
				});
			} catch (error: any) {
				set({
					error: getErrorMessage(error, "Failed to fetch employee dashboard"),
					isLoading: false,
				});
			}
		},

		clockIn: async (employeeId) => {
			set({ isLoading: true, error: null });
			try {
				await api.post("/attendance/clockIn", { employeeId });
				await get().fetchDayAttendance();
			} catch (error: any) {
				console.error("Clock In Error:", error.response?.data);
				set({
					error: getErrorMessage(error, "Clock in failed"),
					isLoading: false,
				});
			}
		},

		clockOut: async (employeeId) => {
			set({ isLoading: true, error: null });
			try {
				await api.post("/attendance/clockOut", { employeeId });
				await get().fetchDayAttendance();
			} catch (error: any) {
				console.error("Clock Out Error:", error.response?.data);
				set({
					error: getErrorMessage(error, "Clock out failed"),
					isLoading: false,
				});
			}
		},

		fetchQrCode: async () => {
			set({ isLoading: true, error: null });
			try {
				const response = await api.get(
					"/attendance/qr-code",
					getOrgConfig(),
				);
				const data = response.data?.data || response.data;
				set({
					qrCode: data?.qrCodeImage || data?.qrCode || data,
					isLoading: false,
				});
			} catch (error: any) {
				set({
					error: getErrorMessage(error, "Failed to fetch QR code"),
					isLoading: false,
				});
			}
		},

		clockWithQr: async (qrData) => {
			set({ isLoading: true, error: null });
			try {
				const response = await api.post(
					"/attendance/qr",
					{
						qrData,
						location: {},
						deviceInfo: {},
					},
					getOrgConfig(),
				);
				const data = response.data?.data || response.data;
				const action = data?.action as "clock-in" | "clock-out" | undefined;
				set({ isLoading: false, error: null, lastQrAction: action || null });
				return { success: true, action };
			} catch (error: any) {
				console.error("Clock with QR Error:", error.response?.data);
				set({
					error: getErrorMessage(error, "Clock in/out with QR failed"),
					isLoading: false,
				});
				return { success: false };
			}
		},
	}),
);
