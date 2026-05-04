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
      console.log('Login Response:', response.data);
      
      // The API wraps the result in a 'data' property
      const { token, user } = response.data.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }

      localStorage.setItem('token', token);
      if (user?.orgId) {
        localStorage.setItem('orgId', user.orgId);
      }
      
      set({ user, token, isLoading: false });
      return true;
    } catch (error: any) {
      console.error('Login processing error:', error);
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
      // Signup might also wrap data, though usually we just care about success
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      console.error('Signup Error:', error.response?.data);
      set({ error: error.response?.data?.message || error.response?.data?.error || 'Signup failed', isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('orgId');
    set({ user: null, token: null });
  },
}));
