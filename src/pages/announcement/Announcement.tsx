import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Edit3,
  Eye,
  Loader2,
  Megaphone,
  Paperclip,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import {
  useAnnouncementStore,
  type AnnouncementItem,
} from "../../store/useAnnouncementStore";
import { useAuthStore } from "../../store/useAuthStore";

const emptyForm = {
  title: "",
  body: "",
  receivers: "all",
};

const getAnnouncementId = (announcement: AnnouncementItem) =>
  announcement?._id || announcement?.id || "";

const getAnnouncementBody = (announcement: AnnouncementItem | null) =>
  announcement?.body || announcement?.message || "";

const getAnnouncementDate = (announcement: AnnouncementItem) =>
  announcement?.createdAt || announcement?.date || announcement?.updatedAt || "";

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

const isUnread = (announcement: AnnouncementItem) =>
  announcement.read === false ||
  announcement.isRead === false ||
  (!announcement.read && !announcement.isRead && !announcement.readAt);



const Announcement = () => {
  const { isAdmin } = useAuthStore();
  const {
    announcements,
    selectedAnnouncement,
    isLoading,
    error,
    fetchAnnouncements,
    fetchUserAnnouncements,
    fetchAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    clearSelectedAnnouncement,
  } = useAnnouncementStore();

  const [formData, setFormData] = useState(emptyForm);
  const [mode, setMode] = useState<"compose" | "view">("compose");
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<AnnouncementItem | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeletedNotice, setShowDeletedNotice] = useState(false);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const selectedId = selectedAnnouncement
    ? getAnnouncementId(selectedAnnouncement)
    : "";

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAnnouncements();
    } else {
      fetchUserAnnouncements();
    }
  }, [isAdmin, fetchAnnouncements, fetchUserAnnouncements]);

  useEffect(() => {
    if (error) showToast("error", error);
  }, [error]);

  const recentAnnouncements = useMemo(
    () =>
      [...announcements].sort((a, b) => {
        const left = new Date(getAnnouncementDate(a) || 0).getTime();
        const right = new Date(getAnnouncementDate(b) || 0).getTime();
        return right - left;
      }),
    [announcements],
  );

  const resetComposer = () => {
    clearSelectedAnnouncement();
    setEditingAnnouncement(null);
    setFormData(emptyForm);

    setMode("compose");
  };

  const openCreateModal = () => {
    resetComposer();
    setShowSendModal(true);
  };

  const openDetails = async (announcement: AnnouncementItem) => {
    const announcementId = getAnnouncementId(announcement);
    if (!announcementId) return;

    const detail = await fetchAnnouncementById(announcementId, {
      userScope: !isAdmin,
    });

    if (detail) {
      setEditingAnnouncement(null);
      setMode("view");
    }
  };

  const startEdit = () => {
    if (!selectedAnnouncement) return;
    setEditingAnnouncement(selectedAnnouncement);
    setFormData({
      title: selectedAnnouncement.title || "",
      body: getAnnouncementBody(selectedAnnouncement),
      receivers: selectedAnnouncement.receivers || "all",
    });
    setMode("compose");
    setShowSendModal(true);
  };

  const canSubmit =
    formData.title.trim().length > 0 &&
    formData.body.trim().length > 0;

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.body.trim()) {
      showToast("error", "Title and announcement body are required.");
      return;
    }



    const announcementId = editingAnnouncement
      ? getAnnouncementId(editingAnnouncement)
      : "";
    const ok = editingAnnouncement
      ? await updateAnnouncement(announcementId, {
          title: formData.title,
          body: formData.body,
        })
      : await createAnnouncement(formData);

    if (!ok) return;

    setShowSendModal(false);
    resetComposer();
    showToast(
      "success",
      editingAnnouncement
        ? "Announcement updated successfully."
        : "Announcement sent successfully.",
    );

    if (isAdmin) fetchAnnouncements();
  };

  const handleDelete = async () => {
    if (!selectedAnnouncement) return;
    const announcementId = getAnnouncementId(selectedAnnouncement);
    if (!announcementId) return;

    const ok = await deleteAnnouncement(announcementId);
    if (!ok) return;

    setShowDeleteModal(false);
    setShowDeletedNotice(true);
    setTimeout(() => {
      setShowDeletedNotice(false);
      resetComposer();
    }, 1800);
  };

  const canvasTitle =
    mode === "view" && selectedAnnouncement
      ? selectedAnnouncement.title
      : editingAnnouncement
        ? "Edit announcement"
        : "Add New announcement";

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 pb-12">
      {toast && (
        <div
          className={`fixed left-3 right-3 top-4 z-100 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg sm:left-auto sm:right-6 sm:top-6 ${
            toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Announcements
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Company-wide and targeted communications
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-violet-50 px-4 py-2.5 text-sm font-semibold text-[#3B00D9] transition hover:bg-violet-100 sm:w-auto"
          >
            <Plus size={16} />
            New announcement
          </button>
        )}
      </header>

      <main className="grid min-h-[72dvh] grid-cols-1 gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-sm bg-white p-5 shadow-xs ring-1 ring-gray-100 lg:min-h-[72dvh]">
          {recentAnnouncements.length > 0 ? (
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Recent
              </p>
              <div className="space-y-3">
                {recentAnnouncements.map((announcement) => {
                  const announcementId = getAnnouncementId(announcement);
                  const active = announcementId === selectedId;
                  const unread = !isAdmin && isUnread(announcement);

                  return (
                    <button
                      key={announcementId}
                      type="button"
                      onClick={() => openDetails(announcement)}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        active
                          ? "border-[#3B00D9]/20 bg-violet-50"
                          : "border-gray-100 bg-white hover:border-violet-100 hover:bg-gray-50"
                      }`}
                    >
                      <p className="line-clamp-1 text-sm font-semibold text-gray-900">
                        {announcement.title || "Untitled announcement"}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(getAnnouncementDate(announcement))}
                        </span>
                        {unread && (
                          <span className="rounded-full bg-[#3B00D9] px-2 py-0.5 text-white">
                            New
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
              <EmptyIllustration />
              <p className="mt-4 max-w-[180px] text-xs text-gray-500">
                Your announcement will appear here
              </p>
              {isAdmin && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-50 px-4 py-2 text-xs font-semibold text-[#3B00D9] hover:bg-violet-100"
                >
                  <Plus size={14} />
                  New announcement
                </button>
              )}
            </div>
          )}
        </aside>

        <section className="relative rounded-sm bg-white p-5 shadow-xs ring-1 ring-gray-100 sm:p-8 lg:min-h-[72dvh]">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
              <Loader2 className="animate-spin text-[#3B00D9]" size={30} />
            </div>
          )}

          <div className="flex min-h-[64dvh] flex-col">
            <div className="border-b border-gray-100 pb-4">
              {mode === "view" || !isAdmin ? (
                <h3 className="text-lg font-semibold text-gray-900">
                  {canvasTitle || "Announcement"}
                </h3>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Announcement workspace
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create a focused company update.
                  </p>
                </div>
              )}

              {mode === "view" && selectedAnnouncement && (
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={13} />
                    {formatDate(getAnnouncementDate(selectedAnnouncement))}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Megaphone size={13} />
                    {selectedAnnouncement.receivers || "all staff"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Eye size={13} />
                    {selectedAnnouncement.readAt ? "Read" : "18 views"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 py-6">
              {mode === "compose" && isAdmin ? (
                <div className="flex min-h-[360px] items-center justify-center">
                  <div className="max-w-md rounded-3xl border border-dashed border-violet-200 bg-violet-50/40 p-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#3B00D9] shadow-sm">
                      <Megaphone size={24} />
                    </div>
                    <h4 className="mt-5 text-base font-semibold text-gray-900">
                      Ready to publish an update?
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      Use the announcement composer to add a title, message,
                      and recipients in one place.
                    </p>
                    <button
                      type="button"
                      onClick={openCreateModal}
                      className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#3B00D9] px-5 py-3 text-sm font-semibold text-white hover:bg-[#3500c0]"
                    >
                      <Plus size={16} />
                      Compose announcement
                    </button>
                  </div>
                </div>
              ) : selectedAnnouncement ? (
                <div className="space-y-6">
                  <p className="whitespace-pre-wrap text-sm leading-8 text-gray-700">
                    {getAnnouncementBody(selectedAnnouncement) ||
                      "No announcement content available."}
                  </p>


                </div>
              ) : (
                <div className="flex h-full min-h-[340px] items-center justify-center text-center text-sm text-gray-400">
                  {isAdmin
                    ? "Choose an announcement or compose a new update."
                    : "Select an announcement to read."}
                </div>
              )}
            </div>

            <div className="mt-auto flex flex-col gap-3 border-t border-transparent pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                {mode === "view" && selectedAnnouncement && isAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-600"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={startEdit}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
                    >
                      <Edit3 size={15} />
                      Edit
                    </button>
                  </>
                )}
              </div>

              {isAdmin && mode === "compose" && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Send size={16} />
                  Compose
                </button>
              )}

              {isAdmin && mode === "view" && selectedAnnouncement && (
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3B00D9] px-6 py-3 text-sm font-semibold text-white"
                >
                  <Paperclip size={16} />
                  Pin
                </button>
              )}
            </div>
          </div>
        </section>
      </main>

      {showSendModal && (
        <SendAnnouncementModal
          formData={formData}
          setFormData={setFormData}

          isLoading={isLoading}
          isEditing={Boolean(editingAnnouncement)}
          canSubmit={Boolean(canSubmit)}
          onClose={() => {
            setShowSendModal(false);
            if (editingAnnouncement && selectedAnnouncement) {
              setEditingAnnouncement(null);
              setMode("view");
              return;
            }
            resetComposer();
          }}
          onSubmit={handleSubmit}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          title={selectedAnnouncement?.title || "this announcement"}
          onCancel={() => setShowDeleteModal(false)}
          onDelete={handleDelete}
        />
      )}

      {showDeletedNotice && (
        <DeletedNoticeModal
          title={selectedAnnouncement?.title || "Announcement"}
        />
      )}
    </div>
  );
};

const EmptyIllustration = () => (
  <div className="relative h-28 w-36">
    <div className="absolute bottom-1 left-8 h-16 w-16 rounded-lg border border-gray-200 bg-gray-50" />
    <div className="absolute bottom-4 left-16 h-10 w-16 rounded-xl bg-gray-200" />
    <div className="absolute bottom-8 left-20 h-8 w-10 rounded-full bg-gray-100" />
    <div className="absolute left-6 top-8 h-8 w-8 rounded-full bg-gray-100" />
    <div className="absolute left-16 top-5 h-9 w-9 rounded-full bg-slate-700" />
    <div className="absolute right-7 top-4 h-9 w-9 rounded-full bg-slate-200" />
    <div className="absolute right-2 top-16 h-3 w-3 rounded-full bg-red-400" />
    <div className="absolute bottom-2 left-4 h-12 w-1 rounded-full bg-gray-200" />
    <div className="absolute bottom-3 right-8 h-16 w-1 rounded-full bg-gray-200" />
  </div>
);

const SendAnnouncementModal = ({
  formData,
  setFormData,

  isLoading,
  isEditing,
  canSubmit,
  onClose,
  onSubmit,
}: {
  formData: typeof emptyForm;
  setFormData: React.Dispatch<React.SetStateAction<typeof emptyForm>>;

  isLoading: boolean;
  isEditing: boolean;
  canSubmit: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) => {


  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-white/65 p-0 backdrop-blur-md sm:items-center sm:p-4">
      <div className="mobile-safe-bottom w-full max-w-2xl rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Send announcement
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-violet-50 px-2 py-1 text-xs font-semibold text-[#3B00D9]"
          >
            Close <X size={12} className="inline" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-600">
              Title
            </label>
            <input
              value={formData.title}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  title: event.target.value,
                }))
              }
              placeholder="Marketing 360 Testing"
              className="w-full rounded-xl border border-gray-200 px-4 py-4 text-sm outline-none focus:border-[#3B00D9] focus:ring-2 focus:ring-[#3B00D9]/15"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-600">
              Announcement message
            </label>
            <textarea
              value={formData.body}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  body: event.target.value,
                }))
              }
              placeholder="Write the full announcement..."
              rows={5}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-4 text-sm leading-7 outline-none focus:border-[#3B00D9] focus:ring-2 focus:ring-[#3B00D9]/15"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-600">
              Send to
            </label>
            <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
              <span className="inline-flex items-center gap-3 rounded-full bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3B00D9] text-white">
                  A
                </span>
                All employees
                <X size={13} />
              </span>
              <span className="text-gray-400">v</span>
            </div>
          </div>



          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit || isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3B00D9] px-5 py-4 text-base font-bold text-white transition hover:bg-[#3500c0] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isLoading && <Loader2 className="animate-spin" size={18} />}
            {isEditing ? "Update announcement" : "Create announcement"}
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({
  title,
  onCancel,
  onDelete,
}: {
  title: string;
  onCancel: () => void;
  onDelete: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/65 p-4 backdrop-blur-md">
    <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
      <h3 className="text-xl font-semibold text-gray-900">
        You are about to delete {title}
      </h3>
      <p className="mt-2 text-sm text-gray-500">
        Are you sure you want to delete this?
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl bg-gray-200 px-5 py-4 text-sm font-bold text-white"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-xl bg-rose-50 px-5 py-4 text-sm font-bold text-rose-600"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

const DeletedNoticeModal = ({ title }: { title: string }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/65 p-4 backdrop-blur-md">
    <div className="flex h-80 w-full max-w-md flex-col items-center justify-center rounded-3xl bg-white p-8 text-center shadow-2xl">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border-8 border-red-600 text-red-600">
        <span className="text-6xl font-bold leading-none">!</span>
      </div>
      <p className="max-w-xs text-lg font-medium text-gray-800">
        {title} has been deleted
      </p>
    </div>
  </div>
);

export default Announcement;
