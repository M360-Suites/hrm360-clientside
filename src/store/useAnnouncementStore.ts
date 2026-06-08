import { create } from "zustand";
import api from "../api/axios";
import { getCookie } from "../utils/cookies";

export interface AnnouncementItem {
  _id?: string;
  id?: string;
  title: string;
  body?: string;
  message?: string;
  receivers?: string;
  doc?: string;
  createdAt?: string;
  updatedAt?: string;
  date?: string;
  read?: boolean;
  isRead?: boolean;
  readAt?: string;
  createdBy?: any;
}

interface AnnouncementPayload {
  title: string;
  body: string;
  receivers?: string;
  doc?: string;
}

interface AnnouncementState {
  announcements: AnnouncementItem[];
  selectedAnnouncement: AnnouncementItem | null;
  isLoading: boolean;
  error: string | null;
  fetchAnnouncements: () => Promise<void>;
  fetchUserAnnouncements: () => Promise<void>;
  fetchAnnouncementById: (
    announcementId: string,
    options?: { userScope?: boolean },
  ) => Promise<AnnouncementItem | null>;
  createAnnouncement: (payload: AnnouncementPayload) => Promise<boolean>;
  updateAnnouncement: (
    announcementId: string,
    payload: Partial<AnnouncementPayload>,
  ) => Promise<boolean>;
  deleteAnnouncement: (announcementId: string) => Promise<boolean>;
  clearSelectedAnnouncement: () => void;
}

const getOrgConfig = () => {
  const orgId = getCookie("orgId");
  if (!orgId) throw new Error("Organization ID missing.");
  return { headers: { "x-org-id": orgId } };
};

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const isBackendRulesetError = (error: any) =>
  String(error?.response?.data?.message || error?.message || "")
    .toLowerCase()
    .includes("empty ruleset");

const normalizeDoc = (doc?: string) => String(doc || "").trim();

const normalizeArrayData = (responseData: any) => {
  const data = responseData?.data || responseData;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.announcements)) return data.announcements;
  if (Array.isArray(data?.announcement)) return data.announcement;
  if (Array.isArray(data?.notifications)) return data.notifications;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const normalizeSingleData = (responseData: any) => {
  const data = responseData?.data || responseData;
  return data?.announcement || data?.notification || data || null;
};

const getAnnouncementId = (announcement: AnnouncementItem) =>
  announcement?._id || announcement?.id || "";

export const useAnnouncementStore = create<AnnouncementState>((set, get) => ({
  announcements: [],
  selectedAnnouncement: null,
  isLoading: false,
  error: null,

  fetchAnnouncements: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/announcements", getOrgConfig());
      set({
        announcements: normalizeArrayData(response.data),
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        error: getErrorMessage(error, "Failed to fetch announcements"),
        isLoading: false,
      });
    }
  },

  fetchUserAnnouncements: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/announcements/user", getOrgConfig());
      set({
        announcements: normalizeArrayData(response.data),
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        error: getErrorMessage(error, "Failed to fetch your announcements"),
        isLoading: false,
      });
    }
  },

  fetchAnnouncementById: async (announcementId, options) => {
    set({ isLoading: true, error: null });
    try {
      const url = options?.userScope
        ? `/announcements/user/${announcementId}`
        : `/announcements/${announcementId}`;
      const response = await api.get(url, getOrgConfig());
      const announcement = normalizeSingleData(response.data);

      set({
        selectedAnnouncement: announcement,
        announcements: get().announcements.map((item) =>
          getAnnouncementId(item) === announcementId
            ? { ...item, ...announcement, read: true, isRead: true }
            : item,
        ),
        isLoading: false,
        error: null,
      });

      return announcement;
    } catch (error: any) {
      set({
        error: getErrorMessage(error, "Failed to fetch announcement"),
        isLoading: false,
      });
      return null;
    }
  },

  createAnnouncement: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const cleanPayload = {
        title: payload.title.trim(),
        body: payload.body.trim(),
        receivers: payload.receivers || "all",
        doc: normalizeDoc(payload.doc),
      };

      const response = await api.post(
        "/announcements",
        cleanPayload,
        getOrgConfig(),
      );
      const created = normalizeSingleData(response.data);

      set({
        announcements: created
          ? [created, ...get().announcements]
          : get().announcements,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (error: any) {
      set({
        error: isBackendRulesetError(error)
          ? "The announcement request is valid, but the backend validation schema is failing. Please ask the backend team to check the create announcement validator."
          : getErrorMessage(error, "Failed to create announcement"),
        isLoading: false,
      });
      return false;
    }
  },

  updateAnnouncement: async (announcementId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const cleanPayload = {
        ...(payload.title !== undefined ? { title: payload.title.trim() } : {}),
        ...(payload.body !== undefined ? { body: payload.body.trim() } : {}),
        ...(payload.doc !== undefined ? { doc: normalizeDoc(payload.doc) } : {}),
      };

      const response = await api.put(
        `/announcements/${announcementId}`,
        cleanPayload,
        getOrgConfig(),
      );
      const updated = normalizeSingleData(response.data);

      set({
        announcements: get().announcements.map((item) =>
          getAnnouncementId(item) === announcementId
            ? { ...item, ...updated }
            : item,
        ),
        selectedAnnouncement:
          getAnnouncementId(get().selectedAnnouncement || ({} as any)) ===
          announcementId
            ? { ...(get().selectedAnnouncement || {}), ...updated }
            : get().selectedAnnouncement,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (error: any) {
      set({
        error: isBackendRulesetError(error)
          ? "The announcement request is valid, but the backend validation schema is failing. Please ask the backend team to check the edit announcement validator."
          : getErrorMessage(error, "Failed to update announcement"),
        isLoading: false,
      });
      return false;
    }
  },

  deleteAnnouncement: async (announcementId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/announcements/${announcementId}`, getOrgConfig());

      set({
        announcements: get().announcements.filter(
          (item) => getAnnouncementId(item) !== announcementId,
        ),
        selectedAnnouncement:
          getAnnouncementId(get().selectedAnnouncement || ({} as any)) ===
          announcementId
            ? null
            : get().selectedAnnouncement,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (error: any) {
      set({
        error: getErrorMessage(error, "Failed to delete announcement"),
        isLoading: false,
      });
      return false;
    }
  },

  clearSelectedAnnouncement: () => set({ selectedAnnouncement: null }),
}));
