import { create } from 'zustand';
import api from '../api/axios';

interface AuthState {
  user: any;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (data: any) => Promise<boolean>;
  signup: (data: any) => Promise<boolean>;
  logout: () => void;
  sendCode: (email: string, reason: string) => Promise<boolean>;
  verifyCode: (email: string, code: string, reason: string) => Promise<boolean>;
  resetPassword: (data: any) => Promise<boolean>;
  activateAccount: (token: string) => Promise<boolean>;
  initiateGoogleLogin: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/signin', credentials);
      const { token, user } = response.data.data || response.data;
      
      if (!token) throw new Error('No token received');

      localStorage.setItem('token', token);
      if (user?.orgId) localStorage.setItem('orgId', user.orgId);
      
      set({ user, token, isLoading: false });
      return true;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || 'Login failed', 
        isLoading: false 
      });
      return false;
    }
  },

  signup: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/signup', userData);
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.response?.data?.error || 'Signup failed', 
        isLoading: false 
      });
      return false;
    }
  },

  sendCode: async (email, reason) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/send-code', { email, reason });
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to send code', isLoading: false });
      return false;
    }
  },

  verifyCode: async (email, code, reason) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/verify-code', { email, code, reason });
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Invalid code', isLoading: false });
      return false;
    }
  },

  resetPassword: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/reset', data);
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Reset failed', isLoading: false });
      return false;
    }
  },

  activateAccount: async (token) => {
    set({ isLoading: true, error: null });
    try {
      await api.get(`/auth/activation?token=${token}`);
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Activation failed', isLoading: false });
      return false;
    }
  },

  initiateGoogleLogin: () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'https://hrm360-backend.onrender.com/api'}/auth/google`;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('orgId');
    set({ user: null, token: null });
  },
}));
