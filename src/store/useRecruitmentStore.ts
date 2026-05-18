import { create } from 'zustand';
import api from '../api/axios';
import { getCookie } from '../utils/cookies';

interface Job {
  _id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  salaryRange: string;
  closingDate: string;
  department: string;
  requirements: string;
  responsibilities: string;
  platform?: string;
  applicants?: number;
  interviewing?: number;
  posted?: string;
  createdAt?: string;
}

interface RecruitmentState {
  jobs: Job[];
  isLoading: boolean;
  error: string | null;
  fetchJobs: () => Promise<void>;
  postJob: (data: Omit<Job, '_id'>) => Promise<boolean>;
  applyForJob: (data: any) => Promise<boolean>;
}

const getOrgConfig = () => {
  const orgId = getCookie("orgId");
  if (!orgId) {
    throw new Error("Organization ID missing. Please complete onboarding first.");
  }
  return {
    headers: {
      "x-org-id": orgId,
    },
  };
};

export const useRecruitmentStore = create<RecruitmentState>((set, get) => ({
  jobs: [],
  isLoading: false,
  error: null,

  fetchJobs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/recruitment/jobs', getOrgConfig());
      set({ jobs: response.data?.data || response.data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch jobs', isLoading: false });
    }
  },

  postJob: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/recruitment/job', data, getOrgConfig());
      await get().fetchJobs();
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to post job', isLoading: false });
      return false;
    }
  },

  applyForJob: async (data) => {
    set({ isLoading: true, error: null });
    try {
      // NOTE: Apply might not need x-org-id if it's public, but the API doesn't specify x-org-id in the docs for this one. 
      // Actually wait, let's just pass getOrgConfig() or let backend decide, but usually apply for job takes orgId or jobId.
      // The API docs don't list x-org-id for POST /recruitment/apply
      await api.post('/recruitment/apply', data);
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to submit application', isLoading: false });
      return false;
    }
  }
}));