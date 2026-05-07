import { create } from 'zustand';
import api from '../api/axios';

interface OrgState {
  currentOrg: any | null;
  organizations: any[];
  dashboardStats: any | null;
  isLoading: boolean;
  error: string | null;
  createOrg: (data: any) => Promise<boolean>;
  fetchOrganizations: () => Promise<void>;
  fetchDashboardStats: () => Promise<void>;
  setOrgId: (orgId: string) => void;
}

export const useOrgStore = create<OrgState>((set) => ({
  currentOrg: null,
  organizations: [],
  dashboardStats: null,
  isLoading: false,
  error: null,

  createOrg: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/org', data);
      const orgData = response.data.data || response.data;
      
      // Robust orgId extraction
      let orgId = '';
      if (typeof orgData === 'string') orgId = orgData;
      else if (orgData?._id) orgId = orgData._id;
      else if (orgData?.id) orgId = orgData.id;
      
      if (orgId) {
        localStorage.setItem('orgId', orgId);
      }
      
      set({ currentOrg: orgData, isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create organization', isLoading: false });
      return false;
    }
  },

  fetchOrganizations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/org');
      set({ organizations: response.data.data || response.data, isLoading: false });
    } catch (error: any) {
      set({ error: 'Failed to fetch organizations', isLoading: false });
    }
  },

  fetchDashboardStats: async () => {
    const orgId = localStorage.getItem('orgId');
    if (!orgId) return;

    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/org/dashboard', {
        headers: { 'x-org-id': orgId }
      });
      set({ dashboardStats: response.data.data || response.data, isLoading: false });
    } catch (error: any) {
      set({ error: 'Failed to fetch dashboard stats', isLoading: false });
    }
  },

  setOrgId: (orgId: string) => {
    localStorage.setItem('orgId', orgId);
  }
}));
