import { create } from "zustand";
import api from "../api/axios";
import { setCookie } from "../utils/cookies";

interface OrgState {
  organization: any | null;
  organizations: any[];
  isLoading: boolean;
  error: string | null;

  createOrg: (data: any) => Promise<boolean>;
  fetchOrganizations: () => Promise<void>;
  completeOnboarding: (data: any) => Promise<boolean>;
}

export const useOrgStore = create<OrgState>((set) => ({
  organization: null,
  organizations: [],
  isLoading: false,
  error: null,

  createOrg: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.post("/org/", data);

      const org =
        response.data.data ||
        response.data.organization ||
        response.data.org ||
        response.data;

      const orgId = org?._id || org?.id || org?.orgId;

      if (!orgId) {
        throw new Error("Organization created, but no organization ID was returned.");
      }

      setCookie("orgId", orgId);

      set({
        organization: org,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to create organization",
        isLoading: false,
      });

      return false;
    }
  },

  fetchOrganizations: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.get("/org");

      const organizations = response.data.data || response.data.organizations || response.data;

      set({
        organizations: Array.isArray(organizations) ? organizations : [],
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to fetch organizations",
        isLoading: false,
      });
    }
  },

  completeOnboarding: async (data) => {
    set({ isLoading: true, error: null });

    try {
      await api.post("/auth/onboarding", data);

      set({
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to complete onboarding",
        isLoading: false,
      });

      return false;
    }
  },
}));