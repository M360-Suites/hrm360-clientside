import { create } from 'zustand';
import api from '../api/axios';
import { getCookie } from '../utils/cookies';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type?: string;
  date?: string;
  createdAt?: string;
  read?: boolean;
}

interface AnnouncementState {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
}

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

export const useAnnouncementStore = create<AnnouncementState>((set) => ({
  notifications: [],
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/announcements/notifications', getOrgConfig());
      set({ 
        notifications: response.data?.data || response.data || [], 
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch notifications', 
        isLoading: false 
      });
    }
  }
}));
