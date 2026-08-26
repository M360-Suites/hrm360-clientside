import { create } from "zustand";
import api from "../api/axios";

export interface Grievance {
	_id: string;
	title: string;
	category: string;
	intensity: "Low" | "Medium" | "High";
	staffs: any[]; // populate staff data
	description: string;
	doc?: string;
	anonymous: boolean;
	status: "Pending" | "In Progress" | "Resolved" | "Dismissed";
	hrFeedback?: string;
	employeeId: any;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
}

export interface GrievanceStats {
	total: number;
	pending: number;
	inProgress: number;
	resolved: number;
	dismissed: number;
	highIntensity: number;
}

export interface GrievanceCategory {
	name: string;
	id?: string;
}

interface FileGrievancePayload {
	title: string;
	category: string;
	intensity: string;
	staffs: string[];
	description: string;
	doc?: string;
	anonymous: boolean;
}

interface GrievanceState {
	grievances: Grievance[];
	stats: GrievanceStats | null;
	categories: string[];
	intensities: string[];
	isLoading: boolean;
	isSubmitting: boolean;
	error: string | null;

	fetchGrievances: (params?: any) => Promise<void>;
	fetchUserGrievances: () => Promise<void>;
	fetchOrgStats: () => Promise<void>;
	fetchUserStats: () => Promise<void>;
	fetchCategories: () => Promise<void>;
	fileGrievance: (payload: FileGrievancePayload) => Promise<void>;
	updateGrievanceStatus: (id: string, status: string, hrFeedback?: string) => Promise<void>;
}

export const useGrievanceStore = create<GrievanceState>((set, get) => ({
	grievances: [],
	stats: null,
	categories: ["Discrimination", "Sexual harassment", "Workplace harassment", "Verbal abuse", "Retaliation", "Policy violation", "Unfair treatment", "Others"],
	intensities: ["Low", "Medium", "High"],
	isLoading: false,
	isSubmitting: false,
	error: null,

	fetchGrievances: async (params = { page: 1, limit: 50 }) => {
		set({ isLoading: true, error: null });
		try {
			const res = await api.get("/grieve", { params });
			set({ grievances: res.data.data?.grievances || res.data.data || [], isLoading: false });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to fetch grievances", isLoading: false });
		}
	},

	fetchUserGrievances: async () => {
		set({ isLoading: true, error: null });
		try {
			const res = await api.get("/grieve/user");
			set({ grievances: res.data.data || [], isLoading: false });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to fetch user grievances", isLoading: false });
		}
	},

	fetchOrgStats: async () => {
		try {
			const res = await api.get("/grieve/stats");
			set({ stats: res.data.data });
		} catch (error) {
			console.error("Failed to fetch org grievance stats", error);
		}
	},

	fetchUserStats: async () => {
		try {
			const res = await api.get("/grieve/user-stats");
			set({ stats: res.data.data });
		} catch (error) {
			console.error("Failed to fetch user grievance stats", error);
		}
	},

	fetchCategories: async () => {
		try {
			const res = await api.get("/grieve/categories");
			if (res.data.data?.categories) {
				set({ categories: res.data.data.categories });
			}
			if (res.data.data?.intensities) {
				set({ intensities: res.data.data.intensities });
			}
		} catch (error) {
			console.error("Failed to fetch grievance categories", error);
		}
	},

	fileGrievance: async (payload: FileGrievancePayload) => {
		set({ isSubmitting: true, error: null });
		try {
			await api.post("/grieve/file", payload);
			set({ isSubmitting: false });
			// Optionally re-fetch after successful submission
			get().fetchUserGrievances();
			get().fetchUserStats();
		} catch (error: any) {
			set({ isSubmitting: false, error: error.response?.data?.message || "Failed to file grievance" });
			throw error;
		}
	},

	updateGrievanceStatus: async (id: string, status: string, hrFeedback?: string) => {
		set({ isSubmitting: true, error: null });
		try {
			await api.put(`/grieve/${id}/status`, { status, hrFeedback });
			set({ isSubmitting: false });
			get().fetchGrievances();
		} catch (error: any) {
			set({ isSubmitting: false, error: error.response?.data?.message || "Failed to update grievance status" });
			throw error;
		}
	}
}));
