import { create } from "zustand";
import api from "../api/axios";
import { getCookie } from "../utils/cookies";

export type PermissionStatus = "Pending" | "Approved" | "Rejected";

export interface PermissionEmployee {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  image?: string;
  role?: string;
}

export interface PermissionRequest {
  _id?: string;
  id?: string;
  org?: string;
  employee?: PermissionEmployee | string;
  date?: string;
  leaveTime: string;
  leftAt?: string;
  returnTime: string;
  returnedAt?: string;
  note: string;
  status: PermissionStatus | string;
  returnedLate?: boolean;
  lateMinutes?: number;
  rejectNote?: string;
  reviewNote?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PermissionState {
  permissions: PermissionRequest[];
  pendingPermissions: PermissionRequest[];
  selectedPermission: PermissionRequest | null;
  isLoading: boolean;
  activeAction: string | null;
  error: string | null;
  clearError: () => void;
  fetchMyPermissions: (status?: PermissionStatus | "") => Promise<void>;
  fetchAllPermissions: (status?: PermissionStatus | "") => Promise<void>;
  fetchPendingPermissions: () => Promise<void>;
  fetchPermissionById: (permId: string) => Promise<PermissionRequest | null>;
  requestPermission: (data: { note: string; leaveTime: string; returnTime: string }) => Promise<boolean>;
  cancelPermission: (permId: string) => Promise<boolean>;
  recordLeaveReturn: (data: { action: "leave" | "return"; permId: string; location: { latitude: number; longitude: number } }) => Promise<boolean>;
  updatePermission: (data: { permId: string; status: "Approve" | "Reject"; note: string }) => Promise<boolean>;
}

const getOrgConfig = () => {
  const orgId = getCookie("orgId");
  if (!orgId) throw new Error("Organization ID is required.");
  return { headers: { "x-org-id": orgId } };
};

const unwrap = (payload: unknown): unknown => {
  if (!payload || typeof payload !== "object") return payload;
  const record = payload as Record<string, unknown>;
  return record.data ?? record.permissions ?? record;
};

const normalizePermissions = (payload: unknown): PermissionRequest[] => {
  const data = unwrap(payload);
  if (Array.isArray(data)) return data as PermissionRequest[];
  if (!data || typeof data !== "object") return [];
  const record = data as Record<string, unknown>;
  if (Array.isArray(record.permissions)) return record.permissions as PermissionRequest[];
  if (Array.isArray(record.data)) return record.data as PermissionRequest[];
  if (Array.isArray(record.docs)) return record.docs as PermissionRequest[];
  return [];
};

const normalizePermission = (payload: unknown): PermissionRequest | null => {
  const data = unwrap(payload);
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const record = data as Record<string, unknown>;
  const permission = record.permission ?? record.data ?? data;
  return permission && typeof permission === "object" && !Array.isArray(permission)
    ? permission as PermissionRequest
    : null;
};

const errorMessage = (error: unknown, fallback: string) => {
  const requestError = error as { message?: string; response?: { data?: { message?: string; error?: string } } };
  return requestError?.response?.data?.message || requestError?.response?.data?.error || requestError?.message || fallback;
};

export const usePermissionStore = create<PermissionState>((set, get) => ({
  permissions: [],
  pendingPermissions: [],
  selectedPermission: null,
  isLoading: false,
  activeAction: null,
  error: null,
  clearError: () => set({ error: null }),

  fetchMyPermissions: async (status = "") => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/permission/my-permissions", { ...getOrgConfig(), params: status ? { status } : undefined });
      set({ permissions: normalizePermissions(response.data), isLoading: false });
    } catch (error: unknown) {
      set({ error: errorMessage(error, "Failed to fetch your permission requests"), isLoading: false });
    }
  },

  fetchAllPermissions: async (status = "") => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/permission/all", { ...getOrgConfig(), params: status ? { status } : undefined });
      set({ permissions: normalizePermissions(response.data), isLoading: false });
    } catch (error: unknown) {
      set({ error: errorMessage(error, "Failed to fetch organization permissions"), isLoading: false });
    }
  },

  fetchPendingPermissions: async () => {
    set({ activeAction: "pending-list", error: null });
    try {
      const response = await api.get("/permission/pending", getOrgConfig());
      set({ pendingPermissions: normalizePermissions(response.data), activeAction: null });
    } catch (error: unknown) {
      set({ error: errorMessage(error, "Failed to fetch pending permissions"), activeAction: null });
    }
  },

  fetchPermissionById: async (permId) => {
    set({ activeAction: "details-" + permId, error: null });
    try {
      const response = await api.get("/permission/" + encodeURIComponent(permId), getOrgConfig());
      const permission = normalizePermission(response.data);
      set({ selectedPermission: permission, activeAction: null });
      return permission;
    } catch (error: unknown) {
      set({ error: errorMessage(error, "Failed to fetch permission details"), activeAction: null });
      return null;
    }
  },

  requestPermission: async (data) => {
    set({ activeAction: "request", error: null });
    try {
      await api.post("/permission/request", data, getOrgConfig());
      await get().fetchMyPermissions();
      set({ activeAction: null });
      return true;
    } catch (error: unknown) {
      set({ error: errorMessage(error, "Failed to submit permission request"), activeAction: null });
      return false;
    }
  },

  cancelPermission: async (permId) => {
    set({ activeAction: "cancel-" + permId, error: null });
    try {
      await api.delete("/permission/cancel/" + encodeURIComponent(permId), getOrgConfig());
      await get().fetchMyPermissions();
      set({ activeAction: null });
      return true;
    } catch (error: unknown) {
      set({ error: errorMessage(error, "Failed to cancel permission request"), activeAction: null });
      return false;
    }
  },

  recordLeaveReturn: async (data) => {
    set({ activeAction: data.action + "-" + data.permId, error: null });
    try {
      await api.post("/permission/leave-return", data, getOrgConfig());
      await get().fetchMyPermissions();
      set({ activeAction: null });
      return true;
    } catch (error: unknown) {
      set({ error: errorMessage(error, "Failed to record permission action"), activeAction: null });
      return false;
    }
  },

  updatePermission: async (data) => {
    set({ activeAction: "review-" + data.permId, error: null });
    try {
      await api.put("/permission/update", data, getOrgConfig());
      await Promise.all([get().fetchAllPermissions(), get().fetchPendingPermissions()]);
      set({ activeAction: null, selectedPermission: null });
      return true;
    } catch (error: unknown) {
      set({ error: errorMessage(error, "Failed to update permission status"), activeAction: null });
      return false;
    }
  },
}));
