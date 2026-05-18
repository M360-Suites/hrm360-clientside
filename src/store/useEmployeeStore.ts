import { create } from "zustand";
import api from "../api/axios";
import { getCookie } from "../utils/cookies";

interface EmployeeState {
  employees: any[];
  currentEmployee: any | null;
  isLoading: boolean;
  error: string | null;

  fetchEmployees: () => Promise<void>;
  fetchEmployeeById: (id: string) => Promise<void>;
  createEmployee: (data: any) => Promise<boolean>;
  updateEmployee: (id: string, data: any) => Promise<boolean>;
  deleteEmployee: (id: string) => Promise<boolean>;
}

const getOrgId = () => {
  const orgId = getCookie("orgId");

  if (!orgId) {
    throw new Error("Organization ID missing. Please complete onboarding first.");
  }

  return orgId;
};

const getOrgConfig = () => {
  const orgId = getOrgId();

  return {
    headers: {
      "x-org-id": orgId,
    },
  };
};

const cleanPayload = (payload: any) => {
  const cleaned = { ...payload };

  Object.keys(cleaned).forEach((key) => {
    if (
      cleaned[key] === undefined ||
      cleaned[key] === null ||
      cleaned[key] === ""
    ) {
      delete cleaned[key];
    }
  });

  return cleaned;
};

const normalizeEmployees = (responseData: any) => {
  const data = responseData?.data || responseData?.employees || responseData;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.employees)) return data.employees;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  employees: [],
  currentEmployee: null,
  isLoading: false,
  error: null,

  fetchEmployees: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.get("/employees", getOrgConfig());

      set({
        employees: normalizeEmployees(response.data),
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch employees",
        isLoading: false,
      });
    }
  },

  fetchEmployeeById: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.get(`/employee/${id}`, getOrgConfig());

      set({
        currentEmployee: response.data?.data || response.data?.employee || response.data,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch employee",
        isLoading: false,
      });
    }
  },

  createEmployee: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const payload = cleanPayload({
        name: data.name?.trim(),
        email: data.email?.trim(),
        role: data.role?.trim(),
        workMode: data.workMode,
        status: data.status || "Active",
        password: data.password?.trim(),
        joinedAt: data.joinedAt || new Date().toISOString(),

        basicSalary: Number(data.basicSalary || 0),
        allowances: Number(data.allowances || 0),
        deductions: Number(data.deductions || 0),

        accountNumber: data.accountNumber,
        bankCode: data.bankCode,
        bankName: data.bankName,
        accountName: data.accountName,
        paystackRecipientCode: data.paystackRecipientCode,
      });

      console.log("CREATE EMPLOYEE PAYLOAD:", payload);
      console.log("CREATE EMPLOYEE HEADERS:", getOrgConfig());

      await api.post("/employee", payload, getOrgConfig());

      await get().fetchEmployees();

      set({ isLoading: false, error: null });
      return true;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to create employee",
        isLoading: false,
      });

      return false;
    }
  },

  updateEmployee: async (id, data) => {
    set({ isLoading: true, error: null });

    try {
      const payload = cleanPayload({
        name: data.name?.trim(),
        email: data.email?.trim(),
        role: data.role?.trim(),
        workMode: data.workMode,
        status: data.status || "Active",
        password: data.password,
        joinedAt: data.joinedAt,

        basicSalary: Number(data.basicSalary || 0),
        allowances: Number(data.allowances || 0),
        deductions: Number(data.deductions || 0),

        accountNumber: data.accountNumber,
        bankCode: data.bankCode,
        bankName: data.bankName,
        accountName: data.accountName,
        paystackRecipientCode: data.paystackRecipientCode,
      });

      await api.put(`/employee/${id}`, payload, getOrgConfig());

      await get().fetchEmployees();

      set({ isLoading: false, error: null });
      return true;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to update employee",
        isLoading: false,
      });

      return false;
    }
  },

  deleteEmployee: async (id) => {
    set({ isLoading: true, error: null });

    try {
      await api.delete(`/employee/${id}`, getOrgConfig());

      await get().fetchEmployees();

      set({ isLoading: false, error: null });
      return true;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to delete employee",
        isLoading: false,
      });

      return false;
    }
  },
}));