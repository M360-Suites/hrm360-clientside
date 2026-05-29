import { create } from "zustand";
import api from "../api/axios";
import { getCookie } from "../utils/cookies";

interface EmployeeState {
  employees: any[];
  currentEmployee: any | null;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;

  fetchEmployees: (params?: { page?: number; limit?: number }) => Promise<void>;
  setEmployeePage: (page: number) => Promise<void>;
  setEmployeeLimit: (limit: number) => Promise<void>;
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

const normalizeEmployeesMeta = (responseData: any) => {
  const root = responseData?.data || responseData || {};
  return {
    page: Number(root?.page || 1),
    total: Number(root?.total || 0),
    totalPages: Number(root?.totalPages || 1),
  };
};

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  employees: [],
  currentEmployee: null,
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
  isLoading: false,
  error: null,

  fetchEmployees: async (params) => {
    set({ isLoading: true, error: null });

    try {
      const nextPage = params?.page ?? get().page ?? 1;
      const nextLimit = params?.limit ?? get().limit ?? 20;
      const response = await api.get("/employees", {
        ...getOrgConfig(),
        params: {
          page: nextPage,
          limit: nextLimit,
        },
      });
      const meta = normalizeEmployeesMeta(response.data);

      set({
        employees: normalizeEmployees(response.data),
        page: meta.page || nextPage,
        limit: nextLimit,
        total: meta.total,
        totalPages: meta.totalPages || 1,
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

  setEmployeePage: async (page) => {
    const safePage = Math.max(1, Number(page || 1));
    await get().fetchEmployees({ page: safePage });
  },

  setEmployeeLimit: async (limit) => {
    const safeLimit = Math.max(1, Number(limit || 20));
    await get().fetchEmployees({ page: 1, limit: safeLimit });
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

      await get().fetchEmployees({ page: get().page, limit: get().limit });

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

      await get().fetchEmployees({ page: get().page, limit: get().limit });

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
      const currentPage = get().page;
      const nextTotal = Math.max(0, get().total - 1);
      const lastPageAfterDelete = Math.max(1, Math.ceil(nextTotal / get().limit));
      const targetPage = Math.min(currentPage, lastPageAfterDelete);
      await get().fetchEmployees({ page: targetPage, limit: get().limit });

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
