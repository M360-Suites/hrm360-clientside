import { create } from "zustand";
import api from "../api/axios";

export interface OffboardingTask {
  _id: string;
  name: string;
  completed: boolean;
  activityId?: string;
}

export interface ExitRequest {
  _id: string;
  id?: string;
  employeeId: any;
  employee?: any;
  employeeName?: string;
  employeeEmail?: string;
  employeeRole?: string;
  exitType: "Resignation" | "Contract End" | "Termination" | string;
  lastDay: string;
  status: "Pending" | "Approved" | "Terminated" | "In Progress" | "Completed" | string;
  hrNote?: string;
  doc?: string;
  offboardingProgress?: OffboardingTask[];
  createdAt: string;
  updatedAt: string;
}

export interface ExitStats {
  total: number;
  pending: number;
  approved: number;
  terminated: number;
  completed: number;
}

interface InitiateExitPayload {
  employeeId?: string;
  exitType: string;
  lastDay: string;
  hrNote?: string;
  doc?: string;
}

interface ExitState {
  exits: ExitRequest[];
  userExits: ExitRequest[];
  stats: ExitStats | null;
  selectedExit: ExitRequest | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  
  fetchExits: (query?: string, exitType?: string) => Promise<void>;
  fetchExitStats: () => Promise<void>;
  fetchUserExits: () => Promise<void>;
  fetchExitDetails: (exitId: string) => Promise<void>;
  initiateExit: (payload: InitiateExitPayload) => Promise<boolean>;
  initiateUserExit: (payload: { exitType?: string; lastDay?: string; exitId?: string; action?: string }) => Promise<boolean>;
  updateExitRequest: (exitId: string, action: string) => Promise<boolean>;
  updateOffboardingProgress: (exitId: string, activityId: string, completed: boolean) => Promise<boolean>;
}

export const useExitStore = create<ExitState>((set, get) => ({
  exits: [],
  userExits: [],
  stats: null,
  selectedExit: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchExits: async (query = "", exitType = "") => {
    set({ isLoading: true, error: null });
    try {
      const params: any = {};
      if (query) params.query = query;
      if (exitType && exitType !== "All") params.exitType = exitType;
      
      const res = await api.get("/exit", { params });
      set({ exits: res.data.data?.exits || res.data.data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch exits", isLoading: false });
    }
  },

  fetchExitStats: async () => {
    try {
      const res = await api.get("/exit/stats");
      set({ stats: res.data.data });
    } catch (error) {
      console.error("Failed to fetch exit stats", error);
    }
  },

  fetchUserExits: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/exit/user");
      set({ userExits: res.data.data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch user exits", isLoading: false });
    }
  },

  fetchExitDetails: async (exitId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/exit/${exitId}`);
      set({ selectedExit: res.data.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch exit details", isLoading: false });
    }
  },

  initiateExit: async (payload: InitiateExitPayload) => {
    set({ isSubmitting: true, error: null });
    try {
      await api.post("/exit", payload);
      set({ isSubmitting: false });
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to initiate exit", isSubmitting: false });
      return false;
    }
  },

  initiateUserExit: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      await api.post("/exit/user", payload);
      set({ isSubmitting: false });
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to initiate resignation", isSubmitting: false });
      return false;
    }
  },

  updateExitRequest: async (exitId: string, action: string) => {
    set({ isSubmitting: true, error: null });
    try {
      await api.put("/exit", { exitId, action });
      set({ isSubmitting: false });
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || `Failed to ${action.toLowerCase()} exit`, isSubmitting: false });
      return false;
    }
  },

  updateOffboardingProgress: async (exitId: string, activityId: string, completed: boolean) => {
    try {
      await api.patch("/exit", { exitId, activityId, completed });
      return true;
    } catch (error: any) {
      console.error("Failed to update offboarding progress", error);
      return false;
    }
  },
}));
