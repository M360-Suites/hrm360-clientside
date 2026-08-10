import {
  BellRing,
  Check,
  ChevronRight,
  CircleDollarSign,
  Copy,
  KeyRound,
  Loader2,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import {
  type LeavePolicy,
  type LeaveSettings,
  type LoanSettings,
  type ManagedUser,
  type NotificationSettings,
  type TwoFactorSetup,
  useSettingsStore,
} from "../../store/useSettingsStore";

type TabId = "security" | "notifications" | "leave" | "loan" | "users";

interface AccountUser {
  name?: string;
  fullName?: string;
  email?: string;
  role?: string;
}

interface PasswordFields {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ManagedUserForm {
  userId: string;
  roles: string;
}

interface SecurityPanelProps {
  user: AccountUser | null;
  enabled: boolean;
  setup: TwoFactorSetup | null;
  token: string;
  setToken: (value: string) => void;
  mode: "verify" | "disable" | null;
  setMode: (value: "verify" | "disable" | null) => void;
  beginTwoFactor: (reset?: boolean) => Promise<void>;
  submitTwoFactor: () => Promise<void>;
  activeAction: string | null;
  passwords: PasswordFields;
  setPasswords: React.Dispatch<React.SetStateAction<PasswordFields>>;
  handlePassword: (event: React.FormEvent) => Promise<void>;
}

interface UsersPanelProps {
  users: ManagedUser[];
  loading: boolean;
  removing: string;
  showForm: boolean;
  setShowForm: (value: boolean) => void;
  form: ManagedUserForm;
  setForm: React.Dispatch<React.SetStateAction<ManagedUserForm>>;
  onSave: (event: React.FormEvent) => Promise<void>;
  saving: boolean;
  onRemove: (userId: string) => Promise<void>;
}

const notificationDefaults: NotificationSettings = {
  exit: false,
  grievance: false,
  leave: false,
  loan: false,
  payroll: false,
  probation: false,
};

const leaveDefaults: LeaveSettings = {
  annual: { days: 20, paid: true, needApproval: true },
  sick: { days: 10, paid: true, needApproval: true },
  maternity: { days: 90, paid: true, needApproval: true },
  paternity: { days: 5, paid: true, needApproval: true },
  unpaid: { days: 0, paid: false, needApproval: true },
  bereavement: { days: 5, paid: true, needApproval: true },
};

const loanDefaults: LoanSettings = {
  maxLoanMultiple: 0,
  maxLoanAmount: 0,
  annualInterestRate: 0,
  maxRepaymentPeriod: "",
  coolingPeriod: "",
  requestPayrollPin: true,
  attachedDocs: [],
};

const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-hidden transition focus:border-[#3B00D9] focus:ring-2 focus:ring-[#3B00D9]/10";

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

const sectionFrom = (settings: Record<string, unknown> | null, keys: string[]) => {
  const source = asRecord(settings);
  for (const key of keys) {
    const section = asRecord(source[key]);
    if (Object.keys(section).length) return section;
  }
  return {};
};

const booleanFrom = (value: unknown, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return fallback;
};

const numberFrom = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const hydrateNotifications = (settings: Record<string, unknown> | null) => {
  const source = sectionFrom(settings, ["notifications", "notificationSettings"]);
  return Object.fromEntries(
    Object.keys(notificationDefaults).map((key) => [key, booleanFrom(source[key], notificationDefaults[key as keyof NotificationSettings])]),
  ) as unknown as NotificationSettings;
};

const hydrateLeave = (settings: Record<string, unknown> | null) => {
  const source = sectionFrom(settings, ["leave", "leaveSettings", "leavePolicy"]);
  return Object.fromEntries(
    Object.entries(leaveDefaults).map(([key, fallback]) => {
      const item = asRecord(source[key]);
      return [key, {
        days: numberFrom(item.days, fallback.days),
        paid: booleanFrom(item.paid, fallback.paid),
        needApproval: booleanFrom(item.needApproval, fallback.needApproval),
      }];
    }),
  ) as unknown as LeaveSettings;
};

const hydrateLoan = (settings: Record<string, unknown> | null): LoanSettings => {
  const source = sectionFrom(settings, ["loan", "loanSettings", "loanPolicy"]);
  const docs = source.attachedDocs;
  return {
    maxLoanMultiple: numberFrom(source.maxLoanMultiple),
    maxLoanAmount: numberFrom(source.maxLoanAmount),
    annualInterestRate: numberFrom(source.annualInterestRate),
    maxRepaymentPeriod: String(source.maxRepaymentPeriod || ""),
    coolingPeriod: String(source.coolingPeriod || ""),
    requestPayrollPin: booleanFrom(source.requestPayrollPin, true),
    attachedDocs: Array.isArray(docs) ? docs.map(String) : [],
  };
};

const Settings = () => {
  const { user, isAdmin } = useAuthStore();
  const {
    userSettings,
    managedUsers,
    twoFactorSetup,
    isLoading,
    activeAction,
    error,
    clearError,
    fetchOrganizationSettings,
    fetchUserSettings,
    enableTwoFactor,
    resetTwoFactor,
    verifyTwoFactor,
    disableTwoFactor,
    resetPassword,
    updateNotifications,
    updateLeaveSettings,
    updateLoanSettings,
    fetchManagedUsers,
    updateManagedUser,
    removeManagedUser,
  } = useSettingsStore();

  const role = String(user?.role || "").trim().toLowerCase();
  const canManageOrganization = isAdmin || ["admin", "owner", "super_admin", "hr", "hr_staff", "human resources"].includes(role);
  const canManageUsers = isAdmin || ["admin", "owner", "super_admin"].includes(role);
  const [activeTab, setActiveTab] = useState<TabId>("security");
  const [notifications, setNotifications] = useState(notificationDefaults);
  const [leaveSettings, setLeaveSettings] = useState(leaveDefaults);
  const [loanSettings, setLoanSettings] = useState(loanDefaults);
  const [attachedDocs, setAttachedDocs] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [twoFactorMode, setTwoFactorMode] = useState<"verify" | "disable" | null>(null);
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [managedUserForm, setManagedUserForm] = useState({ userId: "", roles: "" });
  const [showManagedUserForm, setShowManagedUserForm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    void fetchUserSettings();
    if (canManageOrganization) {
      void fetchOrganizationSettings().then(() => {
        const settings = useSettingsStore.getState().organizationSettings;
        const loan = hydrateLoan(settings);
        setNotifications(hydrateNotifications(settings));
        setLeaveSettings(hydrateLeave(settings));
        setLoanSettings(loan);
        setAttachedDocs(loan.attachedDocs.join("\n"));
      });
    }
  }, [canManageOrganization, fetchOrganizationSettings, fetchUserSettings]);

  const tabs = useMemo(() => {
    const items = [{ id: "security" as TabId, label: "Account & security", icon: ShieldCheck }];
    if (canManageOrganization) items.push(
      { id: "notifications", label: "Notifications", icon: BellRing },
      { id: "leave", label: "Leave policy", icon: UserCog },
      { id: "loan", label: "Loan policy", icon: CircleDollarSign },
    );
    if (canManageUsers) items.push({ id: "users", label: "User management", icon: Users });
    return items;
  }, [canManageOrganization, canManageUsers]);

  const security = sectionFrom(userSettings, ["security", "twoFactor", "twoFactorAuth"]);
  const twoFactorEnabled = booleanFrom(
    userSettings?.twoFactorEnabled ?? userSettings?.is2FAEnabled ?? userSettings?.twoFactorAuthEnabled ?? security.enabled ?? security.twoFactorEnabled,
  );

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  };

  const beginTwoFactor = async (reset = false) => {
    const success = reset ? await resetTwoFactor() : await enableTwoFactor();
    if (success) {
      setAuthToken("");
      setTwoFactorMode("verify");
    }
  };

  const submitTwoFactor = async () => {
    if (authToken.trim().length < 6) return;
    const success = twoFactorMode === "disable"
      ? await disableTwoFactor(authToken.trim())
      : await verifyTwoFactor(authToken.trim());
    if (!success) return;
    setAuthToken("");
    setTwoFactorMode(null);
    showToast(twoFactorMode === "disable" ? "Two-factor authentication disabled." : "Two-factor authentication enabled.");
  };

  const handlePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast("New passwords do not match.");
      return;
    }
    const success = await resetPassword({ oldPassword: passwords.oldPassword, newPassword: passwords.newPassword });
    if (!success) return;
    setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    showToast("Password updated successfully.");
  };

  const saveNotifications = async () => {
    if (await updateNotifications(notifications)) showToast("Notification preferences saved.");
  };

  const saveLeave = async () => {
    if (await updateLeaveSettings(leaveSettings)) showToast("Leave policy saved.");
  };

  const saveLoan = async () => {
    const payload = {
      ...loanSettings,
      attachedDocs: attachedDocs.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean),
    };
    if (await updateLoanSettings(payload)) showToast("Loan policy saved.");
  };

  const openUsers = () => {
    setActiveTab("users");
    if (!managedUsers.length) void fetchManagedUsers();
  };

  const saveManagedUser = async (event: React.FormEvent) => {
    event.preventDefault();
    const roles = managedUserForm.roles.split(",").map((item) => item.trim()).filter(Boolean);
    if (!roles.length) return;
    const success = await updateManagedUser({ userId: managedUserForm.userId.trim(), roles });
    if (!success) return;
    setManagedUserForm({ userId: "", roles: "" });
    setShowManagedUserForm(false);
    showToast("Managed user permissions updated.");
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      {toast && <div className="fixed right-4 top-20 z-70 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-xl"><Check size={17} />{toast}</div>}

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#3B00D9]">Workspace preferences</p>
        <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
        <p className="mt-1 text-sm text-gray-500">Manage your security and the policies you are authorized to control.</p>
      </div>

      {error && <div className="flex items-center justify-between rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"><span>{error}</span><button onClick={clearError}>Dismiss</button></div>}

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-gray-100 bg-white p-3 shadow-xs">
          <div className="mb-3 rounded-2xl bg-linear-to-br from-[#2B009B] to-[#5B21E8] p-4 text-white">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-lg font-bold">{String(user?.name || user?.email || "U").charAt(0).toUpperCase()}</div>
            <p className="truncate text-sm font-semibold">{user?.name || user?.fullName || "Account user"}</p>
            <p className="mt-1 truncate text-xs text-indigo-100">{user?.email || ""}</p>
          </div>
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return <button key={tab.id} onClick={() => tab.id === "users" ? openUsers() : setActiveTab(tab.id)} className={"flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition " + (activeTab === tab.id ? "bg-indigo-50 text-[#3B00D9]" : "text-gray-600 hover:bg-gray-50")}><Icon size={18} /><span className="flex-1">{tab.label}</span><ChevronRight size={15} /></button>;
            })}
          </nav>
        </aside>

        <main className="min-w-0">
          {isLoading && !userSettings ? <LoadingPanel /> : activeTab === "security" ? (
            <SecurityPanel
              user={user}
              enabled={twoFactorEnabled}
              setup={twoFactorSetup}
              token={authToken}
              setToken={setAuthToken}
              mode={twoFactorMode}
              setMode={setTwoFactorMode}
              beginTwoFactor={beginTwoFactor}
              submitTwoFactor={submitTwoFactor}
              activeAction={activeAction}
              passwords={passwords}
              setPasswords={setPasswords}
              handlePassword={handlePassword}
            />
          ) : activeTab === "notifications" ? (
            <NotificationsPanel value={notifications} onChange={setNotifications} onSave={saveNotifications} saving={activeAction === "notifications"} />
          ) : activeTab === "leave" ? (
            <LeavePanel value={leaveSettings} onChange={setLeaveSettings} onSave={saveLeave} saving={activeAction === "leave"} />
          ) : activeTab === "loan" ? (
            <LoanPanel value={loanSettings} onChange={setLoanSettings} docs={attachedDocs} setDocs={setAttachedDocs} onSave={saveLoan} saving={activeAction === "loan"} />
          ) : (
            <UsersPanel users={managedUsers} loading={activeAction === "managed-users"} removing={activeAction || ""} showForm={showManagedUserForm} setShowForm={setShowManagedUserForm} form={managedUserForm} setForm={setManagedUserForm} onSave={saveManagedUser} saving={activeAction === "save-user"} onRemove={async (id: string) => { if (await removeManagedUser(id)) showToast("Managed user removed."); }} />
          )}
        </main>
      </div>
    </div>
  );
};

const Panel = ({ title, description, children }: { title: string; description: string; children: React.ReactNode }) => <section className="rounded-3xl border border-gray-100 bg-white shadow-xs"><div className="border-b border-gray-100 p-5 sm:p-6"><h3 className="text-lg font-semibold text-gray-900">{title}</h3><p className="mt-1 text-sm text-gray-500">{description}</p></div><div className="p-5 sm:p-6">{children}</div></section>;

const LoadingPanel = () => <div className="flex min-h-96 items-center justify-center rounded-3xl border border-gray-100 bg-white text-[#3B00D9]"><Loader2 className="animate-spin" size={28} /></div>;

const SecurityPanel = ({ user, enabled, setup, token, setToken, mode, setMode, beginTwoFactor, submitTwoFactor, activeAction, passwords, setPasswords, handlePassword }: SecurityPanelProps) => {
  const qrSource = setup?.qrCode || setup?.qrCodeUrl;
  return <div className="space-y-6"><Panel title="Account overview" description="Your personal account details and access level."><div className="grid gap-4 sm:grid-cols-3"><Info label="Name" value={user?.name || user?.fullName || "Not provided"} /><Info label="Email" value={user?.email || "Not provided"} /><Info label="Role" value={user?.role || "Administrator"} /></div></Panel><Panel title="Two-factor authentication" description="Add an authenticator-code requirement to protect your account."><div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className={"rounded-xl p-3 " + (enabled ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}><ShieldCheck size={22} /></div><div><p className="font-semibold text-gray-900">Authenticator app</p><p className="mt-1 text-xs text-gray-500">{enabled ? "Enabled and protecting your account" : "Not enabled"}</p></div></div><div className="flex flex-wrap gap-2">{enabled ? <><ActionButton onClick={() => beginTwoFactor(true)} loading={activeAction === "reset-2fa"} label="Reset setup" /><button onClick={() => { setMode("disable"); setToken(""); }} className="rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50">Disable</button></> : <ActionButton onClick={() => beginTwoFactor(false)} loading={activeAction === "enable-2fa"} label="Enable 2FA" primary />}</div></div>{mode && <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">{mode === "verify" && <div className="mb-5 grid gap-5 sm:grid-cols-[160px_1fr]">{qrSource ? <img src={qrSource} alt="Authenticator QR code" className="h-40 w-40 rounded-xl border bg-white object-contain p-2" /> : <div className="flex h-40 w-40 items-center justify-center rounded-xl border bg-white text-[#3B00D9]"><KeyRound size={34} /></div>}<div><h4 className="font-semibold text-gray-900">Connect your authenticator</h4><p className="mt-2 text-sm leading-6 text-gray-600">Scan the QR code or enter the setup key, then provide the six-digit token generated by your app.</p>{setup?.secret && <button onClick={() => navigator.clipboard.writeText(setup.secret || "")} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 py-2 font-mono text-xs text-[#3B00D9]"><Copy size={14} />{setup.secret}</button>}</div></div>}<div className="flex flex-col gap-3 sm:flex-row"><input value={token} onChange={(event) => setToken(event.target.value.replace(/\D/g, "").slice(0, 8))} inputMode="numeric" placeholder="Enter authenticator token" className={inputClass + " tracking-[0.25em]"} /><button disabled={token.length < 6 || activeAction === "verify-2fa" || activeAction === "disable-2fa"} onClick={submitTwoFactor} className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-[#3B00D9] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{activeAction?.includes("2fa") && <Loader2 className="animate-spin" size={16} />}{mode === "disable" ? "Confirm disable" : "Verify and enable"}</button></div></div>}</Panel><Panel title="Change password" description="Use your current password to set a new account password."><form onSubmit={handlePassword} className="grid gap-4 sm:grid-cols-2"><label className="sm:col-span-2"><FieldLabel>Current password</FieldLabel><input required type="password" value={passwords.oldPassword} onChange={(event) => setPasswords({ ...passwords, oldPassword: event.target.value })} className={inputClass} /></label><label><FieldLabel>New password</FieldLabel><input required minLength={8} type="password" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} className={inputClass} /></label><label><FieldLabel>Confirm password</FieldLabel><input required minLength={8} type="password" value={passwords.confirmPassword} onChange={(event) => setPasswords({ ...passwords, confirmPassword: event.target.value })} className={inputClass} /></label><div className="sm:col-span-2 flex justify-end"><ActionButton type="submit" loading={activeAction === "password"} label="Update password" primary /></div></form></Panel></div>;
};

const NotificationsPanel = ({ value, onChange, onSave, saving }: { value: NotificationSettings; onChange: (value: NotificationSettings) => void; onSave: () => void; saving: boolean }) => { const labels: Record<keyof NotificationSettings, string> = { exit: "Exit management", grievance: "Grievance cases", leave: "Leave requests", loan: "Loan activity", payroll: "Payroll events", probation: "Probation and promotion" }; return <Panel title="Organization notifications" description="Choose which HR events should generate organization notifications."><div className="divide-y divide-gray-100">{Object.entries(labels).map(([key, label]) => <div key={key} className="flex items-center justify-between gap-4 py-4"><div><p className="text-sm font-semibold text-gray-800">{label}</p><p className="mt-1 text-xs text-gray-500">Notify authorized users when this activity requires attention.</p></div><Toggle checked={value[key as keyof NotificationSettings]} onChange={(checked) => onChange({ ...value, [key]: checked })} /></div>)}</div><SaveBar onSave={onSave} saving={saving} /></Panel>; };

const LeavePanel = ({ value, onChange, onSave, saving }: { value: LeaveSettings; onChange: (value: LeaveSettings) => void; onSave: () => void; saving: boolean }) => <Panel title="Leave policy" description="Configure days, paid status, and approval requirements for each leave type."><div className="grid gap-4 md:grid-cols-2">{Object.entries(value).map(([key, policy]) => <LeaveCard key={key} name={key} policy={policy} onChange={(next) => onChange({ ...value, [key]: next })} />)}</div><SaveBar onSave={onSave} saving={saving} /></Panel>;

const LeaveCard = ({ name, policy, onChange }: { name: string; policy: LeavePolicy; onChange: (value: LeavePolicy) => void }) => <div className="rounded-2xl border border-gray-100 p-4"><h4 className="mb-4 capitalize font-semibold text-gray-900">{name} leave</h4><label><FieldLabel>Allowed days</FieldLabel><input min={0} type="number" value={policy.days} onChange={(event) => onChange({ ...policy, days: Number(event.target.value) })} className={inputClass} /></label><div className="mt-4 space-y-3"><ToggleRow label="Paid leave" checked={policy.paid} onChange={(paid) => onChange({ ...policy, paid })} /><ToggleRow label="Requires approval" checked={policy.needApproval} onChange={(needApproval) => onChange({ ...policy, needApproval })} /></div></div>;

const LoanPanel = ({ value, onChange, docs, setDocs, onSave, saving }: { value: LoanSettings; onChange: (value: LoanSettings) => void; docs: string; setDocs: (value: string) => void; onSave: () => void; saving: boolean }) => <Panel title="Loan policy" description="Set organization-wide loan limits, repayment rules, and supporting document requirements."><div className="grid gap-4 sm:grid-cols-2"><NumberField label="Maximum salary multiple" value={value.maxLoanMultiple} onChange={(maxLoanMultiple) => onChange({ ...value, maxLoanMultiple })} /><NumberField label="Maximum loan amount" value={value.maxLoanAmount} onChange={(maxLoanAmount) => onChange({ ...value, maxLoanAmount })} /><NumberField label="Annual interest rate (%)" value={value.annualInterestRate} onChange={(annualInterestRate) => onChange({ ...value, annualInterestRate })} /><label><FieldLabel>Maximum repayment period</FieldLabel><input value={value.maxRepaymentPeriod} onChange={(event) => onChange({ ...value, maxRepaymentPeriod: event.target.value })} className={inputClass} placeholder="e.g. 12 months" /></label><label><FieldLabel>Cooling period</FieldLabel><input value={value.coolingPeriod} onChange={(event) => onChange({ ...value, coolingPeriod: event.target.value })} className={inputClass} placeholder="e.g. 3 months" /></label><div className="flex items-end"><div className="w-full rounded-xl border border-gray-100 px-4 py-3"><ToggleRow label="Require payroll PIN" checked={value.requestPayrollPin} onChange={(requestPayrollPin) => onChange({ ...value, requestPayrollPin })} /></div></div><label className="sm:col-span-2"><FieldLabel>Required document IDs</FieldLabel><textarea value={docs} onChange={(event) => setDocs(event.target.value)} rows={4} className={inputClass + " resize-y"} placeholder="Enter one document reference per line" /></label></div><SaveBar onSave={onSave} saving={saving} /></Panel>;

const UsersPanel = ({ users, loading, removing, showForm, setShowForm, form, setForm, onSave, saving, onRemove }: UsersPanelProps) => <Panel title="User management" description="Assign organization-management roles only to users who need administrative access."><div className="mb-5 flex justify-end"><button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 rounded-xl bg-[#3B00D9] px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16} />Add or update user</button></div>{showForm && <form onSubmit={onSave} className="mb-6 grid gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 sm:grid-cols-2"><label><FieldLabel>User ID</FieldLabel><input required value={form.userId} onChange={(event) => setForm({ ...form, userId: event.target.value })} className={inputClass} placeholder="User identifier" /></label><label><FieldLabel>Roles</FieldLabel><input required value={form.roles} onChange={(event) => setForm({ ...form, roles: event.target.value })} className={inputClass} placeholder="admin, hr_staff" /></label><div className="flex gap-2 sm:col-span-2 sm:justify-end"><button type="button" onClick={() => setShowForm(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600">Cancel</button><ActionButton type="submit" label="Save access" loading={saving} primary /></div></form>}{loading ? <div className="flex min-h-48 items-center justify-center text-[#3B00D9]"><Loader2 className="animate-spin" /></div> : users.length ? <div className="divide-y divide-gray-100">{users.map((item: ManagedUser, index: number) => { const id = item.userId || item.user?._id || item.user?.id || item._id || item.id || ""; const name = item.name || item.fullName || item.user?.name || item.user?.fullName || "Managed user"; const email = item.email || item.user?.email || id; const roles = item.roles || (item.role ? [item.role] : []); return <div key={id || index} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 font-bold text-[#3B00D9]">{name.charAt(0).toUpperCase()}</div><div><p className="text-sm font-semibold text-gray-900">{name}</p><p className="mt-1 text-xs text-gray-500">{email}</p><div className="mt-2 flex flex-wrap gap-1">{roles.map((role: string) => <span key={role} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{role}</span>)}</div></div></div><button disabled={removing === "remove-user-" + id} onClick={() => onRemove(id)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-100 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50">{removing === "remove-user-" + id ? <Loader2 className="animate-spin" size={15} /> : <Trash2 size={15} />}Remove</button></div>; })}</div> : <div className="rounded-2xl bg-gray-50 p-8 text-center"><Users className="mx-auto text-gray-300" size={30} /><p className="mt-3 text-sm font-semibold text-gray-700">No managed users found</p></div>}</Panel>;

const Info = ({ label, value }: { label: string; value: string }) => <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs font-medium text-gray-400">{label}</p><p className="mt-2 truncate text-sm font-semibold text-gray-800">{value}</p></div>;
const FieldLabel = ({ children }: { children: React.ReactNode }) => <span className="mb-1.5 block text-xs font-semibold text-gray-700">{children}</span>;
const NumberField = ({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) => <label><FieldLabel>{label}</FieldLabel><input min={0} step="any" type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} className={inputClass} /></label>;
const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={"relative h-7 w-12 rounded-full transition " + (checked ? "bg-[#3B00D9]" : "bg-gray-200")}><span className={"absolute top-1 h-5 w-5 rounded-full bg-white shadow transition " + (checked ? "left-6" : "left-1")} /></button>;
const ToggleRow = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) => <div className="flex items-center justify-between gap-3"><span className="text-sm font-medium text-gray-600">{label}</span><Toggle checked={checked} onChange={onChange} /></div>;
const ActionButton = ({ label, loading, primary, type = "button", onClick }: { label: string; loading: boolean; primary?: boolean; type?: "button" | "submit"; onClick?: () => void }) => <button type={type} onClick={onClick} disabled={loading} className={"inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 " + (primary ? "bg-[#3B00D9] text-white hover:bg-[#3100b5]" : "border border-gray-200 text-gray-700 hover:bg-gray-50")}>{loading && <Loader2 className="animate-spin" size={16} />}{label}</button>;
const SaveBar = ({ onSave, saving }: { onSave: () => void; saving: boolean }) => <div className="mt-6 flex justify-end border-t border-gray-100 pt-5"><button onClick={onSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#3B00D9] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}Save changes</button></div>;

export default Settings;
