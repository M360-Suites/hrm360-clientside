import { create } from "zustand";
import api from "../api/axios";
import { getCookie } from "../utils/cookies";

export interface Job {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  location: string;
  type: string;
  salaryRange: string;
  closingDate: string;
  department: string;
  requirements: string;
  responsibilities: string;
  applicants?: number;
  interviewing?: number;
  createdAt?: string;
}

export type PostJobPayload = Pick<Job,
  | "title"
  | "description"
  | "location"
  | "type"
  | "salaryRange"
  | "closingDate"
  | "department"
  | "requirements"
  | "responsibilities"
>;

export interface JobApplicationPayload {
  name: string;
  email: string;
  phone: string;
  yearsOfExperience: number;
  date: string;
  resume: string;
}

interface RecruitmentState {
  jobs: Job[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  clearError: () => void;
  fetchJobs: () => Promise<void>;
  postJob: (data: PostJobPayload) => Promise<boolean>;
  applyForJob: (data: JobApplicationPayload) => Promise<boolean>;
}

const getOrgConfig = () => {
  const orgId = getCookie("orgId");
  if (!orgId) {
    throw new Error("Organization ID missing. Please complete onboarding first.");
  }
  return { headers: { "x-org-id": orgId } };
};

const normalizeJobs = (payload: unknown): Job[] => {
  if (Array.isArray(payload)) return payload as Job[];
  if (!payload || typeof payload !== "object") return [];
  const response = payload as Record<string, unknown>;
  if (Array.isArray(response.jobs)) return response.jobs as Job[];
  if (Array.isArray(response.data)) return response.data as Job[];
  if (!response.data || typeof response.data !== "object") return [];
  const data = response.data as Record<string, unknown>;
  if (Array.isArray(data.jobs)) return data.jobs as Job[];
  if (Array.isArray(data.data)) return data.data as Job[];
  return [];
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const requestError = error as {
    message?: string;
    response?: { data?: { message?: string; error?: string } };
  };
  return requestError?.response?.data?.message || requestError?.response?.data?.error || requestError?.message || fallback;
};

export const useRecruitmentStore = create<RecruitmentState>((set, get) => ({
  jobs: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  clearError: () => set({ error: null }),

  fetchJobs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/recruitment/jobs", getOrgConfig());
      set({ jobs: normalizeJobs(response.data), isLoading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, "Failed to fetch jobs"), isLoading: false });
    }
  },

  postJob: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await api.post("/recruitment/job", data, getOrgConfig());
      await get().fetchJobs();
      set({ isSubmitting: false });
      return true;
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, "Failed to post job"), isSubmitting: false });
      return false;
    }
  },

  applyForJob: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await api.post("/recruitment/apply", data);
      set({ isSubmitting: false });
      return true;
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, "Failed to submit application"), isSubmitting: false });
      return false;
    }
  },
}));
