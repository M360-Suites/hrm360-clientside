import { create } from 'zustand';
import api from '../api/axios';

interface PayrollSummary {
  totalEmployees: number;
  totalGrossSalary: number;
  totalDeductions: number;
  totalNetSalary: number;
  pendingPayslips: number;
}

interface PayrollState {
  summary: PayrollSummary | null;
  employeesSalary: any[];
  isLoading: boolean;
  error: string | null;
  fetchSummary: () => Promise<void>;
  fetchEmployeesSalary: () => Promise<void>;
  runPayroll: (payPeriod: string, pin: string) => Promise<void>;
  payPayroll: (payPeriod: string, employeeId: string, pin: string) => Promise<void>;
}

export const usePayrollStore = create<PayrollState>((set, get) => ({
  summary: null,
  employeesSalary: [],
  isLoading: false,
  error: null,

  fetchSummary: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/payroll/summary');
      set({ summary: response.data.data || response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch payroll summary', isLoading: false });
    }
  },

  fetchEmployeesSalary: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/payroll/employees');
      let data = response.data.data || response.data;
      if (!Array.isArray(data) && typeof data === 'object') {
        data = data.employees || Object.values(data).find(val => Array.isArray(val)) || [];
      }
      set({ employeesSalary: Array.isArray(data) ? data : [], isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch employee salary data', isLoading: false });
    }
  },

  runPayroll: async (payPeriod, pin) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/payroll/run', { payPeriod }, {
        headers: { 'x-payroll-pin': pin }
      });
      await get().fetchSummary();
      await get().fetchEmployeesSalary();
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to run payroll', isLoading: false });
    }
  },

  payPayroll: async (payPeriod, employeeId, pin) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/payroll/pay', { payPeriod, employeeId }, {
        headers: { 'x-payroll-pin': pin }
      });
      await get().fetchSummary();
      await get().fetchEmployeesSalary();
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to pay payroll', isLoading: false });
    }
  },
}));
