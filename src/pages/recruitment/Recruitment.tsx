import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileText,
  Loader2,
  MapPin,
  Plus,
  Search,
  Send,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import {
  type Job,
  type JobApplicationPayload,
  type PostJobPayload,
  useRecruitmentStore,
} from "../../store/useRecruitmentStore";

const emptyJobForm: PostJobPayload = {
  title: "",
  description: "",
  location: "",
  type: "Full-time",
  salaryRange: "",
  closingDate: "",
  department: "",
  requirements: "",
  responsibilities: "",
};

const getLocalDate = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

const emptyApplicationForm = (): JobApplicationPayload => ({
  name: "",
  email: "",
  phone: "",
  yearsOfExperience: 0,
  date: getLocalDate(),
  resume: "",
});

const formatDate = (value?: string) => {
  if (!value) return "Not specified";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getDaysUntilClosing = (value?: string) => {
  if (!value) return null;
  const closingDate = new Date(value);
  if (Number.isNaN(closingDate.getTime())) return null;
  return Math.ceil((closingDate.getTime() - Date.now()) / 86_400_000);
};

const splitDetails = (value?: string) =>
  (value || "")
    .split(/\r?\n|â€¢|;/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);

const escapeHtml = (value?: string) =>
  (value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const jobFileName = (title: string) =>
  (title || "job-posting")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const listMarkup = (value?: string) => {
  const items = splitDetails(value);
  if (!items.length) return "<p>Not specified.</p>";
  return "<ul>" + items.map((item) => "<li>" + escapeHtml(item) + "</li>").join("") + "</ul>";
};

const downloadJobPosting = (job: Job) => {
  const documentHtml = [
    "<!doctype html><html><head><meta charset='utf-8'>",
    "<title>" + escapeHtml(job.title) + "</title>",
    "<style>",
    "body{font-family:Arial,sans-serif;color:#1f2937;line-height:1.6;margin:48px;}",
    "header{border-bottom:3px solid #4A1D96;padding-bottom:22px;margin-bottom:28px;}",
    "h1{color:#210078;font-size:30px;margin:0 0 8px;}h2{font-size:17px;color:#4A1D96;margin-top:28px;}",
    ".meta{color:#4b5563;font-size:14px}.badge{display:inline-block;background:#ede9fe;color:#4A1D96;padding:5px 10px;border-radius:999px;margin:0 6px 6px 0;}",
    "ul{padding-left:22px}li{margin-bottom:7px}.footer{margin-top:42px;padding-top:18px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px}",
    "</style></head><body><header><p style='color:#4A1D96;font-weight:700;margin:0 0 8px'>HRM360 JOB OPENING</p>",
    "<h1>" + escapeHtml(job.title) + "</h1>",
    "<div class='meta'><span class='badge'>" + escapeHtml(job.department) + "</span><span class='badge'>" + escapeHtml(job.type) + "</span><br>",
    escapeHtml(job.location) + " &nbsp;|&nbsp; " + escapeHtml(job.salaryRange) + " &nbsp;|&nbsp; Closes " + escapeHtml(formatDate(job.closingDate)) + "</div></header>",
    "<h2>About the role</h2><p>" + escapeHtml(job.description) + "</p>",
    "<h2>Key responsibilities</h2>" + listMarkup(job.responsibilities),
    "<h2>Requirements</h2>" + listMarkup(job.requirements),
    "<div class='footer'>Generated from HRM360 on " + escapeHtml(formatDate(new Date().toISOString())) + ".</div>",
    "</body></html>",
  ].join("");

  const blob = new Blob([documentHtml], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = jobFileName(job.title) + "-job-posting.doc";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-hidden transition focus:border-[#4A1D96] focus:ring-2 focus:ring-[#4A1D96]/10";

const Recruitment = () => {
  const { user, isAdmin } = useAuthStore();
  const {
    jobs,
    fetchJobs,
    postJob,
    applyForJob,
    isLoading,
    isSubmitting,
    error,
    clearError,
  } = useRecruitmentStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All departments");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [jobForm, setJobForm] = useState<PostJobPayload>(emptyJobForm);
  const [applicationForm, setApplicationForm] =
    useState<JobApplicationPayload>(emptyApplicationForm);
  const [toast, setToast] = useState<string | null>(null);

  const role = String(user?.role || "").trim().toLowerCase();
  const canManageJobs =
    isAdmin || ["admin", "hr", "hr_staff", "human resources"].includes(role);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const departments = useMemo(
    () => [
      "All departments",
      ...Array.from(new Set(jobs.map((job) => job.department).filter(Boolean))).sort(),
    ],
    [jobs],
  );

  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesDepartment =
        departmentFilter === "All departments" || job.department === departmentFilter;
      const matchesQuery =
        !query ||
        [job.title, job.department, job.location, job.type]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));
      return matchesDepartment && matchesQuery;
    });
  }, [departmentFilter, jobs, searchQuery]);

  const totalApplicants = jobs.reduce((total, job) => total + (job.applicants || 0), 0);
  const interviewing = jobs.reduce((total, job) => total + (job.interviewing || 0), 0);
  const closingSoon = jobs.filter((job) => {
    const days = getDaysUntilClosing(job.closingDate);
    return days !== null && days >= 0 && days <= 14;
  }).length;

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  };

  const handlePostJob = async (event: React.FormEvent) => {
    event.preventDefault();
    const success = await postJob(jobForm);
    if (!success) return;
    setShowPostModal(false);
    setJobForm(emptyJobForm);
    showToast("Job opening posted successfully.");
  };

  const handleApplication = async (event: React.FormEvent) => {
    event.preventDefault();
    const success = await applyForJob(applicationForm);
    if (!success) return;
    setShowApplyModal(false);
    setSelectedJob(null);
    setApplicationForm(emptyApplicationForm());
    showToast("Application submitted successfully.");
  };

  const openApplication = (job: Job) => {
    clearError();
    setSelectedJob(job);
    setApplicationForm(emptyApplicationForm());
    setShowApplyModal(true);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      {toast && (
        <div className="fixed right-4 top-20 z-70 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm font-medium text-emerald-700 shadow-xl">
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#4A1D96]">Talent acquisition</p>
          <h2 className="text-2xl font-semibold text-gray-900">Recruitment</h2>
          <p className="mt-1 text-sm text-gray-500">Publish openings, share job briefs, and receive applications.</p>
        </div>
        {canManageJobs && (
          <button
            onClick={() => { clearError(); setShowPostModal(true); }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4A1D96] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-[#8B5CF6] sm:w-auto"
          >
            <Plus size={17} /> Post a job
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span>{error}</span>
          <button onClick={clearError} aria-label="Dismiss error"><X size={17} /></button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<BriefcaseBusiness size={20} />} label="Open positions" value={jobs.length} tone="indigo" />
        <StatCard icon={<Users size={20} />} label="Applicants" value={totalApplicants} tone="blue" />
        <StatCard icon={<CalendarDays size={20} />} label="Closing soon" value={closingSoon} tone="amber" />
        <StatCard icon={<CheckCircle2 size={20} />} label="Interviewing" value={interviewing} tone="emerald" />
      </div>

      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xs">
        <div className="border-b border-gray-100 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by role, department, or location"
                className={inputClass + " pl-11"}
              />
            </label>
            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              className={inputClass + " sm:w-56"}
            >
              {departments.map((department) => <option key={department}>{department}</option>)}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-72 items-center justify-center text-[#4A1D96]">
            <Loader2 className="animate-spin" size={28} />
          </div>
        ) : filteredJobs.length ? (
          <div className="divide-y divide-gray-100">
            {filteredJobs.map((job, index) => {
              const days = getDaysUntilClosing(job.closingDate);
              const expired = days !== null && days < 0;
              return (
                <article key={job._id || job.id || job.title + index} className="group p-5 transition hover:bg-[#FAFAFF] sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-[#4A1D96]">{job.department || "General"}</span>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">{job.type || "Not specified"}</span>
                        {expired && <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">Closed</span>}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-gray-500">{job.description || "No description provided."}</p>
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-gray-500">
                        <span className="flex items-center gap-1.5"><MapPin size={15} className="text-[#4A1D96]" />{job.location || "Not specified"}</span>
                        <span className="flex items-center gap-1.5"><Clock3 size={15} className="text-[#4A1D96]" />Closes {formatDate(job.closingDate)}</span>
                        <span className="flex items-center gap-1.5"><Users size={15} className="text-[#4A1D96]" />{job.applicants || 0} applicants</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <button onClick={() => downloadJobPosting(job)} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#4A1D96]/30 hover:bg-indigo-50 hover:text-[#4A1D96]">
                        <Download size={16} /> Download
                      </button>
                      <button onClick={() => setSelectedJob(job)} className="inline-flex items-center gap-2 rounded-xl border border-[#4A1D96]/15 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-[#4A1D96] transition hover:bg-indigo-100">
                        <Eye size={16} /> View details
                      </button>
                      {!expired && (
                        <button onClick={() => openApplication(job)} className="inline-flex items-center gap-2 rounded-xl bg-[#4A1D96] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8B5CF6]">
                          <Send size={16} /> Apply
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 rounded-2xl bg-indigo-50 p-4 text-[#4A1D96]"><BriefcaseBusiness size={28} /></div>
            <h3 className="font-semibold text-gray-900">No job openings found</h3>
            <p className="mt-1 max-w-sm text-sm text-gray-500">Try changing your search filters or post a new opening.</p>
          </div>
        )}
      </section>

      {selectedJob && !showApplyModal && (
        <Modal title="Job details" onClose={() => setSelectedJob(null)} maxWidth="max-w-3xl">
          <JobDetails job={selectedJob} />
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button onClick={() => downloadJobPosting(selectedJob)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              <Download size={17} /> Download posting
            </button>
            {(getDaysUntilClosing(selectedJob.closingDate) ?? 0) >= 0 && (
              <button onClick={() => openApplication(selectedJob)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4A1D96] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8B5CF6]">
                <Send size={17} /> Apply for this role
              </button>
            )}
          </div>
        </Modal>
      )}

      {showPostModal && (
        <Modal title="Post a new job" subtitle="Create an opening that candidates can view and download." onClose={() => setShowPostModal(false)} maxWidth="max-w-3xl">
          <form onSubmit={handlePostJob} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Job title"><input required value={jobForm.title} onChange={(event) => setJobForm({ ...jobForm, title: event.target.value })} className={inputClass} placeholder="e.g. Senior Product Designer" /></Field>
              <Field label="Department"><input required value={jobForm.department} onChange={(event) => setJobForm({ ...jobForm, department: event.target.value })} className={inputClass} placeholder="e.g. Product" /></Field>
              <Field label="Location"><input required value={jobForm.location} onChange={(event) => setJobForm({ ...jobForm, location: event.target.value })} className={inputClass} placeholder="e.g. Lagos / Hybrid" /></Field>
              <Field label="Employment type"><select value={jobForm.type} onChange={(event) => setJobForm({ ...jobForm, type: event.target.value })} className={inputClass}><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option><option>Temporary</option></select></Field>
              <Field label="Salary range"><input required value={jobForm.salaryRange} onChange={(event) => setJobForm({ ...jobForm, salaryRange: event.target.value })} className={inputClass} placeholder="e.g. â‚¦500,000 - â‚¦700,000 monthly" /></Field>
              <Field label="Closing date"><input required min={getLocalDate()} type="date" value={jobForm.closingDate} onChange={(event) => setJobForm({ ...jobForm, closingDate: event.target.value })} className={inputClass} /></Field>
            </div>
            <Field label="Job description"><textarea required rows={4} value={jobForm.description} onChange={(event) => setJobForm({ ...jobForm, description: event.target.value })} className={inputClass + " resize-y"} placeholder="Give candidates a clear overview of the role and its impact." /></Field>
            <Field label="Responsibilities" hint="Use a new line or semicolon for each item."><textarea required rows={5} value={jobForm.responsibilities} onChange={(event) => setJobForm({ ...jobForm, responsibilities: event.target.value })} className={inputClass + " resize-y"} placeholder={"Lead cross-functional projects;\nCollaborate with stakeholders;\nReport on delivery metrics"} /></Field>
            <Field label="Requirements" hint="Use a new line or semicolon for each item."><textarea required rows={5} value={jobForm.requirements} onChange={(event) => setJobForm({ ...jobForm, requirements: event.target.value })} className={inputClass + " resize-y"} placeholder={"5+ years of relevant experience;\nStrong communication skills;\nRelevant degree or equivalent experience"} /></Field>
            <ModalActions onCancel={() => setShowPostModal(false)} loading={isSubmitting} submitLabel="Publish job" />
          </form>
        </Modal>
      )}

      {showApplyModal && selectedJob && (
        <Modal title="Submit application" subtitle={"Applying for " + selectedJob.title} onClose={() => { setShowApplyModal(false); setSelectedJob(null); }} maxWidth="max-w-2xl">
          <div className="mb-5 flex items-start gap-3 rounded-2xl bg-indigo-50 p-4">
            <div className="rounded-xl bg-white p-2 text-[#4A1D96]"><BriefcaseBusiness size={20} /></div>
            <div><p className="font-semibold text-gray-900">{selectedJob.title}</p><p className="mt-1 text-xs text-gray-500">{selectedJob.department} Â· {selectedJob.location} Â· {selectedJob.type}</p></div>
          </div>
          <form onSubmit={handleApplication} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name"><input required value={applicationForm.name} onChange={(event) => setApplicationForm({ ...applicationForm, name: event.target.value })} className={inputClass} placeholder="Your full name" /></Field>
              <Field label="Email address"><input required type="email" value={applicationForm.email} onChange={(event) => setApplicationForm({ ...applicationForm, email: event.target.value })} className={inputClass} placeholder="you@example.com" /></Field>
              <Field label="Phone number"><input required type="tel" value={applicationForm.phone} onChange={(event) => setApplicationForm({ ...applicationForm, phone: event.target.value })} className={inputClass} placeholder="e.g. +234 800 000 0000" /></Field>
              <Field label="Years of experience"><input required min={0} max={60} type="number" value={applicationForm.yearsOfExperience} onChange={(event) => setApplicationForm({ ...applicationForm, yearsOfExperience: Number(event.target.value) })} className={inputClass} /></Field>
              <Field label="Application date"><input required type="date" value={applicationForm.date} onChange={(event) => setApplicationForm({ ...applicationForm, date: event.target.value })} className={inputClass} /></Field>
              <Field label="Resume link or document reference"><input required value={applicationForm.resume} onChange={(event) => setApplicationForm({ ...applicationForm, resume: event.target.value })} className={inputClass} placeholder="Paste a public resume link or document ID" /></Field>
            </div>
            <p className="flex items-start gap-2 rounded-xl bg-gray-50 px-4 py-3 text-xs leading-5 text-gray-500"><FileText className="mt-0.5 shrink-0" size={15} />The current API accepts the resume as a text value, so provide a shareable link or an existing document reference.</p>
            <ModalActions onCancel={() => { setShowApplyModal(false); setSelectedJob(null); }} loading={isSubmitting} submitLabel="Submit application" />
          </form>
        </Modal>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "indigo" | "blue" | "amber" | "emerald" }) => {
  const colors = { indigo: "bg-indigo-50 text-[#4A1D96]", blue: "bg-blue-50 text-blue-600", amber: "bg-amber-50 text-amber-600", emerald: "bg-emerald-50 text-emerald-600" };
  return <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:p-5"><div className="mb-4 flex items-center justify-between"><div className={"rounded-xl p-2.5 " + colors[tone]}>{icon}</div></div><p className="text-2xl font-bold text-gray-900">{value}</p><p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">{label}</p></div>;
};

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => <label className="block"><span className="mb-1.5 block text-xs font-semibold text-gray-700">{label}</span>{children}{hint && <span className="mt-1.5 block text-xs text-gray-400">{hint}</span>}</label>;

const Modal = ({ title, subtitle, onClose, maxWidth, children }: { title: string; subtitle?: string; onClose: () => void; maxWidth: string; children: React.ReactNode }) => <div className="fixed inset-0 z-60 flex items-end justify-center bg-gray-950/45 p-0 backdrop-blur-xs sm:items-center sm:p-4"><div className={"mobile-safe-bottom max-h-[94dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7 " + maxWidth}><div className="mb-6 flex items-start justify-between gap-4"><div><h3 className="text-xl font-semibold text-gray-900">{title}</h3>{subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}</div><button onClick={onClose} className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700" aria-label="Close modal"><X size={20} /></button></div>{children}</div></div>;

const ModalActions = ({ onCancel, loading, submitLabel }: { onCancel: () => void; loading: boolean; submitLabel: string }) => <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} className="rounded-xl px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-100">Cancel</button><button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4A1D96] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8B5CF6] disabled:cursor-not-allowed disabled:opacity-60">{loading && <Loader2 className="animate-spin" size={17} />}{submitLabel}</button></div>;

const JobDetails = ({ job }: { job: Job }) => <div><div className="rounded-3xl bg-linear-to-br from-[#4A1D96] to-[#8B5CF6] p-6 text-white"><div className="flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-full bg-white/15 px-3 py-1.5">{job.department}</span><span className="rounded-full bg-white/15 px-3 py-1.5">{job.type}</span></div><h2 className="mt-5 text-2xl font-semibold">{job.title}</h2><div className="mt-4 flex flex-wrap gap-4 text-sm text-indigo-100"><span className="flex items-center gap-1.5"><MapPin size={16} />{job.location}</span><span className="flex items-center gap-1.5"><CalendarDays size={16} />Closes {formatDate(job.closingDate)}</span><span className="flex items-center gap-1.5"><Building2 size={16} />{job.salaryRange}</span></div></div><div className="mt-7 space-y-7"><DetailSection title="About the role" text={job.description} /><DetailList title="Key responsibilities" value={job.responsibilities} /><DetailList title="Requirements" value={job.requirements} /></div></div>;

const DetailSection = ({ title, text }: { title: string; text?: string }) => <section><h4 className="mb-2 font-semibold text-gray-900">{title}</h4><p className="whitespace-pre-line text-sm leading-7 text-gray-600">{text || "Not specified."}</p></section>;

const DetailList = ({ title, value }: { title: string; value?: string }) => { const items = splitDetails(value); return <section><h4 className="mb-3 font-semibold text-gray-900">{title}</h4>{items.length ? <ul className="space-y-2.5">{items.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-gray-600"><CheckCircle2 className="mt-1 shrink-0 text-[#4A1D96]" size={16} />{item}</li>)}</ul> : <p className="text-sm text-gray-500">Not specified.</p>}</section>; };

export default Recruitment;
