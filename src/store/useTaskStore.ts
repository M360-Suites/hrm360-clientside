import { create } from "zustand";
import api from "../api/axios";
import { getCookie } from "../utils/cookies";

interface TaskState {
  projects: any[];
  tasks: any[];
  selectedProject: any | null;
  selectedTask: any | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  fetchUserProjects: () => Promise<void>;
  createProject: (payload: any) => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<boolean>;
  createTask: (payload: any) => Promise<boolean>;
  updateTask: (payload: any) => Promise<boolean>;
  commentTask: (payload: { taskId: string; comment: string; projectId?: string }) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  fetchProjectTasks: (args: {
    projectId: string;
    query?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  fetchTaskDetails: (taskId: string) => Promise<void>;
  setSelectedProject: (project: any | null) => void;
  clearSelectedTask: () => void;
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

const normalizeArrayData = (responseData: any) => {
  const data = responseData?.data || responseData;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.projects)) return data.projects;
  if (Array.isArray(data?.project)) return data.project;
  if (Array.isArray(data?.tasks)) return data.tasks;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const extractCreatedProject = (responseData: any) =>
  responseData?.data || responseData?.project || responseData || null;

const normalizeTasksPayload = (responseData: any) => {
  const root = responseData?.data || responseData || {};
  const tasks =
    (Array.isArray(root) && root) ||
    root?.tasks ||
    root?.data ||
    root?.results ||
    [];

  const paginationRoot = root?.pagination || root?.meta || {};

  return {
    tasks: Array.isArray(tasks) ? tasks : [],
    pagination: {
      page: Number(paginationRoot?.page || root?.page || 1),
      limit: Number(paginationRoot?.limit || root?.limit || 20),
      total: Number(paginationRoot?.total || root?.total || 0),
      totalPages: Number(paginationRoot?.totalPages || root?.totalPages || 1),
    },
  };
};

export const useTaskStore = create<TaskState>((set, get) => ({
  projects: [],
  tasks: [],
  selectedProject: null,
  selectedTask: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/task/project", getOrgConfig());
      let projects = normalizeArrayData(response.data);

      if (!projects.length) {
        const userProjectsResponse = await api.get("/task/project/user", getOrgConfig());
        const userProjects = normalizeArrayData(userProjectsResponse.data);
        if (userProjects.length) {
          projects = userProjects;
        }
      }

      const existingProjects = get().projects;
      if (!projects.length && existingProjects.length) {
        set({
          isLoading: false,
          error: null,
        });
        return;
      }

      set({
        projects,
        selectedProject: get().selectedProject || projects[0] || null,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        error: getErrorMessage(error, "Failed to fetch projects"),
        isLoading: false,
      });
    }
  },

  fetchUserProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/task/project/user", getOrgConfig());
      const projects = normalizeArrayData(response.data);
      set({
        projects,
        selectedProject: get().selectedProject || projects[0] || null,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        error: getErrorMessage(error, "Failed to fetch your projects"),
        isLoading: false,
      });
    }
  },

  createProject: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/task/project", payload, getOrgConfig());
      const createdProject = extractCreatedProject(response.data);

      if (createdProject?._id || createdProject?.id) {
        const current = get().projects;
        const createdId = createdProject?._id || createdProject?.id;
        const exists = current.some((p: any) => (p?._id || p?.id) === createdId);
        const nextProjects = exists ? current : [createdProject, ...current];
        set({
          projects: nextProjects,
          selectedProject: createdProject,
        });
      }

      await get().fetchProjects();
      set({ isLoading: false, error: null });
      return true;
    } catch (error: any) {
      set({
        error: getErrorMessage(error, "Failed to create project"),
        isLoading: false,
      });
      return false;
    }
  },

  createTask: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await api.post("/task", payload, getOrgConfig());
      if (payload?.projectId) {
        await get().fetchProjectTasks({ projectId: payload.projectId, status: "All" });
      }
      set({ isLoading: false, error: null });
      return true;
    } catch (error: any) {
      set({
        error: getErrorMessage(error, "Failed to create task"),
        isLoading: false,
      });
      return false;
    }
  },

  deleteProject: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/task/project/${projectId}`, getOrgConfig());
      const nextProjects = get().projects.filter(
        (project: any) => (project?._id || project?.id) !== projectId,
      );
      const currentSelectedId = get().selectedProject?._id || get().selectedProject?.id;
      const nextSelectedProject =
        currentSelectedId === projectId
          ? nextProjects[0] || null
          : get().selectedProject;

      set({
        projects: nextProjects,
        selectedProject: nextSelectedProject,
        tasks: currentSelectedId === projectId ? [] : get().tasks,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (error: any) {
      set({
        error: getErrorMessage(error, "Failed to delete project"),
        isLoading: false,
      });
      return false;
    }
  },

  updateTask: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await api.put("/task", payload, getOrgConfig());
      const projectId = payload?.projectId || get().selectedProject?._id || get().selectedProject?.id;
      if (projectId) {
        await get().fetchProjectTasks({ projectId, status: "All", page: get().pagination.page, limit: get().pagination.limit });
      }
      set({ isLoading: false, error: null });
      return true;
    } catch (error: any) {
      set({
        error: getErrorMessage(error, "Failed to update task"),
        isLoading: false,
      });
      return false;
    }
  },

  commentTask: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await api.patch(
        "/task",
        { taskId: payload.taskId, comment: payload.comment },
        getOrgConfig(),
      );
      const projectId = payload?.projectId || get().selectedProject?._id || get().selectedProject?.id;
      if (projectId) {
        await get().fetchProjectTasks({
          projectId,
          status: "All",
          page: get().pagination.page,
          limit: get().pagination.limit,
        });
      }
      set({ isLoading: false, error: null });
      return true;
    } catch (error: any) {
      set({
        error: getErrorMessage(error, "Failed to add comment"),
        isLoading: false,
      });
      return false;
    }
  },

  deleteTask: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/task/${taskId}`, getOrgConfig());
      const selectedProjectId = get().selectedProject?._id || get().selectedProject?.id;
      if (selectedProjectId) {
        await get().fetchProjectTasks({ projectId: selectedProjectId, status: "All", page: get().pagination.page, limit: get().pagination.limit });
      } else {
        set({
          tasks: get().tasks.filter((t: any) => (t?._id || t?.id) !== taskId),
        });
      }
      set({ isLoading: false, error: null });
      return true;
    } catch (error: any) {
      set({
        error: getErrorMessage(error, "Failed to delete task"),
        isLoading: false,
      });
      return false;
    }
  },

  fetchProjectTasks: async ({ projectId, query, status = "All", page = 1, limit = 50 }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/task/project/${projectId}/tasks`, {
        ...getOrgConfig(),
        params: {
          ...(query ? { query } : {}),
          ...(status ? { status } : {}),
          page,
          limit,
        },
      });

      const normalized = normalizeTasksPayload(response.data);
      set({
        tasks: normalized.tasks,
        pagination: normalized.pagination,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        error: getErrorMessage(error, "Failed to fetch tasks"),
        isLoading: false,
      });
    }
  },

  fetchTaskDetails: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/task/${taskId}`, getOrgConfig());
      set({
        selectedTask: response.data?.data || response.data,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        error: getErrorMessage(error, "Failed to fetch task details"),
        isLoading: false,
      });
    }
  },

  setSelectedProject: (project) => set({ selectedProject: project }),
  clearSelectedTask: () => set({ selectedTask: null }),
}));
