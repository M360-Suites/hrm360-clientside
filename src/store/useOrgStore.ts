import { create } from 'zustand';
import api from '../api/axios';

interface OrgState {
  currentOrg: any | null;
  isLoading: boolean;
  error: string | null;
  createOrg: (data: any) => Promise<boolean>;
  setOrgId: (orgId: string) => void;
}

export const useOrgStore = create<OrgState>((set) => ({
  currentOrg: null,
  isLoading: false,
  error: null,

  createOrg: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/org/', data);
      const orgData = response.data.data || response.data;
      
      if (orgData?._id || orgData?.id) {
        localStorage.setItem('orgId', orgData._id || orgData.id);
      }
      
      set({ currentOrg: orgData, isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create organization', isLoading: false });
      return false;
    }
  },

  setOrgId: (orgId: string) => {
    localStorage.setItem('orgId', orgId);
  }
}));
