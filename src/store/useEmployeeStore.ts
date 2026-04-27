import { create } from 'zustand';
import api from '../api/axios';

interface EmployeeState {
  employees: any[];
  currentEmployee: any | null;
  isLoading: boolean;
  error: string | null;
  fetchEmployees: () => Promise<void>;
  fetchEmployeeById: (id: string) => Promise<void>;
  createEmployee: (data: any) => Promise<void>;
  updateEmployee: (id: string, data: any) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
}

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  employees: [],
  currentEmployee: null,
  isLoading: false,
  error: null,

  fetchEmployees: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/employees');
      console.log('Fetch Employees Response:', response.data);
      
      let employeeData = response.data.data || response.data;
      
      // If the API returns an object instead of an array, try to find the array within it
      if (!Array.isArray(employeeData) && typeof employeeData === 'object') {
        employeeData = employeeData.employees || Object.values(employeeData).find(val => Array.isArray(val)) || [];
      }
      
      set({ employees: Array.isArray(employeeData) ? employeeData : [], isLoading: false });
    } catch (error: any) {
      console.error('Fetch Employees Error:', error);
      set({ error: error.response?.data?.message || 'Failed to fetch employees', isLoading: false });
    }
  },

  fetchEmployeeById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/employee/${id}`);
      set({ currentEmployee: response.data.data || response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch employee', isLoading: false });
    }
  },

  createEmployee: async (data) => {
    set({ isLoading: true, error: null });
    const orgId = localStorage.getItem('orgId');
    try {
      // Documentation says orgId is in body for POST
      await api.post('/employee', { ...data, orgId });
      await get().fetchEmployees();
    } catch (error: any) {
      console.error('Create Employee Error:', error.response?.data);
      // If server says orgId is not allowed, try without it
      if (error.response?.data?.message?.includes('orgId')) {
        try {
          await api.post('/employee', data);
          await get().fetchEmployees();
          return;
        } catch (retryError: any) {
          set({ error: retryError.response?.data?.message || 'Failed to create employee', isLoading: false });
          return;
        }
      }
      set({ error: error.response?.data?.message || 'Failed to create employee', isLoading: false });
    }
  },

  updateEmployee: async (id, data) => {
    set({ isLoading: true, error: null });
    const orgId = localStorage.getItem('orgId');
    try {
      // Documentation explicitly includes orgId in PUT body
      // Adding it to query as well to satisfy potential strict ownership validation
      await api.put(`/employee/${id}?orgId=${orgId}`, { 
        ...data, 
        orgId,
        basicSalary: Number(data.basicSalary || 0),
        allowances: Number(data.allowances || 0),
        deductions: Number(data.deductions || 0)
      });
      await get().fetchEmployees();
    } catch (error: any) {
      console.error('Update Employee Error:', error.response?.data);
      set({ error: error.response?.data?.message || 'Failed to update employee', isLoading: false });
    }
  },

  deleteEmployee: async (id) => {
    set({ isLoading: true, error: null });
    const orgId = localStorage.getItem('orgId');
    try {
      // Documentation: DELETE /employee/{id} with x-org-id header
      // Adding orgId to query as well as a fallback for strict validation
      await api.delete(`/employee/${id}?orgId=${orgId}`);
      await get().fetchEmployees();
    } catch (error: any) {
      console.error('Delete Employee Error:', error.response?.data);
      set({ error: error.response?.data?.message || 'Failed to delete employee', isLoading: false });
    }
  },
}));
