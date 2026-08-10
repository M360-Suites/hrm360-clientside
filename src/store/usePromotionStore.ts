import { create } from "zustand";
import api from "../api/axios";
import { getCookie } from "../utils/cookies";

export type PromotionStatus = "Approved" | "Pending" | "Rejected" | "Under review";

export interface PromotionEmployee {
  _id?: string;
  id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  role?: string;
  image?: string;
}

export interface PromotionRequest {
  _id?: string;
  id?: string;
  employee?: PromotionEmployee | string;
  employeeId?: PromotionEmployee | string;
  currentRole?: string;
  newRole: string;
  effectiveDate: string;
  currentSalary: number;
  newSalary: number;
  justification: string;
  doc?: string;
  status: PromotionStatus | string;
  reviewNote?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromotionStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  underReview: number;
}

interface PromotionState {
  promotions: PromotionRequest[];
  promotionHistory: PromotionRequest[];
  selectedPromotion: PromotionRequest | null;
  stats: PromotionStats;
  page: number;
  totalPages: number;
  total: number;
  isLoading: boolean;
  activeAction: string | null;
  error: string | null;
  clearError: () => void;
  fetchUserPromotions: () => Promise<void>;
  fetchPromotions: (params?: { status?: PromotionStatus | ""; page?: number; limit?: number }) => Promise<void>;
  fetchPromotionStats: () => Promise<void>;
  fetchEmployeePromotions: (employeeId: string, params?: { status?: PromotionStatus | ""; page?: number; limit?: number }) => Promise<void>;
  fetchPromotionHistory: (employeeId: string, year?: string) => Promise<void>;
  fetchPromotionById: (promotionId: string) => Promise<PromotionRequest | null>;
  requestPromotion: (data: { employeeId: string; newRole: string; effectiveDate: string; currentSalary: number; newSalary: number; justification: string; doc: string }) => Promise<boolean>;
  updatePromotionStatus: (data: { promotionId: string; status: PromotionStatus; reviewNote: string }) => Promise<boolean>;
  deletePromotion: (promotionId: string) => Promise<boolean>;
}

const getOrgConfig = () => {
  const orgId = getCookie("orgId");
  if (!orgId) throw new Error("Organization ID is required.");
  return { headers: { "x-org-id": orgId } };
};

const unwrap = (payload: unknown): unknown => {
  if (!payload || typeof payload !== "object") return payload;
  const record = payload as Record<string, unknown>;
  return record.data ?? record.promotions ?? record;
};

const normalizePromotions = (payload: unknown): PromotionRequest[] => {
  const data = unwrap(payload);
  if (Array.isArray(data)) return data as PromotionRequest[];
  if (!data || typeof data !== "object") return [];
  const record = data as Record<string, unknown>;
  if (Array.isArray(record.promotions)) return record.promotions as PromotionRequest[];
  if (Array.isArray(record.data)) return record.data as PromotionRequest[];
  if (Array.isArray(record.docs)) return record.docs as PromotionRequest[];
  if (Array.isArray(record.history)) return record.history as PromotionRequest[];
  return [];
};

const normalizePromotion = (payload: unknown): PromotionRequest | null => {
  const data = unwrap(payload);
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const record = data as Record<string, unknown>;
  const item = record.promotion ?? record.data ?? data;
  return item && typeof item === "object" && !Array.isArray(item) ? item as PromotionRequest : null;
};

const normalizeMeta = (payload: unknown) => {
  const data = unwrap(payload);
  const record = data && typeof data === "object" && !Array.isArray(data) ? data as Record<string, unknown> : {};
  const pagination = record.pagination && typeof record.pagination === "object" ? record.pagination as Record<string, unknown> : record;
  return {
    page: Number(pagination.page || pagination.currentPage || 1),
    totalPages: Number(pagination.totalPages || pagination.pages || 1),
    total: Number(pagination.total || pagination.totalDocs || 0),
  };
};

const normalizeStats = (payload: unknown): PromotionStats => {
  const data = unwrap(payload);
  const record = data && typeof data === "object" && !Array.isArray(data) ? data as Record<string, unknown> : {};
  return {
    total: Number(record.total || record.totalPromotions || 0),
    approved: Number(record.approved || record.Approved || 0),
    pending: Number(record.pending || record.Pending || 0),
    rejected: Number(record.rejected || record.Rejected || 0),
    underReview: Number(record.underReview || record["Under review"] || record.under_review || 0),
  };
};

const errorMessage = (error: unknown, fallback: string) => {
  const requestError = error as { message?: string; response?: { data?: { message?: string; error?: string } } };
  return requestError?.response?.data?.message || requestError?.response?.data?.error || requestError?.message || fallback;
};

export const usePromotionStore = create<PromotionState>((set, get) => ({
  promotions: [],
  promotionHistory: [],
  selectedPromotion: null,
  stats: { total: 0, approved: 0, pending: 0, rejected: 0, underReview: 0 },
  page: 1,
  totalPages: 1,
  total: 0,
  isLoading: false,
  activeAction: null,
  error: null,
  clearError: () => set({ error: null }),

  fetchUserPromotions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/promotion/user", getOrgConfig());
      const promotions = normalizePromotions(response.data);
      set({ promotions, total: promotions.length, isLoading: false });
    } catch (error: unknown) {
      set({ error: errorMessage(error, "Failed to fetch your promotion requests"), isLoading: false });
    }
  },

  fetchPromotions: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/promotion", { ...getOrgConfig(), params: { status: params.status || undefined, page: params.page || 1, limit: params.limit || 10 } });
      const meta = normalizeMeta(response.data);
      const promotions = normalizePromotions(response.data);
      set({ promotions, page: meta.page, totalPages: meta.totalPages, total: meta.total || promotions.length, isLoading: false });
    } catch (error: unknown) {
      set({ error: errorMessage(error, "Failed to fetch promotions"), isLoading: false });
    }
  },

  fetchPromotionStats: async () => {
    try {
      const response = await api.get("/promotion/stats", getOrgConfig());
      set({ stats: normalizeStats(response.data) });
    } catch (error: unknown) {
      set({ error: errorMessage(error, "Failed to fetch promotion statistics") });
    }
  },

  fetchEmployeePromotions: async (employeeId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/promotion/employee/" + encodeURIComponent(employeeId), { ...getOrgConfig(), params: { status: params.status || undefined, page: params.page || 1, limit: params.limit || 10 } });
      const meta = normalizeMeta(response.data);
      const promotions = normalizePromotions(response.data);
      set({ promotions, page: meta.page, totalPages: meta.totalPages, total: meta.total || promotions.length, isLoading: false });
    } catch (error: unknown) {
      set({ error: errorMessage(error, "Failed to fetch employee promotions"), isLoading: false });
    }
  },

  fetchPromotionHistory: async (employeeId, year = "") => {
    set({ activeAction: "history", error: null });
    try {
      const response = await api.get("/promotion/history/" + encodeURIComponent(employeeId), { ...getOrgConfig(), params: year ? { year } : undefined });
      set({ promotionHistory: normalizePromotions(response.data), activeAction: null });
    } catch (error: unknown) {
      set({ error: errorMessage(error, "Failed to fetch promotion history"), activeAction: null });
    }
  },

  fetchPromotionById: async (promotionId) => {
    set({ activeAction: "details-" + promotionId, error: null });
    try {
      const response = await api.get("/promotion/" + encodeURIComponent(promotionId), getOrgConfig());
      const promotion = normalizePromotion(response.data);
      set({ selectedPromotion: promotion, activeAction: null });
      return promotion;
    } catch (error: unknown) {
      set({ error: errorMessage(error, "Failed to fetch promotion details"), activeAction: null });
      return null;
    }
  },

  requestPromotion: async (data) => {
    set({ activeAction: "request", error: null });
    try {
      await api.post("/promotion", data, getOrgConfig());
      await Promise.all([get().fetchUserPromotions(), get().fetchPromotionStats()]);
      set({ activeAction: null });
      return true;
    } catch (error: unknown) {
      set({ error: errorMessage(error, "Failed to submit promotion request"), activeAction: null });
      return false;
    }
  },

  updatePromotionStatus: async (data) => {
    set({ activeAction: "review-" + data.promotionId, error: null });
    try {
      await api.put("/promotion/status", data, getOrgConfig());
      await Promise.all([get().fetchPromotions({ page: get().page, limit: 10 }), get().fetchPromotionStats()]);
      set({ activeAction: null, selectedPromotion: null });
      return true;
    } catch (error: unknown) {
      set({ error: errorMessage(error, "Failed to update promotion status"), activeAction: null });
      return false;
    }
  },

  deletePromotion: async (promotionId) => {
    set({ activeAction: "delete-" + promotionId, error: null });
    try {
      await api.delete("/promotion/" + encodeURIComponent(promotionId), getOrgConfig());
      await Promise.all([get().fetchPromotions({ page: get().page, limit: 10 }), get().fetchPromotionStats()]);
      set({ activeAction: null, selectedPromotion: null });
      return true;
    } catch (error: unknown) {
      set({ error: errorMessage(error, "Failed to delete promotion request"), activeAction: null });
      return false;
    }
  },
}));
