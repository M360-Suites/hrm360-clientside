import { create } from "zustand";
import api from "../../api/axios";
import { setCookie } from "../../utils/cookies";

interface onBoardingData {
  password: string;
  email: string;
}

interface passwordChangeData {
  oldPassword: string;
  newPassword: string;
}

interface OnboardingState {
  code: string;
  token: string | null;
  error: string | null;
  loading: boolean;
  isChanging: boolean;
  onboardingSteps: number;
  setCode: (code: string) => void;
  setOnboardingSteps: (steps: number) => void;
  completeOnboarding: (data: onBoardingData) => Promise<boolean>;
  passwordChange: (data: passwordChangeData) => Promise<boolean>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  code: "",
  error: null,
  token: null,
  loading: false,
  isChanging: false,
  onboardingSteps: 1,
  setCode: (code: string) => set({ code }),
  setOnboardingSteps: (steps: number) => set({ onboardingSteps: steps }),
  completeOnboarding: async (data: onBoardingData) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post("/employee/login", data);
      if (response.status === 200) {
        // try to extract tokens from the response and store them for the password flow
        const responseData = response.data?.data || response.data;

        const accessToken = responseData?.token || responseData?.accessToken || responseData?.access_token || null;
        if (accessToken) {
          setCookie("token", accessToken);
          setCookie("code", data.password);
        }
        set({ onboardingSteps: 1, loading: false, error: null, token: response.data.token });
        return true;
      } else {
        set({ loading: false, error: response.data.message.message || "Failed to complete onboarding" });
        throw new Error("Failed to complete onboarding");
      }
    } catch (error: any) {
      set({ loading: false, error: error.response?.data?.message || error.message || "Failed to complete onboarding" });
      console.error("Error completing onboarding:", error.response?.data?.message || error.message);
      return false;
    } finally {
      set({ loading: false });
    }
},
  passwordChange: async (data: passwordChangeData) => {
    try {
      set({ isChanging: true });
      const response = await api.post("/employee/reset-password", data);
      if (response.status === 200) {
        set({ isChanging: false });
        return true;
      } else {
        set({ isChanging: false, error: response.data.message });
        throw new Error("Failed to change password");
      }
    } catch (error: any) {
      set({ isChanging: false, error: error.response?.data?.message || error.message || "Failed to change password" });
      console.error("Error changing password:", error.response?.data?.message || error.message);
      return false;
    } finally {
      set({ isChanging: false });
    }
  }
}));
    