import { create } from "zustand";
import api from "../api/axios";
import { getCookie } from "../utils/cookies";
import { useAuthStore } from "./useAuthStore";

interface LeaveState {
  leaves: any[];
  orgStats: any | null;
  userStats: any | null;
  isLoading: boolean;
  error: string | null;
  fetchLeaves: () => Promise<void>;
  fetchEmployeeLeaves: (employeeId: string) => Promise<void>;
  requestLeave: (data: any) => Promise<boolean>;
  approveLeave: (leaveId: string) => Promise<boolean>;
  rejectLeave: (leaveId: string) => Promise<boolean>;
  fetchOrgLeaveStats: () => Promise<void>;
  fetchUserLeaveStats: () => Promise<void>;
}

const getOrgId = () => {
  const orgId = getCookie("orgId");

  if (!orgId) {
    throw new Error("Organization ID missing. Please complete onboarding first.");
  }

  return orgId;
};

const getOrgConfig = () => ({
  headers: {
    "x-org-id": getOrgId(),
  },
});

const normalizeLeaves = (responseData: any) => {
  const data = responseData?.data || responseData?.leaves || responseData;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.leaves)) return data.leaves;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const normalizeUserLeaveStats = (responseData: any) => {
  const root = responseData?.data || responseData;

  if (!root || typeof root !== "object") {
    return {
      stats: { annual: 0, sick: 0, maternity: 0, compassionate: 0, study: 0, total: 0 },
      leaves: [],
    };
  }

  const annual = Array.isArray(root.annual) ? root.annual : [];
  const sick = Array.isArray(root.sick) ? root.sick : [];
  const maternity = Array.isArray(root.maternity) ? root.maternity : [];
  const compassionate = Array.isArray(root.compassionate) ? root.compassionate : [];
  const study = Array.isArray(root.study) ? root.study : [];

  const leaves = [...annual, ...sick, ...maternity, ...compassionate, ...study];

  return {
    stats: {
      annual: annual.length,
      sick: sick.length,
      maternity: maternity.length,
      compassionate: compassionate.length,
      study: study.length,
      total: leaves.length,
    },
    leaves,
  };
};

const cleanPayload = (payload: any) => {
  const cleaned = { ...payload };

  Object.keys(cleaned).forEach((key) => {
    if (
      cleaned[key] === undefined ||
      cleaned[key] === null ||
      cleaned[key] === ""
    ) {
      delete cleaned[key];
    }
  });

  return cleaned;
};

export const useLeaveStore = create<LeaveState>((set, get) => ({
  leaves: [],
  orgStats: null,
  userStats: null,
  isLoading: false,
  error: null,

  fetchLeaves: async () => {
    set({ isLoading: true, error: null });

    try {
      const { isAdmin, user } = useAuthStore.getState();

      if (isAdmin) {
        const response = await api.get("/leave/", getOrgConfig());
        set({ leaves: normalizeLeaves(response.data), isLoading: false, error: null });
        return;
      }

      const response = await api.get("/leave/stats/user", getOrgConfig());
      const { stats, leaves } = normalizeUserLeaveStats(response.data);
      set({
        leaves,
        userStats: {
          annualLeave: stats.annual,
          sickLeave: stats.sick,
          maternityLeave: stats.maternity,
          compassionateLeave: stats.compassionate,
          total: stats.total,
        },
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch leaves",
        isLoading: false,
      });
    }
  },

  fetchEmployeeLeaves: async (employeeId) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.get(`/leave/employee/${employeeId}`, getOrgConfig());

      set({
        leaves: normalizeLeaves(response.data),
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch employee leave requests",
        isLoading: false,
      });
    }
  },

  requestLeave: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const hasFile =
        typeof File !== "undefined" && data?.document instanceof File;

      if (hasFile) {
        const formPayload = new FormData();
        formPayload.append("type", data.type);
        formPayload.append("startDate", data.startDate);
        formPayload.append("endDate", data.endDate);
        formPayload.append("reason", data.reason);
        formPayload.append("document", data.document);

        await api.post("/leave/", formPayload, {
          ...getOrgConfig(),
          headers: {
            ...getOrgConfig().headers,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        const payload = cleanPayload({
          type: data.type,
          startDate: data.startDate,
          endDate: data.endDate,
          reason: data.reason,
          document: data.document,
        });

        await api.post("/leave/", payload, getOrgConfig());
      }

      await get().fetchLeaves();
      set({ isLoading: false, error: null });
      return true;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to submit leave request",
        isLoading: false,
      });
      return false;
    }
  },

  approveLeave: async (leaveId) => {
    set({ isLoading: true, error: null });

    try {
      const encodedLeaveId = encodeURIComponent(String(leaveId));
      await api.put(`/leave/${encodedLeaveId}/approve`, {}, getOrgConfig());
      await get().fetchLeaves();
      set({ isLoading: false, error: null });
      return true;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to approve leave request",
        isLoading: false,
      });
      return false;
    }
  },

  rejectLeave: async (leaveId) => {
    set({ isLoading: true, error: null });

    try {
      const encodedLeaveId = encodeURIComponent(String(leaveId));
      await api.put(`/leave/${encodedLeaveId}/reject`, {}, getOrgConfig());
      await get().fetchLeaves();
      set({ isLoading: false, error: null });
      return true;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to reject leave request",
        isLoading: false,
      });
      return false;
    }
  },

  fetchOrgLeaveStats: async () => {
    try {
      const response = await api.get("/leave/stats/org", getOrgConfig());
      set({
        orgStats:
          response.data?.data || response.data?.stats || response.data || null,
      });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch leave statistics",
      });
    }
  },

  fetchUserLeaveStats: async () => {
    try {
      const response = await api.get("/leave/stats/user", getOrgConfig());
      const { stats, leaves } = normalizeUserLeaveStats(response.data);

      set({
        leaves,
        userStats: {
          annualLeave: stats.annual,
          sickLeave: stats.sick,
          maternityLeave: stats.maternity,
          compassionateLeave: stats.compassionate,
          total: stats.total,
          raw: response.data?.data || response.data,
        },
      });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch user leave statistics",
      });
    }
  },
}));
