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
const isValidObjectId = (value?: string) =>
  typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value.trim());

const getTaskDate = (task: any) => task?.dueDate || task?.endDate || task?.deadline || "";
const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : "-");
const getTodayDateInput = () => new Date().toISOString().slice(0, 10);

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
    updateTask,
    deleteTask,
    fetchProjectTasks,
    setSelectedProject,
  } = useTaskStore();

  const [search, setSearch] = useState("");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState<any | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<"completed" | "inProgress" | "due" | null>(null);
  const [activeTaskMenuId, setActiveTaskMenuId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [projectForm, setProjectForm] = useState({
    title: "",
    startDate: getTodayDateInput(),
    dueDate: getTodayDateInput(),
    team: [] as string[],
    document: "",
    documentFile: null as File | null,
  });
  const [taskForm, setTaskForm] = useState({
    projectId: "",
    title: "",
    description: "",
    startDate: getTodayDateInput(),
    dueDate: getTodayDateInput(),
    team: [] as string[],
    document: "",
    documentFile: null as File | null,
  });
  const [editTaskForm, setEditTaskForm] = useState({
    _id: "",
    title: "",
    description: "",
    dueDate: getTodayDateInput(),
    status: "Pending",
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
    const docId = isValidObjectId(projectForm.document) ? projectForm.document.trim() : undefined;
    const payload = {
      title: projectForm.title,
      startDate: projectForm.startDate,
      dueDate: projectForm.dueDate,
      team: projectForm.team.filter(Boolean),
      document: docId,
    };
    const ok = await createProject(payload);
    if (!ok) return;

    setShowProjectModal(false);
    setProjectForm({
      title: "",
      startDate: getTodayDateInput(),
      dueDate: getTodayDateInput(),
      team: [],
      document: "",
      documentFile: null,
    });
    showToast("success", "Project created successfully.");
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const docId = isValidObjectId(taskForm.document) ? taskForm.document.trim() : undefined;
    const payload = {
      projectId: taskForm.projectId,
      title: taskForm.title,
      description: taskForm.description,
      startDate: taskForm.startDate,
      dueDate: taskForm.dueDate,
      team: taskForm.team.filter(Boolean),
      document: docId,
    };
    const ok = await createTask(payload);
    if (!ok) return;

    setShowTaskModal(false);
    setTaskForm((prev) => ({
      ...prev,
      title: "",
      description: "",
      startDate: getTodayDateInput(),
      dueDate: getTodayDateInput(),
      team: [],
      document: "",
      documentFile: null,
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

  const mapColumnToStatus = (column: "completed" | "inProgress" | "due") => {
    if (column === "completed") return "Completed";
    if (column === "inProgress") return "In progress";
    return "Pending";
  };

  const handleDropTask = async (column: "completed" | "inProgress" | "due") => {
    if (!draggedTask) return;
    const nextStatus = mapColumnToStatus(column);
    if (normalizeStatus(draggedTask?.status) === normalizeStatus(nextStatus)) {
      setDraggedTask(null);
      return;
    }

    const ok = await updateTask({
      _id: draggedTask?._id || draggedTask?.id,
      status: nextStatus,
      dueDate: draggedTask?.dueDate,
      title: draggedTask?.title,
      description: draggedTask?.description,
      projectId: selectedProject?._id || selectedProject?.id,
    });
    if (ok) {
      showToast("success", `Task moved to ${nextStatus}.`);
    }
    setDragOverColumn(null);
    setDraggedTask(null);
  };

  const handleDeleteTask = async (task: any) => {
    const taskId = task?._id || task?.id;
    if (!taskId) return;
    const confirmed = window.confirm("Delete this task?");
    if (!confirmed) return;
    const ok = await deleteTask(taskId);
    if (ok) showToast("success", "Task deleted successfully.");
  };

  const handleManualStatusChange = async (task: any, status: "Pending" | "In progress" | "Completed") => {
    const ok = await updateTask({
      _id: task?._id || task?.id,
      status,
      dueDate: task?.dueDate,
      title: task?.title,
      description: task?.description,
      projectId: selectedProject?._id || selectedProject?.id,
    });
    if (ok) {
      showToast("success", `Task moved to ${status}.`);
      setActiveTaskMenuId(null);
    }
  };

  const openEditTask = (task: any) => {
    setEditingTask(task);
    setEditTaskForm({
      _id: task?._id || task?.id || "",
      title: task?.title || "",
      description: task?.description || "",
      dueDate: task?.dueDate ? String(task.dueDate).slice(0, 10) : getTodayDateInput(),
      status:
        normalizeStatus(task?.status) === "completed"
          ? "Completed"
          : normalizeStatus(task?.status).includes("progress")
          ? "In progress"
          : "Pending",
    });
    setShowEditTaskModal(true);
    setActiveTaskMenuId(null);
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTaskForm._id) return;
    const ok = await updateTask({
      _id: editTaskForm._id,
      status: editTaskForm.status,
      dueDate: editTaskForm.dueDate,
      title: editTaskForm.title,
      description: editTaskForm.description,
      projectId: selectedProject?._id || selectedProject?.id,
    });
    if (ok) {
      showToast("success", "Task updated successfully.");
      setShowEditTaskModal(false);
      setEditingTask(null);
    }
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
            <BoardColumn
              columnKey="completed"
              title="Completed"
              tone="green"
              icon={<CheckCircle2 size={14} />}
              tasks={boardData.completed}
              onDropTask={handleDropTask}
              onDragTask={setDraggedTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={openEditTask}
              onManualStatusChange={handleManualStatusChange}
              activeTaskMenuId={activeTaskMenuId}
              setActiveTaskMenuId={setActiveTaskMenuId}
              dragOverColumn={dragOverColumn}
              setDragOverColumn={setDragOverColumn}
              isAdmin={isAdmin}
            />
            <BoardColumn
              columnKey="inProgress"
              title="In progress"
              tone="orange"
              icon={<CircleDot size={14} />}
              tasks={boardData.inProgress}
              onDropTask={handleDropTask}
              onDragTask={setDraggedTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={openEditTask}
              onManualStatusChange={handleManualStatusChange}
              activeTaskMenuId={activeTaskMenuId}
              setActiveTaskMenuId={setActiveTaskMenuId}
              dragOverColumn={dragOverColumn}
              setDragOverColumn={setDragOverColumn}
              isAdmin={isAdmin}
            />
            <BoardColumn
              columnKey="due"
              title="Due task"
              tone="red"
              icon={<AlertTriangle size={14} />}
              tasks={boardData.due}
              onDropTask={handleDropTask}
              onDragTask={setDraggedTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={openEditTask}
              onManualStatusChange={handleManualStatusChange}
              activeTaskMenuId={activeTaskMenuId}
              setActiveTaskMenuId={setActiveTaskMenuId}
              dragOverColumn={dragOverColumn}
              setDragOverColumn={setDragOverColumn}
              isAdmin={isAdmin}
            />
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
            <UploadField
              label="Project Document (optional)"
              fileName={projectForm.documentFile?.name || projectForm.document}
              onSelect={(file) =>
                setProjectForm((p) => ({
                  ...p,
                  documentFile: file,
                  document: file?.name || "",
                }))
              }
            />
            {isAdmin && (
              <TeamCheckboxList
                employees={employees}
                selected={projectForm.team}
                onToggle={(value) =>
                  setProjectForm((p) => ({
                    ...p,
                    team: p.team.includes(value)
                      ? p.team.filter((id) => id !== value)
                      : [...p.team, value],
                  }))
                }
              />
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
            <UploadField
              label="Task Document (optional)"
              fileName={taskForm.documentFile?.name || taskForm.document}
              onSelect={(file) =>
                setTaskForm((p) => ({
                  ...p,
                  documentFile: file,
                  document: file?.name || "",
                }))
              }
            />
            {isAdmin && (
              <TeamCheckboxList
                employees={employees}
                selected={taskForm.team}
                onToggle={(value) =>
                  setTaskForm((p) => ({
                    ...p,
                    team: p.team.includes(value)
                      ? p.team.filter((id) => id !== value)
                      : [...p.team, value],
                  }))
                }
              />
            )}
            <SubmitActions onCancel={() => setShowTaskModal(false)} />
          </form>
        </ModalShell>
      )}

      {showEditTaskModal && editingTask && (
        <ModalShell title="Edit Task" onClose={() => setShowEditTaskModal(false)}>
          <form className="space-y-3" onSubmit={handleEditTask}>
            <TextInput
              value={editTaskForm.title}
              onChange={(v) => setEditTaskForm((p) => ({ ...p, title: v }))}
              placeholder="Task title"
              required
            />
            <textarea
              value={editTaskForm.description}
              onChange={(e) => setEditTaskForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Task description"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm min-h-24"
              required
            />
            <DateInput
              value={editTaskForm.dueDate}
              onChange={(v) => setEditTaskForm((p) => ({ ...p, dueDate: v }))}
              required
            />
            <select
              value={editTaskForm.status}
              onChange={(e) => setEditTaskForm((p) => ({ ...p, status: e.target.value as "Pending" | "In progress" | "Completed" }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
            >
              <option value="Pending">Pending</option>
              <option value="In progress">In progress</option>
              <option value="Completed">Completed</option>
            </select>
            <SubmitActions onCancel={() => setShowEditTaskModal(false)} />
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
  columnKey,
  title,
  tone,
  icon,
  tasks,
  onDropTask,
  onDragTask,
  onDeleteTask,
  onEditTask,
  onManualStatusChange,
  activeTaskMenuId,
  setActiveTaskMenuId,
  dragOverColumn,
  setDragOverColumn,
  isAdmin,
}: {
  columnKey: "completed" | "inProgress" | "due";
  title: string;
  tone: "green" | "orange" | "red";
  icon: React.ReactNode;
  tasks: any[];
  onDropTask: (column: "completed" | "inProgress" | "due") => void;
  onDragTask: (task: any | null) => void;
  onDeleteTask: (task: any) => void;
  onEditTask: (task: any) => void;
  onManualStatusChange: (task: any, status: "Pending" | "In progress" | "Completed") => void;
  activeTaskMenuId: string | null;
  setActiveTaskMenuId: (taskId: string | null) => void;
  dragOverColumn: "completed" | "inProgress" | "due" | null;
  setDragOverColumn: (column: "completed" | "inProgress" | "due" | null) => void;
  isAdmin: boolean;
}) => {
  const headerTone = {
    green: "bg-[#65C237] text-white",
    orange: "bg-[#FF6D1B] text-white",
    red: "bg-[#D90429] text-white",
  };

  return (
    <div
      className={`bg-white border rounded-2xl overflow-hidden transition-all ${
        dragOverColumn === columnKey
          ? "border-[#3B00D9] ring-2 ring-[#3B00D9]/20 shadow-md"
          : "border-gray-100"
      }`}
    >
      <div className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 ${headerTone[tone]}`}>
        {icon} {title} <span className="ml-auto text-xs opacity-90">{tasks.length}</span>
      </div>
      <div
        className="p-3 space-y-3 min-h-[420px] max-h-[68vh] overflow-y-auto"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOverColumn(columnKey);
        }}
        onDragLeave={() => setDragOverColumn(null)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOverColumn(null);
          onDropTask(columnKey);
        }}
      >
        {tasks.map((task: any, idx: number) => (
          <TaskCard
            key={task._id || task.id || idx}
            task={task}
            onDragStart={() => onDragTask(task)}
            onDragEnd={() => onDragTask(null)}
            onDelete={() => onDeleteTask(task)}
            onEdit={() => onEditTask(task)}
            onManualStatusChange={(status) => onManualStatusChange(task, status)}
            isMenuOpen={activeTaskMenuId === (task?._id || task?.id)}
            onToggleMenu={() =>
              setActiveTaskMenuId(
                activeTaskMenuId === (task?._id || task?.id)
                  ? null
                  : (task?._id || task?.id),
              )
            }
            isAdmin={isAdmin}
          />
        ))}
        {tasks.length === 0 && <div className="text-xs text-gray-500 text-center py-8">No tasks here</div>}
      </div>
    </div>
  );
};

const TaskCard = ({
  task,
  onDragStart,
  onDragEnd,
  onDelete,
  onEdit,
  onManualStatusChange,
  isMenuOpen,
  onToggleMenu,
  isAdmin,
}: {
  task: any;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onManualStatusChange: (status: "Pending" | "In progress" | "Completed") => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  isAdmin: boolean;
}) => {
  const teamCount = Array.isArray(task?.team) ? task.team.length : 0;
  return (
    <div
      className="border border-gray-100 rounded-xl p-3 cursor-grab active:cursor-grabbing"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">{task?.title || "Untitled task"}</h4>
      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task?.description || "No description provided."}</p>
      <div className="mt-3 h-1.5 rounded-full bg-gray-100">
        <div className="h-full w-[70%] bg-[#3B00D9] rounded-full" />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span className="inline-flex items-center gap-1">
          <Calendar size={12} /> Due: {formatDate(getTaskDate(task))}
        </span>
        <div className="flex items-center gap-2 relative">
          <span>{teamCount} assignee{teamCount === 1 ? "" : "s"}</span>
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={onToggleMenu}
                className="p-1 rounded hover:bg-gray-100 text-gray-500"
              >
                <MoreVertical size={14} />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 top-6 z-20 w-40 rounded-lg border border-gray-100 bg-white shadow-lg py-1">
                  <button type="button" onClick={onEdit} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50">
                    Edit task
                  </button>
                  <button type="button" onClick={() => onManualStatusChange("Pending")} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50">
                    Move to Pending
                  </button>
                  <button type="button" onClick={() => onManualStatusChange("In progress")} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50">
                    Move to In progress
                  </button>
                  <button type="button" onClick={() => onManualStatusChange("Completed")} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50">
                    Move to Completed
                  </button>
                  <button type="button" onClick={onDelete} className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50">
                    Delete task
                  </button>
                </div>
              )}
            </>
          )}
        </div>
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

const UploadField = ({
  label,
  fileName,
  onSelect,
}: {
  label: string;
  fileName?: string;
  onSelect: (file: File | null) => void;
}) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
    <label className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-[#3B00D9]/40 text-[#3B00D9] text-sm font-medium cursor-pointer hover:bg-[#3B00D9]/5">
      Upload document
      <input
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
        onChange={(e) => onSelect(e.target.files?.[0] || null)}
      />
    </label>
    {fileName && <p className="mt-2 text-xs text-gray-500 truncate">Selected: {fileName}</p>}
  </div>
);

const TeamCheckboxList = ({
  employees,
  selected,
  onToggle,
}: {
  employees: any[];
  selected: string[];
  onToggle: (value: string) => void;
}) => (
  <div className="rounded-xl border border-gray-200 p-3 max-h-44 overflow-y-auto">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Select Team Members</p>
    <div className="space-y-2">
      {employees.map((emp: any, idx: number) => {
        const id = emp._id || emp.id || String(idx);
        const checked = selected.includes(id);
        return (
          <label key={id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(id)}
              className="accent-[#3B00D9]"
            />
            <span className="truncate">{emp.name || emp.email}</span>
          </label>
        );
      })}
    </div>
  </div>
);

export default TaskManager;

