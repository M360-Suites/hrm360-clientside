import { create } from "zustand";
import api from "../api/axios";
import { getCookie } from "../utils/cookies";

export interface NotificationSettings {
  exit: boolean;
  grievance: boolean;
  leave: boolean;
  loan: boolean;
  payroll: boolean;
  probation: boolean;
}

export interface LeavePolicy {
  days: number;
  paid: boolean;
  needApproval: boolean;
}

export interface LeaveSettings {
  annual: LeavePolicy;
  sick: LeavePolicy;
  maternity: LeavePolicy;
  paternity: LeavePolicy;
  unpaid: LeavePolicy;
  bereavement: LeavePolicy;
}

export interface LoanSettings {
  maxLoanMultiple: number;
  maxLoanAmount: number;
  annualInterestRate: number;
  maxRepaymentPeriod: string;
  coolingPeriod: string;
  requestPayrollPin: boolean;
  attachedDocs: string[];
}

export interface ManagedUser {
  _id?: string;
  id?: string;
  userId?: string;
  name?: string;
  fullName?: string;
  email?: string;
  role?: string;
  roles?: string[];
  user?: {
    _id?: string;
    id?: string;
    name?: string;
    fullName?: string;
    email?: string;
  };
}

export interface TwoFactorSetup {
  secret?: string;
  qrCode?: string;
  qrCodeUrl?: string;
  otpauthUrl?: string;
  message?: string;
}

interface SettingsState {
  organizationSettings: Record<string, unknown> | null;
  userSettings: Record<string, unknown> | null;
  managedUsers: ManagedUser[];
  twoFactorSetup: TwoFactorSetup | null;
  isLoading: boolean;
  activeAction: string | null;
  error: string | null;
  clearError: () => void;
  fetchOrganizationSettings: () => Promise<void>;
  fetchUserSettings: () => Promise<void>;
  enableTwoFactor: () => Promise<boolean>;
  resetTwoFactor: () => Promise<boolean>;
  verifyTwoFactor: (token: string) => Promise<boolean>;
  disableTwoFactor: (token: string) => Promise<boolean>;
  resetPassword: (data: { oldPassword: string; newPassword: string }) => Promise<boolean>;
  updateNotifications: (data: NotificationSettings) => Promise<boolean>;
  updateLeaveSettings: (data: LeaveSettings) => Promise<boolean>;
  updateLoanSettings: (data: LoanSettings) => Promise<boolean>;
  fetchManagedUsers: () => Promise<void>;
  updateManagedUser: (data: { userId: string; roles: string[] }) => Promise<boolean>;
  removeManagedUser: (userId: string) => Promise<boolean>;
}

const getOrgConfig = () => {
  const orgId = getCookie("orgId");
  if (!orgId) throw new Error("Organization ID is required for this setting.");
  return { headers: { "x-org-id": orgId } };
};

const unwrap = (payload: unknown): unknown => {
  if (!payload || typeof payload !== "object") return payload;
  const response = payload as Record<string, unknown>;
  return response.data ?? response.settings ?? response;
};

const asRecord = (payload: unknown) => {
  const data = unwrap(payload);
  return data && typeof data === "object" && !Array.isArray(data)
    ? data as Record<string, unknown>
    : {};
};

const asUsers = (payload: unknown): ManagedUser[] => {
  const data = unwrap(payload);
  if (Array.isArray(data)) return data as ManagedUser[];
  if (!data || typeof data !== "object") return [];
  const record = data as Record<string, unknown>;
  if (Array.isArray(record.users)) return record.users as ManagedUser[];
  if (Array.isArray(record.managedUsers)) return record.managedUsers as ManagedUser[];
  return [];
};

const messageFrom = (error: unknown, fallback: string) => {
  const requestError = error as {
    message?: string;
    response?: { data?: { message?: string; error?: string } };
  };
  return requestError?.response?.data?.message || requestError?.response?.data?.error || requestError?.message || fallback;
};

const setupFrom = (payload: unknown): TwoFactorSetup => {
  const data = asRecord(payload);
  return {
    secret: String(data.secret || data.base32 || data.manualEntryKey || ""),
    qrCode: String(data.qrCode || data.qr || data.qrImage || ""),
    qrCodeUrl: String(data.qrCodeUrl || data.qrUrl || ""),
    otpauthUrl: String(data.otpauthUrl || data.otpAuthUrl || data.url || ""),
    message: String(data.message || ""),
  };
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  organizationSettings: null,
  userSettings: null,
  managedUsers: [],
  twoFactorSetup: null,
  isLoading: false,
  activeAction: null,
  error: null,
  clearError: () => set({ error: null }),

  fetchOrganizationSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/settings", getOrgConfig());
      set({ organizationSettings: asRecord(response.data), isLoading: false });
    } catch (error: unknown) {
      set({ error: messageFrom(error, "Failed to fetch organization settings"), isLoading: false });
    }
  },

  fetchUserSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/settings/user");
      set({ userSettings: asRecord(response.data), isLoading: false });
    } catch (error: unknown) {
      set({ error: messageFrom(error, "Failed to fetch user settings"), isLoading: false });
    }
  },

  enableTwoFactor: async () => {
    set({ activeAction: "enable-2fa", error: null });
    try {
      const response = await api.get("/settings/enable-2fa");
      set({ twoFactorSetup: setupFrom(response.data), activeAction: null });
      return true;
    } catch (error: unknown) {
      set({ error: messageFrom(error, "Failed to start 2FA setup"), activeAction: null });
      return false;
    }
  },

  resetTwoFactor: async () => {
    set({ activeAction: "reset-2fa", error: null });
    try {
      const response = await api.post("/settings/reset-2fa");
      set({ twoFactorSetup: setupFrom(response.data), activeAction: null });
      return true;
    } catch (error: unknown) {
      set({ error: messageFrom(error, "Failed to reset 2FA"), activeAction: null });
      return false;
    }
  },

  verifyTwoFactor: async (token) => {
    set({ activeAction: "verify-2fa", error: null });
    try {
      await api.post("/settings/verify-2fa", { token });
      set({ activeAction: null, twoFactorSetup: null });
      await get().fetchUserSettings();
      return true;
    } catch (error: unknown) {
      set({ error: messageFrom(error, "Invalid authenticator token"), activeAction: null });
      return false;
    }
  },

  disableTwoFactor: async (token) => {
    set({ activeAction: "disable-2fa", error: null });
    try {
      await api.put("/settings/disable-2fa", { token });
      set({ activeAction: null, twoFactorSetup: null });
      await get().fetchUserSettings();
      return true;
    } catch (error: unknown) {
      set({ error: messageFrom(error, "Failed to disable 2FA"), activeAction: null });
      return false;
    }
  },

  resetPassword: async (data) => {
    set({ activeAction: "password", error: null });
    try {
      await api.put("/settings/reset-password", data);
      set({ activeAction: null });
      return true;
    } catch (error: unknown) {
      set({ error: messageFrom(error, "Failed to update password"), activeAction: null });
      return false;
    }
  },

  updateNotifications: async (data) => {
    set({ activeAction: "notifications", error: null });
    try {
      await api.patch("/settings/notifications", data, getOrgConfig());
      set((state) => ({ organizationSettings: { ...state.organizationSettings, notifications: data }, activeAction: null }));
      return true;
    } catch (error: unknown) {
      set({ error: messageFrom(error, "Failed to update notifications"), activeAction: null });
      return false;
    }
  },

  updateLeaveSettings: async (data) => {
    set({ activeAction: "leave", error: null });
    try {
      await api.patch("/settings/leave", data, getOrgConfig());
      set((state) => ({ organizationSettings: { ...state.organizationSettings, leave: data }, activeAction: null }));
      return true;
    } catch (error: unknown) {
      set({ error: messageFrom(error, "Failed to update leave settings"), activeAction: null });
      return false;
    }
  },

  updateLoanSettings: async (data) => {
    set({ activeAction: "loan", error: null });
    try {
      await api.patch("/settings/loan", data, getOrgConfig());
      set((state) => ({ organizationSettings: { ...state.organizationSettings, loan: data }, activeAction: null }));
      return true;
    } catch (error: unknown) {
      set({ error: messageFrom(error, "Failed to update loan settings"), activeAction: null });
      return false;
    }
  },

  fetchManagedUsers: async () => {
    set({ activeAction: "managed-users", error: null });
    try {
      const response = await api.get("/settings/user-management", getOrgConfig());
      set({ managedUsers: asUsers(response.data), activeAction: null });
    } catch (error: unknown) {
      set({ error: messageFrom(error, "Failed to fetch managed users"), activeAction: null });
    }
  },

  updateManagedUser: async (data) => {
    set({ activeAction: "save-user", error: null });
    try {
      await api.patch("/settings/user-management", data, getOrgConfig());
      await get().fetchManagedUsers();
      set({ activeAction: null });
      return true;
    } catch (error: unknown) {
      set({ error: messageFrom(error, "Failed to update managed user"), activeAction: null });
      return false;
    }
  },

  removeManagedUser: async (userId) => {
    set({ activeAction: "remove-user-" + userId, error: null });
    try {
      await api.delete("/settings/user-management/" + encodeURIComponent(userId), getOrgConfig());
      set((state) => ({ managedUsers: state.managedUsers.filter((item) => (item.userId || item.user?._id || item.user?.id || item._id || item.id) !== userId), activeAction: null }));
      return true;
    } catch (error: unknown) {
      set({ error: messageFrom(error, "Failed to remove managed user"), activeAction: null });
      return false;
    }
  },
}));
