import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Loader2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  CircleDot,
  X,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useEmployeeStore } from "../../store/useEmployeeStore";
import { useTaskStore } from "../../store/useTaskStore";

const normalizeStatus = (status: string) => String(status || "").trim().toLowerCase();

const getTaskDate = (task: any) => task?.dueDate || task?.endDate || task?.deadline || "";
const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : "-");

const TaskManager = () => {
  const { isAdmin } = useAuthStore();
  const { employees, fetchEmployees } = useEmployeeStore();
  const {
    projects,
    tasks,
    selectedProject,
    pagination,
    isLoading,
    error,
    fetchProjects,
    fetchUserProjects,
    createProject,
    createTask,
    fetchProjectTasks,
    setSelectedProject,
  } = useTaskStore();

  const [search, setSearch] = useState("");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [projectForm, setProjectForm] = useState({
    title: "",
    startDate: "",
    dueDate: "",
    team: [] as string[],
    document: "",
  });
  const [taskForm, setTaskForm] = useState({
    projectId: "",
    title: "",
    description: "",
    startDate: "",
    dueDate: "",
    team: [] as string[],
    document: "",
  });

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchProjects();
      fetchEmployees();
    } else {
      fetchUserProjects();
    }
  }, [isAdmin, fetchProjects, fetchUserProjects, fetchEmployees]);

  useEffect(() => {
    if (!selectedProject) return;
    const projectId = selectedProject?._id || selectedProject?.id;
    if (!projectId) return;
    fetchProjectTasks({ projectId, query: search, status: "All", page: 1, limit: 80 });
  }, [selectedProject, search, fetchProjectTasks]);

  useEffect(() => {
    if (!taskForm.projectId && selectedProject) {
      setTaskForm((prev) => ({
        ...prev,
        projectId: selectedProject?._id || selectedProject?.id || "",
      }));
    }
  }, [selectedProject, taskForm.projectId]);

  useEffect(() => {
    if (!error) return;
    showToast("error", error);
  }, [error]);

  const boardData = useMemo(() => {
    const completed = tasks.filter((task: any) => normalizeStatus(task.status) === "completed");
    const inProgress = tasks.filter((task: any) => {
      const status = normalizeStatus(task.status);
      return status === "in progress" || status === "in-progress" || status === "progress";
    });
    const due = tasks.filter((task: any) => {
      const status = normalizeStatus(task.status);
      return status === "due" || status === "pending" || status === "todo";
    });
    return { completed, inProgress, due };
  }, [tasks]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...projectForm,
      team: projectForm.team.filter(Boolean),
      document: projectForm.document.trim() || undefined,
    };
    const ok = await createProject(payload);
    if (!ok) return;

    setShowProjectModal(false);
    setProjectForm({ title: "", startDate: "", dueDate: "", team: [], document: "" });
    showToast("success", "Project created successfully.");
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...taskForm,
      team: taskForm.team.filter(Boolean),
      document: taskForm.document.trim() || undefined,
    };
    const ok = await createTask(payload);
    if (!ok) return;

    setShowTaskModal(false);
    setTaskForm((prev) => ({
      ...prev,
      title: "",
      description: "",
      startDate: "",
      dueDate: "",
      team: [],
      document: "",
    }));
    showToast("success", "Task created successfully.");
  };

  const onSwitchProject = (project: any) => {
    setSelectedProject(project);
    setTaskForm((prev) => ({
      ...prev,
      projectId: project?._id || project?.id || "",
    }));
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-100 px-4 py-3 rounded-xl text-sm font-semibold text-white shadow-lg ${
            toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Task Board</h2>
          <p className="text-sm text-gray-500">Review cycles, goal tracking, and project execution</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowTaskModal(true)}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
          >
            <Plus size={16} /> Create Task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3 h-fit">
          <h3 className="font-semibold text-gray-800">Projects</h3>
          <div className="space-y-2">
            {projects.map((project: any, idx: number) => {
              const projectId = project?._id || project?.id || String(idx);
              const isActive = (selectedProject?._id || selectedProject?.id) === projectId;
              return (
                <button
                  key={projectId}
                  type="button"
                  onClick={() => onSwitchProject(project)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm flex items-center justify-between ${
                    isActive
                      ? "bg-[#3B00D9] text-white border-[#3B00D9]"
                      : "bg-white border-gray-200 text-gray-700 hover:border-[#3B00D9]/40"
                  }`}
                >
                  <span className="truncate">{project?.title || project?.name || "Untitled Project"}</span>
                  <MoreVertical size={15} className={isActive ? "text-white/80" : "text-gray-400"} />
                </button>
              );
            })}
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowProjectModal(true)}
              className="w-full border border-dashed border-[#3B00D9]/40 text-[#3B00D9] rounded-xl py-2.5 text-sm font-medium hover:bg-[#3B00D9]/5"
            >
              + Add new project
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedProject?.title || selectedProject?.name || "Select a project"}
            </h3>
            <div className="relative w-full sm:w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search task..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <BoardColumn title="Completed" tone="green" icon={<CheckCircle2 size={14} />} tasks={boardData.completed} />
            <BoardColumn title="In progress" tone="orange" icon={<CircleDot size={14} />} tasks={boardData.inProgress} />
            <BoardColumn title="Due task" tone="red" icon={<AlertTriangle size={14} />} tasks={boardData.due} />
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px] flex items-center justify-center">
          <Loader2 className="animate-spin text-[#3B00D9]" size={30} />
        </div>
      )}

      {showProjectModal && (
        <ModalShell title="Create Project" onClose={() => setShowProjectModal(false)}>
          <form className="space-y-3" onSubmit={handleCreateProject}>
            <TextInput value={projectForm.title} onChange={(v) => setProjectForm((p) => ({ ...p, title: v }))} placeholder="Project title" required />
            <div className="grid grid-cols-2 gap-3">
              <DateInput value={projectForm.startDate} onChange={(v) => setProjectForm((p) => ({ ...p, startDate: v }))} required />
              <DateInput value={projectForm.dueDate} onChange={(v) => setProjectForm((p) => ({ ...p, dueDate: v }))} required />
            </div>
            <TextInput value={projectForm.document} onChange={(v) => setProjectForm((p) => ({ ...p, document: v }))} placeholder="Document ID (optional)" />
            {isAdmin && (
              <select
                multiple
                value={projectForm.team}
                onChange={(e) =>
                  setProjectForm((p) => ({
                    ...p,
                    team: Array.from(e.target.selectedOptions).map((option) => option.value),
                  }))
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm min-h-28"
              >
                {employees.map((emp: any, idx: number) => (
                  <option key={emp._id || emp.id || idx} value={emp._id || emp.id}>
                    {emp.name || emp.email}
                  </option>
                ))}
              </select>
            )}
            <SubmitActions onCancel={() => setShowProjectModal(false)} />
          </form>
        </ModalShell>
      )}

      {showTaskModal && (
        <ModalShell title="Create Task" onClose={() => setShowTaskModal(false)}>
          <form className="space-y-3" onSubmit={handleCreateTask}>
            <select
              value={taskForm.projectId}
              onChange={(e) => setTaskForm((p) => ({ ...p, projectId: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
              required
            >
              <option value="">Select project</option>
              {projects.map((project: any, idx: number) => (
                <option key={project._id || project.id || idx} value={project._id || project.id}>
                  {project.title || project.name || "Untitled Project"}
                </option>
              ))}
            </select>
            <TextInput value={taskForm.title} onChange={(v) => setTaskForm((p) => ({ ...p, title: v }))} placeholder="Task title" required />
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Task description"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm min-h-24"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <DateInput value={taskForm.startDate} onChange={(v) => setTaskForm((p) => ({ ...p, startDate: v }))} required />
              <DateInput value={taskForm.dueDate} onChange={(v) => setTaskForm((p) => ({ ...p, dueDate: v }))} required />
            </div>
            <TextInput value={taskForm.document} onChange={(v) => setTaskForm((p) => ({ ...p, document: v }))} placeholder="Document ID (optional)" />
            {isAdmin && (
              <select
                multiple
                value={taskForm.team}
                onChange={(e) =>
                  setTaskForm((p) => ({
                    ...p,
                    team: Array.from(e.target.selectedOptions).map((option) => option.value),
                  }))
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm min-h-28"
              >
                {employees.map((emp: any, idx: number) => (
                  <option key={emp._id || emp.id || idx} value={emp._id || emp.id}>
                    {emp.name || emp.email}
                  </option>
                ))}
              </select>
            )}
            <SubmitActions onCancel={() => setShowTaskModal(false)} />
          </form>
        </ModalShell>
      )}

      {!isLoading && selectedProject && (
        <p className="text-xs text-gray-400">
          {pagination.total > 0 ? `${pagination.total} total tasks loaded` : "No tasks returned for this project yet."}
        </p>
      )}
    </div>
  );
};

const BoardColumn = ({
  title,
  tone,
  icon,
  tasks,
}: {
  title: string;
  tone: "green" | "orange" | "red";
  icon: React.ReactNode;
  tasks: any[];
}) => {
  const headerTone = {
    green: "bg-[#65C237] text-white",
    orange: "bg-[#FF6D1B] text-white",
    red: "bg-[#D90429] text-white",
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 ${headerTone[tone]}`}>
        {icon} {title} <span className="ml-auto text-xs opacity-90">{tasks.length}</span>
      </div>
      <div className="p-3 space-y-3 min-h-[420px] max-h-[68vh] overflow-y-auto">
        {tasks.map((task: any, idx: number) => (
          <TaskCard key={task._id || task.id || idx} task={task} />
        ))}
        {tasks.length === 0 && <div className="text-xs text-gray-500 text-center py-8">No tasks here</div>}
      </div>
    </div>
  );
};

const TaskCard = ({ task }: { task: any }) => {
  const teamCount = Array.isArray(task?.team) ? task.team.length : 0;
  return (
    <div className="border border-gray-100 rounded-xl p-3">
      <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">{task?.title || "Untitled task"}</h4>
      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task?.description || "No description provided."}</p>
      <div className="mt-3 h-1.5 rounded-full bg-gray-100">
        <div className="h-full w-[70%] bg-[#3B00D9] rounded-full" />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span className="inline-flex items-center gap-1">
          <Calendar size={12} /> Due: {formatDate(getTaskDate(task))}
        </span>
        <span>{teamCount} assignee{teamCount === 1 ? "" : "s"}</span>
      </div>
    </div>
  );
};

const ModalShell = ({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const TextInput = ({
  value,
  onChange,
  placeholder,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
    required={required}
  />
);

const DateInput = ({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) => (
  <input
    type="date"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
    required={required}
  />
);

const SubmitActions = ({ onCancel }: { onCancel: () => void }) => (
  <div className="pt-2 flex items-center gap-3">
    <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600">
      Cancel
    </button>
    <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#3B00D9] text-white hover:bg-[#3500c0]">
      Save
    </button>
  </div>
);

export default TaskManager;

