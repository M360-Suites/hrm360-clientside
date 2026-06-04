import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Loader2,
  Calendar,
  CheckCircle2,
  CircleDot,
  Clock3,
  MessageSquare,
  Pencil,
  Send,
  Trash2,
  Users,
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
const getAssignees = (item: any) => {
  const people = item?.assignedTo || item?.team || item?.members || [];
  return Array.isArray(people) ? people : [];
};
const getPersonLabel = (person: any) =>
  typeof person === "string" ? person : person?.name || person?.email || "Team member";
const getComments = (task: any) => (Array.isArray(task?.comments) ? task.comments : []);

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
    deleteProject,
    createTask,
    updateTask,
    commentTask,
    deleteTask,
    fetchProjectTasks,
    setSelectedProject,
  } = useTaskStore();

  const [search, setSearch] = useState("");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState<any | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<"completed" | "inProgress" | "pending" | null>(null);
  const [activeTaskMenuId, setActiveTaskMenuId] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
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
    const pending = tasks.filter((task: any) => {
      const status = normalizeStatus(task.status);
      return status === "due" || status === "pending" || status === "todo";
    });
    return { completed, inProgress, pending };
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

  const handleDeleteProject = async (project: any) => {
    const projectId = project?._id || project?.id;
    if (!projectId) return;
    const confirmed = window.confirm("Delete this project and its task board?");
    if (!confirmed) return;
    const ok = await deleteProject(projectId);
    if (ok) showToast("success", "Project deleted successfully.");
  };

  const mapColumnToStatus = (column: "completed" | "inProgress" | "pending") => {
    if (column === "completed") return "Completed";
    if (column === "inProgress") return "In progress";
    return "Pending";
  };

  const handleDropTask = async (column: "completed" | "inProgress" | "pending") => {
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

  const handleAddComment = async (task: any) => {
    const taskId = task?._id || task?.id;
    const comment = commentDrafts[taskId]?.trim();
    if (!taskId || !comment) return;

    const ok = await commentTask({
      taskId,
      comment,
      projectId: selectedProject?._id || selectedProject?.id,
    });
    if (ok) {
      setCommentDrafts((prev) => ({ ...prev, [taskId]: "" }));
      setExpandedTaskId(taskId);
      showToast("success", "Comment added.");
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-5">
      {toast && (
        <div
          className={`fixed left-3 right-3 top-4 z-100 px-4 py-3 rounded-xl text-sm font-semibold text-white shadow-lg sm:left-auto sm:right-6 sm:top-6 ${
            toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Task Manager</h2>
          <p className="text-sm text-gray-500">Projects, owners, dates, and task status in one place</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowTaskModal(true)}
            className="inline-flex w-full items-center justify-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 sm:w-auto"
          >
            <Plus size={16} /> Create Task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-4">
        <div className="bg-white border border-gray-100 rounded-lg p-4 space-y-3 h-fit min-w-0">
          <h3 className="font-semibold text-gray-800">Projects</h3>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
            {projects.map((project: any, idx: number) => {
              const projectId = project?._id || project?.id || String(idx);
              const isActive = (selectedProject?._id || selectedProject?.id) === projectId;
              const projectAssignees = getAssignees(project);
              return (
                <div
                  key={projectId}
                  className={`min-w-[220px] rounded-lg border text-sm flex items-center lg:min-w-0 lg:w-full ${
                    isActive
                      ? "bg-[#3B00D9] text-white border-[#3B00D9]"
                      : "bg-white border-gray-200 text-gray-700 hover:border-[#3B00D9]/40"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSwitchProject(project)}
                    className="min-w-0 flex-1 text-left px-3 py-2.5"
                  >
                    <span className="block truncate">{project?.title || project?.name || "Untitled Project"}</span>
                    <span className={`mt-1 flex items-center gap-1 text-[11px] ${isActive ? "text-white/70" : "text-gray-400"}`}>
                      <Users size={11} />
                      {projectAssignees.length} member{projectAssignees.length === 1 ? "" : "s"}
                    </span>
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(project)}
                      className={`mr-2 rounded p-1 ${
                        isActive ? "text-white/80 hover:bg-white/10" : "text-rose-500 hover:bg-rose-50"
                      }`}
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowProjectModal(true)}
            className="w-full shrink-0 border border-dashed border-[#3B00D9]/40 text-[#3B00D9] rounded-lg py-2.5 text-sm font-medium hover:bg-[#3B00D9]/5 lg:w-full"
            >
              + Add new project
            </button>
          )}
        </div>

        <div className="min-w-0 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="min-w-0 text-lg font-semibold text-gray-900 truncate">
              {selectedProject?.title || selectedProject?.name || "Select a project"}
            </h3>
            <div className="relative w-full sm:w-70">
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
              columnKey="pending"
              title="Pending"
              tone="slate"
              icon={<Clock3 size={14} />}
              tasks={boardData.pending}
              onDropTask={handleDropTask}
              onDragTask={setDraggedTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={openEditTask}
              onAddComment={handleAddComment}
              onManualStatusChange={handleManualStatusChange}
              activeTaskMenuId={activeTaskMenuId}
              setActiveTaskMenuId={setActiveTaskMenuId}
              expandedTaskId={expandedTaskId}
              setExpandedTaskId={setExpandedTaskId}
              commentDrafts={commentDrafts}
              setCommentDrafts={setCommentDrafts}
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
              onAddComment={handleAddComment}
              onManualStatusChange={handleManualStatusChange}
              activeTaskMenuId={activeTaskMenuId}
              setActiveTaskMenuId={setActiveTaskMenuId}
              expandedTaskId={expandedTaskId}
              setExpandedTaskId={setExpandedTaskId}
              commentDrafts={commentDrafts}
              setCommentDrafts={setCommentDrafts}
              dragOverColumn={dragOverColumn}
              setDragOverColumn={setDragOverColumn}
              isAdmin={isAdmin}
            />
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
              onAddComment={handleAddComment}
              onManualStatusChange={handleManualStatusChange}
              activeTaskMenuId={activeTaskMenuId}
              setActiveTaskMenuId={setActiveTaskMenuId}
              expandedTaskId={expandedTaskId}
              setExpandedTaskId={setExpandedTaskId}
              commentDrafts={commentDrafts}
              setCommentDrafts={setCommentDrafts}
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
  onAddComment,
  onManualStatusChange,
  activeTaskMenuId,
  setActiveTaskMenuId,
  expandedTaskId,
  setExpandedTaskId,
  commentDrafts,
  setCommentDrafts,
  dragOverColumn,
  setDragOverColumn,
  isAdmin,
}: {
  columnKey: "completed" | "inProgress" | "pending";
  title: string;
  tone: "green" | "orange" | "slate";
  icon: React.ReactNode;
  tasks: any[];
  onDropTask: (column: "completed" | "inProgress" | "pending") => void;
  onDragTask: (task: any | null) => void;
  onDeleteTask: (task: any) => void;
  onEditTask: (task: any) => void;
  onAddComment: (task: any) => void;
  onManualStatusChange: (task: any, status: "Pending" | "In progress" | "Completed") => void;
  activeTaskMenuId: string | null;
  setActiveTaskMenuId: (taskId: string | null) => void;
  expandedTaskId: string | null;
  setExpandedTaskId: (taskId: string | null) => void;
  commentDrafts: Record<string, string>;
  setCommentDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  dragOverColumn: "completed" | "inProgress" | "pending" | null;
  setDragOverColumn: (column: "completed" | "inProgress" | "pending" | null) => void;
  isAdmin: boolean;
}) => {
  const headerTone = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    orange: "bg-amber-50 text-amber-700 border-amber-100",
    slate: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return (
    <div
      className={`bg-white border rounded-lg overflow-hidden transition-all ${
        dragOverColumn === columnKey
          ? "border-[#3B00D9] ring-2 ring-[#3B00D9]/20 shadow-md"
          : "border-gray-100"
      }`}
    >
      <div className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 border-b ${headerTone[tone]}`}>
        {icon} {title} <span className="ml-auto text-xs opacity-90">{tasks.length}</span>
      </div>
      <div className="hidden md:grid grid-cols-[minmax(0,1fr)_96px_76px_82px_32px] gap-3 border-b border-gray-100 bg-gray-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        <span>Task</span>
        <span>Due Date</span>
        <span>Team</span>
        <span>Comments</span>
        <span />
      </div>
      <div
        className="min-h-[280px] max-h-none overflow-y-auto xl:max-h-[68vh]"
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
            onAddComment={() => onAddComment(task)}
            onManualStatusChange={(status) => onManualStatusChange(task, status)}
            isExpanded={expandedTaskId === (task?._id || task?.id)}
            onToggleExpanded={() => {
              const taskId = task?._id || task?.id;
              setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
            }}
            commentDraft={commentDrafts[task?._id || task?.id] || ""}
            onCommentDraftChange={(value) =>
              setCommentDrafts((prev) => ({
                ...prev,
                [task?._id || task?.id]: value,
              }))
            }
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
        {tasks.length === 0 && <div className="text-xs text-gray-500 text-center py-10">No tasks here</div>}
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
  onAddComment,
  onManualStatusChange,
  isExpanded,
  onToggleExpanded,
  commentDraft,
  onCommentDraftChange,
  isMenuOpen,
  onToggleMenu,
  isAdmin,
}: {
  task: any;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onAddComment: () => void;
  onManualStatusChange: (status: "Pending" | "In progress" | "Completed") => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  commentDraft: string;
  onCommentDraftChange: (value: string) => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  isAdmin: boolean;
}) => {
  const assignees = getAssignees(task);
  const comments = getComments(task);
  return (
    <div className="border-b border-gray-100 bg-white transition hover:bg-gray-50">
      <div
        className="group grid gap-2 px-3 py-3 text-sm md:grid-cols-[minmax(0,1fr)_96px_76px_82px_32px] md:items-center cursor-grab active:cursor-grabbing"
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <button type="button" onClick={onToggleExpanded} className="min-w-0 text-left">
          <h4 className="truncate text-sm font-semibold text-gray-800">{task?.title || "Untitled task"}</h4>
          <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{task?.description || "No description provided."}</p>
        </button>

        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
          <Calendar size={12} /> {formatDate(getTaskDate(task))}
        </span>

        <span className="text-xs text-gray-500">
          {assignees.length} member{assignees.length === 1 ? "" : "s"}
        </span>

        <button type="button" onClick={onToggleExpanded} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#3B00D9]">
          <MessageSquare size={12} /> {comments.length}
        </button>

        <div className="relative flex justify-end">
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={onToggleMenu}
                className="rounded p-1 text-gray-500 hover:bg-white hover:text-gray-800"
                title="Task options"
              >
                <MoreVertical size={15} />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 top-7 z-20 w-44 rounded-lg border border-gray-100 bg-white shadow-lg py-1">
                  <button type="button" onClick={onEdit} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-gray-50">
                    <Pencil size={13} /> Edit task
                  </button>
                  <button type="button" onClick={() => onManualStatusChange("Pending")} className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50">
                    Move to Pending
                  </button>
                  <button type="button" onClick={() => onManualStatusChange("In progress")} className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50">
                    Move to In progress
                  </button>
                  <button type="button" onClick={() => onManualStatusChange("Completed")} className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50">
                    Move to Completed
                  </button>
                  <button type="button" onClick={onDelete} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50">
                    <Trash2 size={13} /> Delete task
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-3 py-3">
          <div className="mb-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Assigned to</p>
            <div className="flex flex-wrap gap-2">
              {assignees.length ? (
                assignees.map((person: any, index: number) => (
                  <span key={person?._id || person?.id || index} className="rounded-full bg-white px-2.5 py-1 text-xs text-gray-700 ring-1 ring-gray-200">
                    {getPersonLabel(person)}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">No assignees</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Comments</p>
            {comments.length ? (
              comments.map((comment: any, index: number) => (
                <div key={comment?._id || index} className="rounded-lg bg-white px-3 py-2 text-xs text-gray-700 ring-1 ring-gray-100">
                  <p>{typeof comment === "string" ? comment : comment?.comment || comment?.message || ""}</p>
                  {(comment?.createdBy?.name || comment?.user?.name) && (
                    <p className="mt-1 text-[11px] text-gray-400">{comment?.createdBy?.name || comment?.user?.name}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400">No comments yet</p>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={commentDraft}
              onChange={(e) => onCommentDraftChange(e.target.value)}
              placeholder="Add a comment..."
              className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#3B00D9]"
            />
            <button
              type="button"
              onClick={onAddComment}
              disabled={!commentDraft.trim()}
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#3B00D9] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              <Send size={12} /> Send
            </button>
          </div>
        </div>
      )}
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
  <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-end justify-center p-0 sm:items-center sm:p-4">
    <div className="mobile-safe-bottom max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl sm:p-6">
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
