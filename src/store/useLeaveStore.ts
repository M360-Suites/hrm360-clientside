import { create } from 'zustand';
import api from '../api/axios';

interface LeaveState {
  leaves: any[];
  isLoading: boolean;
  error: string | null;
  fetchLeaves: () => Promise<void>;
  requestLeave: (data: any) => Promise<void>;
}

export const useLeaveStore = create<LeaveState>((set, get) => ({
  leaves: [],
  isLoading: false,
  error: null,

  fetchLeaves: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/leave/');
      let data = response.data.data || response.data;
      if (!Array.isArray(data) && typeof data === 'object') {
        data = data.leaves || Object.values(data).find(val => Array.isArray(val)) || [];
      }
      set({ leaves: Array.isArray(data) ? data : [], isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch leaves', isLoading: false });
    }
  },

  requestLeave: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/leave/', data);
      await get().fetchLeaves(); // Refresh the leave list
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to submit leave request', isLoading: false });
    }
  },
}));
