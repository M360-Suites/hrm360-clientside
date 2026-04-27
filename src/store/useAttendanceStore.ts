import { create } from 'zustand';
import api from '../api/axios';

interface AttendanceState {
  dayAttendance: any[];
  weekOverview: any | null;
  todayStats: any | null;
  isLoading: boolean;
  error: string | null;
  fetchDayAttendance: () => Promise<void>;
  fetchWeekOverview: () => Promise<void>;
  fetchTodayStats: () => Promise<void>;
  clockIn: (employeeId: string) => Promise<void>;
  clockOut: (employeeId: string) => Promise<void>;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  dayAttendance: [],
  weekOverview: null,
  todayStats: null,
  isLoading: false,
  error: null,

  fetchDayAttendance: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/attendance');
      let data = response.data.data || response.data;
      if (!Array.isArray(data) && typeof data === 'object') {
        data = data.attendance || Object.values(data).find(val => Array.isArray(val)) || [];
      }
      set({ dayAttendance: Array.isArray(data) ? data : [], isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch day attendance', isLoading: false });
    }
  },

  fetchWeekOverview: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/attendance/overview');
      set({ weekOverview: response.data.data || response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch week overview', isLoading: false });
    }
  },

  fetchTodayStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/attendance/stats');
      set({ todayStats: response.data.data || response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch today stats', isLoading: false });
    }
  },

  clockIn: async (employeeId) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/attendance/clockIn', { employeeId });
      await get().fetchDayAttendance();
    } catch (error: any) {
      console.error('Clock In Error:', error.response?.data);
      set({ error: error.response?.data?.message || 'Clock in failed', isLoading: false });
    }
  },

  clockOut: async (employeeId) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/attendance/clockOut', { employeeId });
      await get().fetchDayAttendance();
    } catch (error: any) {
      console.error('Clock Out Error:', error.response?.data);
      set({ error: error.response?.data?.message || 'Clock out failed', isLoading: false });
    }
  },
}));
