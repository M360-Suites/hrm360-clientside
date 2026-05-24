import { create } from "zustand";
import api from "../api/axios";
import { getCookie } from "../utils/cookies";

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
  isPayrollPinConfigured: boolean;
  fetchSummary: () => Promise<void>;
  fetchEmployeesSalary: () => Promise<void>;
  configurePayrollPin: (pin: string) => Promise<boolean>;
  runPayroll: (payPeriod: string, pin: string) => Promise<boolean>;
  payPayroll: (payPeriod: string, employeeId: string, pin: string) => Promise<boolean>;
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

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const normalizeSummary = (responseData: any) =>
  responseData?.data || responseData?.summary || responseData || null;

const normalizeEmployeesSalary = (responseData: any) => {
  const data = responseData?.data || responseData?.employees || responseData;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.employees)) return data.employees;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const usePayrollStore = create<PayrollState>((set, get) => ({
  summary: null,
  employeesSalary: [],
  isLoading: false,
  error: null,
  isPayrollPinConfigured: true,

  fetchSummary: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/payroll/summary", getOrgConfig());
      set({
        summary: normalizeSummary(response.data),
        isLoading: false,
        error: null,
        isPayrollPinConfigured: true,
      });
    } catch (error: any) {
      const resolvedError = getErrorMessage(error, "Failed to fetch payroll summary");
      const lowered = String(resolvedError).toLowerCase();
      set({
        error: resolvedError,
        isLoading: false,
        isPayrollPinConfigured: !(
          lowered.includes("payroll not configured") ||
          lowered.includes("configure payroll pin")
        ),
      });
    }
  },

  fetchEmployeesSalary: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/payroll/employees", getOrgConfig());
      set({
        employeesSalary: normalizeEmployeesSalary(response.data),
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        error: getErrorMessage(error, "Failed to fetch employee salary data"),
        isLoading: false,
      });
    }
  },

  configurePayrollPin: async (pin) => {
    set({ isLoading: true, error: null });
    try {
      await api.put("/org", { pin }, getOrgConfig());
      set({
        isLoading: false,
        error: null,
        isPayrollPinConfigured: true,
      });
      return true;
    } catch (error: any) {
      set({
        error: getErrorMessage(error, "Failed to configure payroll PIN"),
        isLoading: false,
      });
      return false;
    }
  },

  runPayroll: async (payPeriod, pin) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(
        "/payroll/run",
        { payPeriod },
        {
          ...getOrgConfig(),
          headers: {
            ...getOrgConfig().headers,
            "x-payroll-pin": pin,
          },
        },
      );
      await get().fetchSummary();
      await get().fetchEmployeesSalary();
      set({ isLoading: false, error: null });
      return true;
    } catch (error: any) {
      const resolvedError = getErrorMessage(error, "Failed to run payroll");
      const lowered = String(resolvedError).toLowerCase();
      set({
        error: resolvedError,
        isLoading: false,
        isPayrollPinConfigured: !(
          lowered.includes("payroll not configured") ||
          lowered.includes("configure payroll pin")
        ),
      });
      return false;
    }
  },

  payPayroll: async (payPeriod, employeeId, pin) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(
        "/payroll/pay",
        { payPeriod, employeeId },
        {
          ...getOrgConfig(),
          headers: {
            ...getOrgConfig().headers,
            "x-payroll-pin": pin,
          },
        },
      );
      await get().fetchSummary();
      await get().fetchEmployeesSalary();
      set({ isLoading: false, error: null });
      return true;
    } catch (error: any) {
      const resolvedError = getErrorMessage(error, "Failed to pay payroll");
      const lowered = String(resolvedError).toLowerCase();
      set({
        error: resolvedError,
        isLoading: false,
        isPayrollPinConfigured: !(
          lowered.includes("payroll not configured") ||
          lowered.includes("configure payroll pin")
        ),
      });
      return false;
    }
  },
}));
