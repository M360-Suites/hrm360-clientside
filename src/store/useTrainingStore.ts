import { create } from 'zustand';
import api from '../api/axios';
import { getCookie } from '../utils/cookies';

export interface Module {
  title?: string;
  duration?: string;
  // add other fields if needed
}

export interface Course {
  _id: string;
  title: string;
  category: string;
  instructor: string;
  duration: string;
  endDate: string;
  maxCapacity: number;
  description: string;
  courseType: string;
  modules: Module[];
  enrolled?: number;
  completed?: number;
  total?: number;
  tag?: string;
}

interface TrainingState {
  courses: Course[];
  courseDetails: Course | null;
  stats: any | null;
  employeeStats: any | null;
  isLoading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  fetchCourseDetails: (id: string) => Promise<void>;
  addCourse: (data: Omit<Course, '_id'>) => Promise<boolean>;
  enrollInCourse: (id: string) => Promise<boolean>;
  fetchStats: () => Promise<void>;
  fetchEmployeeStats: () => Promise<void>;
}

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const normalizeCourses = (responseData: any): Course[] => {
  const data = responseData?.data || responseData?.courses || responseData;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.courses)) return data.courses;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const normalizeStats = (responseData: any) =>
  responseData?.data || responseData?.stats || responseData || null;

const getOrgConfig = () => {
  const orgId = getCookie("orgId");
  if (!orgId) {
    throw new Error("Organization ID missing.");
  }
  return {
    headers: {
      "x-org-id": orgId,
    },
  };
};

export const useTrainingStore = create<TrainingState>((set, get) => ({
  courses: [],
  courseDetails: null,
  stats: null,
  employeeStats: null,
  isLoading: false,
  error: null,

  fetchCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/training/courses', getOrgConfig());
      set({ courses: normalizeCourses(response.data), isLoading: false, error: null });
    } catch (error: any) {
      set({ error: getErrorMessage(error, 'Failed to fetch courses'), isLoading: false });
    }
  },

  fetchCourseDetails: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/training/course/${id}`, getOrgConfig());
      set({ courseDetails: response.data?.data || response.data, isLoading: false, error: null });
    } catch (error: any) {
      set({ error: getErrorMessage(error, 'Failed to fetch course details'), isLoading: false });
    }
  },

  addCourse: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/training/course', data, getOrgConfig());
      await get().fetchCourses();
      await get().fetchStats();
      set({ isLoading: false, error: null });
      return true;
    } catch (error: any) {
      set({ error: getErrorMessage(error, 'Failed to add course'), isLoading: false });
      return false;
    }
  },

  enrollInCourse: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/training/course/${id}/enroll`, {}, getOrgConfig());
      await get().fetchCourses();
      await get().fetchEmployeeStats();
      set({ isLoading: false, error: null });
      return true;
    } catch (error: any) {
      set({ error: getErrorMessage(error, 'Failed to enroll in course'), isLoading: false });
      return false;
    }
  },

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/training/stats', getOrgConfig());
      set({ stats: normalizeStats(response.data), isLoading: false, error: null });
    } catch (error: any) {
      set({ error: getErrorMessage(error, 'Failed to fetch stats'), isLoading: false });
    }
  },

  fetchEmployeeStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/training/employee-stats', getOrgConfig());
      set({ employeeStats: normalizeStats(response.data), isLoading: false, error: null });
    } catch (error: any) {
      set({ error: getErrorMessage(error, 'Failed to fetch employee stats'), isLoading: false });
    }
  }
}));
