import { create } from "zustand";
import api from "../api/axios";
import { getCookie } from "../utils/cookies";

export type ProbationAction = "Confirm" | "Extend" | "Terminate";

export interface ProbationObjective {
  _id?: string;
  id?: string;
  objectiveId?: string;
  title?: string;
  objective?: string;
  text?: string;
  completed?: boolean;
}

export interface ProbationStaff {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  workMode: string;
  role: string;
  startDate: string;
  endDate: string;
  probationObjectives?: Array<ProbationObjective | string>;
  objectives?: Array<ProbationObjective | string>;
  status?: string;
  rateScore?: number;
  score?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProbationStats {
  tracked: number;
  onProbation: number;
  due: number;
  extended: number;
}

interface ProbationState {
  staff: ProbationStaff[];
  selectedStaff: ProbationStaff | null;
  stats: ProbationStats;
  isLoading: boolean;
  activeAction: string | null;
  error: string | null;
  clearError: () => void;
  fetchProbationStaff: () => Promise<void>;
  fetchProbationStats: () => Promise<void>;
  fetchProbationById: (probId: string) => Promise<ProbationStaff | null>;
  addProbationStaff: (data: { name: string; email: string; workMode: string; role: string; startDate: string; endDate: string; probationObjectives: string[] }) => Promise<boolean>;
  updateProbationStatus: (data: { probId: string; action: ProbationAction; newEndDate?: string }) => Promise<boolean>;
  updateObjective: (data: { probId: string; objectiveId: string; completed: boolean }) => Promise<boolean>;
}

const getOrgConfig = () => {
  const orgId = getCookie("orgId");
  if (!orgId) throw new Error("Organization ID is required.");
  return { headers: { "x-org-id": orgId } };
};

const unwrap = (payload: unknown): unknown => {
  if (!payload || typeof payload !== "object") return payload;
  const record = payload as Record<string, unknown>;
  return record.data ?? record.probation ?? record;
};

const normalizeStaff = (payload: unknown): ProbationStaff[] => {
  const data = unwrap(payload);
  if (Array.isArray(data)) return data as ProbationStaff[];
  if (!data || typeof data !== "object") return [];
  const record = data as Record<string, unknown>;
  for (const key of ["staff", "probationStaff", "probationStaffs", "probations", "docs", "data"]) {
    if (Array.isArray(record[key])) return record[key] as ProbationStaff[];
  }
  return [];
};

const normalizeDetail = (payload: unknown): ProbationStaff | null => {
  const data = unwrap(payload);
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const record = data as Record<string, unknown>;
  const item = record.staff ?? record.probationStaff ?? record.probation ?? record.data ?? data;
  return item && typeof item === "object" && !Array.isArray(item) ? item as ProbationStaff : null;
};

const normalizeStats = (payload: unknown): ProbationStats => {
  const data = unwrap(payload);
  const record = data && typeof data === "object" && !Array.isArray(data) ? data as Record<string, unknown> : {};
  return {
    tracked: Number(record.tracked || 0),
    onProbation: Number(record.onProbation || record.active || 0),
    due: Number(record.due || record.dueSoon || 0),
    extended: Number(record.extended || 0),
  };
};

const errorMessage = (error: unknown, fallback: string) => {
  const requestError = error as { message?: string; response?: { data?: { message?: string; error?: string } } };
  return requestError?.response?.data?.message || requestError?.response?.data?.error || requestError?.message || fallback;
};

export const useProbationStore = create<ProbationState>((set, get) => ({
  staff: [],
  selectedStaff: null,
  stats: { tracked: 0, onProbation: 0, due: 0, extended: 0 },
  isLoading: false,
  activeAction: null,
  error: null,
  clearError: () => set({ error: null }),

  fetchProbationStaff: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/probation", getOrgConfig());
      set({ staff: normalizeStaff(response.data), isLoading: false });
    } catch (error: unknown) {
      set({ error: errorMessage(error, "Failed to fetch probation staff"), isLoading: false });
    }
  },

  fetchProbationStats: async () => {
    try {
      const response = await api.get("/probation/stats", getOrgConfig());
      set({ stats: normalizeStats(response.data) });
    } catch (error: unknown) {
      set({ error: errorMessage(error, "Failed to fetch probation statistics") });
    }
  },

  fetchProbationById: async (probId) => {
    set({ activeAction: "details-" + probId, error: null });
    try {
      const response = await api.get("/probation/" + encodeURIComponent(probId), getOrgConfig());
      const detail = normalizeDetail(response.data);
      set({ selectedStaff: detail, activeAction: null });
      return detail;
    } catch (error: unknown) {
      set({ error: errorMessage(error, "Failed to fetch probation details"), activeAction: null });
      return null;
    }
  },

  addProbationStaff: async (data) => {
    set({ activeAction: "add", error: null });
    try {
      await api.post("/probation", data, getOrgConfig());
      await Promise.all([get().fetchProbationStaff(), get().fetchProbationStats()]);
      set({ activeAction: null });
      return true;
    } catch (error: unknown) {
      set({ error: errorMessage(error, "Failed to add probation staff"), activeAction: null });
      return false;
    }
  },

  updateProbationStatus: async (data) => {
    set({ activeAction: "status-" + data.probId, error: null });
    try {
      await api.put("/probation", data, getOrgConfig());
      await Promise.all([get().fetchProbationStaff(), get().fetchProbationStats()]);
      set({ activeAction: null, selectedStaff: null });
      return true;
    } catch (error: unknown) {
      set({ error: errorMessage(error, "Failed to update probation status"), activeAction: null });
      return false;
    }
  },

  updateObjective: async (data) => {
    set({ activeAction: "objective-" + data.objectiveId, error: null });
    try {
      await api.patch("/probation/objective", data, getOrgConfig());
      await get().fetchProbationById(data.probId);
      await get().fetchProbationStats();
      set({ activeAction: null });
      return true;
    } catch (error: unknown) {
      set({ error: errorMessage(error, "Failed to update probation objective"), activeAction: null });
      return false;
    }
  },
}));
