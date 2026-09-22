import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, Check, FolderKanban, Plus, Users, Video } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toggle } from "@/components/ui/Toggle";
import { useAuthStore } from "@/stores/auth";
import { useGoogleIntegration, useConnectGoogle } from "@/features/auth/google-api";
import { useMembers, useInviteMember } from "@/features/members/api";
import { useProjects, useCreateProject, useProject } from "@/features/projects/api";
import { useCreateMeeting } from "./api";

const STEPS = [
  { key: "project", label: "Project", icon: FolderKanban },
  { key: "members", label: "Members", icon: Users },
  { key: "meeting", label: "Meeting", icon: CalendarDays },
];

const inputClass = "field";

function pad(n) {
  return String(n).padStart(2, "0");
}

function toLocalInput(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultTimes() {
  const start = new Date();
  start.setMinutes(Math.ceil(start.getMinutes() / 15) * 15, 0, 0);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  return { scheduled_start_at: toLocalInput(start), scheduled_end_at: toLocalInput(end) };
}

function unwrapList(payload) {
  return payload?.data ?? payload ?? [];
}

function Stepper({ step }) {
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((item, index) => {
        const done = index < step;
        const current = index === step;
        const Icon = item.icon;
        return (
          <li key={item.key} className="flex min-w-0 flex-1 items-center gap-2">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
              done ? "border-brand-500 bg-brand-500 text-white" : current ? "border-brand-200 bg-brand-50 text-brand-700" : "border-line bg-surface text-ink-soft"
            }`}>
              {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </div>
            <span className={`hidden truncate text-sm font-medium sm:block ${current || done ? "text-ink" : "text-ink-soft"}`}>{item.label}</span>
            {index < STEPS.length - 1 && <span className={`hidden h-px flex-1 sm:block ${done ? "bg-brand-300" : "bg-line"}`} />}
          </li>
        );
      })}
    </ol>
  );
}

function ProjectStep({ selectedId, onSelect, onCreated }) {
  const { data, isLoading } = useProjects({ per_page: 100 });
  const create = useCreateProject();
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", description: "" });
  const projects = unwrapList(data);

  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    create.mutate(form, {
      onSuccess: (result) => {
        const project = result?.data ?? result;
        onCreated(project);
        setShowNew(false);
        setForm({ name: "", code: "", description: "" });
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Choose a project</h2>
          <p className="mt-1 text-sm text-ink-soft">Group this meeting under an existing initiative, or create one now.</p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={() => setShowNew((v) => !v)}>
          <Plus className="h-4 w-4" /> New project
        </Button>
      </div>

      {showNew && (
        <Card className="p-5">
          <form onSubmit={submit} className="space-y-3">
            <input autoFocus required placeholder="Project name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
            <input placeholder="Code (optional)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className={inputClass} />
            <textarea placeholder="Description (optional)" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
            {create.isError && <p className="text-sm text-rose-600">{create.error?.response?.data?.message ?? "Couldn't create the project."}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={create.isPending}>{create.isPending ? "Creating…" : "Create project"}</Button>
            </div>
          </form>
        </Card>
      )}

      <button
        type="button"
        onClick={() => onSelect(null, null)}
        className={`focus-ring w-full rounded-2xl border px-4 py-3 text-left text-sm ${selectedId == null ? "border-brand-200 bg-brand-50 text-brand-700" : "border-line bg-surface text-ink-soft hover:text-ink"}`}
      >
        No project — keep this meeting ungrouped
      </button>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      ) : projects.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((project) => {
            const active = selectedId === project.id;
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => onSelect(project.id, project)}
                className={`focus-ring rounded-2xl border p-4 text-left transition-colors ${active ? "border-brand-200 bg-brand-50" : "border-line bg-surface hover:border-brand-100"}`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: project.color ?? "#8b5cf6" }} />
                  <span className="truncate font-medium text-ink">{project.name}</span>
                  {project.code && <Badge tone="neutral">{project.code}</Badge>}
                </div>
                {project.description && <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{project.description}</p>}
              </button>
            );
          })}
        </div>
      ) : !showNew && (
        <p className="text-sm text-ink-soft">No projects yet. Create one above, or continue without a project.</p>
      )}
    </div>
  );
}

function MembersStep({ selectedIds, onToggle, onInvited }) {
  const { data, isLoading } = useMembers({ per_page: 100 });
  const invite = useInviteMember();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ email: "", role: "employee" });
  const members = unwrapList(data);

  const submit = (event) => {
    event.preventDefault();
    if (!form.email.trim()) return;
    invite.mutate(form, {
      onSuccess: (result) => {
        const member = result?.data ?? result;
        if (member?.id) onInvited(member.id);
        setShowInvite(false);
        setForm({ email: "", role: "employee" });
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Add or select members</h2>
          <p className="mt-1 text-sm text-ink-soft">You are the organizer. Pick teammates to invite, or add someone new.</p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={() => setShowInvite((v) => !v)}>
          <Plus className="h-4 w-4" /> Invite member
        </Button>
      </div>

      {showInvite && (
        <Card className="p-5">
          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <input autoFocus required type="email" placeholder="name@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputClass}>
              <option value="employee">Employee</option>
              <option value="meeting_organizer">Meeting organizer</option>
              <option value="manager">Manager</option>
              <option value="org_admin">Org admin</option>
            </select>
            <Button type="submit" size="sm" disabled={invite.isPending}>{invite.isPending ? "Inviting…" : "Invite"}</Button>
            {invite.isError && <p className="text-sm text-rose-600 sm:col-span-3">{invite.error?.response?.data?.message ?? "Couldn't send the invite."}</p>}
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-2xl" />)}</div>
      ) : members.length > 0 ? (
        <Card className="divide-y divide-line">
          {members.map((member) => {
            const isOrganizer = member.id === currentUserId;
            const checked = isOrganizer || selectedIds.includes(member.id);
            return (
              <label key={member.id} className={`flex cursor-pointer items-center gap-3 p-4 ${isOrganizer ? "bg-canvas/60" : "hover:bg-canvas"}`}>
                <input
                  type="checkbox"
                  disabled={isOrganizer}
                  checked={checked}
                  onChange={() => onToggle(member.id)}
                  className="h-4 w-4 rounded border-line text-brand-600"
                />
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 font-medium text-brand-700">
                  {member.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{member.name}</p>
                  <p className="truncate text-sm text-ink-soft">{member.email}</p>
                </div>
                {isOrganizer && <Badge tone="brand">Organizer</Badge>}
                {member.role?.name && !isOrganizer && <Badge tone="neutral">{member.role.name}</Badge>}
              </label>
            );
          })}
        </Card>
      ) : (
        <p className="text-sm text-ink-soft">No members yet. Invite someone above, or continue with just you as organizer.</p>
      )}
    </div>
  );
}

function MeetingStep({ form, setForm, googleStatus, connectGoogle, onConnectGoogle }) {
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold text-ink">Meeting details</h2>
        <p className="mt-1 text-sm text-ink-soft">Schedule the call. Google Meet opens inside this window when you join.</p>
      </div>
      <label className="block text-sm font-medium text-ink">
        Title
        <input required value={form.title} onChange={update("title")} className={`${inputClass} mt-1.5`} placeholder="Weekly product sync" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-ink">
          Starts
          <input required type="datetime-local" value={form.scheduled_start_at} onChange={update("scheduled_start_at")} className={`${inputClass} mt-1.5`} />
        </label>
        <label className="block text-sm font-medium text-ink">
          Ends
          <input required type="datetime-local" value={form.scheduled_end_at} onChange={update("scheduled_end_at")} className={`${inputClass} mt-1.5`} />
        </label>
      </div>
      <label className="block text-sm font-medium text-ink">
        Timezone
        <input required value={form.timezone} onChange={update("timezone")} className={`${inputClass} mt-1.5`} />
      </label>
      <label className="block text-sm font-medium text-ink">
        Objective <span className="font-normal text-ink-soft">(optional)</span>
        <textarea value={form.objective} onChange={update("objective")} rows={2} className={`${inputClass} mt-1.5`} placeholder="What should this meeting decide?" />
      </label>
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-line p-4">
        <div>
          <p className="font-medium text-ink">Create Google Meet</p>
          <p className="mt-0.5 text-sm text-ink-soft">Adds a conference link and opens it embedded in MeetingAI when you join. You're the organizer, so Google Meet makes you the host automatically.</p>
        </div>
        <Toggle checked={form.create_google_meet} onChange={(checked) => setForm((current) => ({ ...current, create_google_meet: checked }))} label="Create Google Meet" />
      </div>
      {form.create_google_meet && googleStatus && !googleStatus.connected && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div>
            <p className="text-sm font-medium text-amber-900">Connect Google to create the real Meet link</p>
            <p className="mt-0.5 text-sm text-amber-800">Without this, the meeting saves but has no working Google Meet link yet.</p>
          </div>
          <Button type="button" size="sm" variant="secondary" onClick={onConnectGoogle} disabled={connectGoogle.isPending}>
            {connectGoogle.isPending ? "Redirecting…" : "Connect Google"}
          </Button>
        </div>
      )}
      {form.create_google_meet && googleStatus?.connected && (
        <p className="flex items-center gap-1.5 text-sm text-emerald-700">
          <Check className="h-4 w-4" /> Google connected as {googleStatus.email} — you'll be the meeting host.
        </p>
      )}
    </div>
  );
}

export function CreateMeetingWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProject = searchParams.get("project");
  const { data: preloaded } = useProject(preselectedProject);
  const createMeeting = useCreateMeeting();
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [step, setStep] = useState(0);
  const [projectId, setProjectId] = useState(preselectedProject);
  const [projectName, setProjectName] = useState("");
  const [memberIds, setMemberIds] = useState([]);
  const presetStart = searchParams.get("start");
  const presetEnd = searchParams.get("end");
  const [form, setForm] = useState({
    title: "",
    objective: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    create_google_meet: true,
    ...defaultTimes(),
    ...(presetStart ? { scheduled_start_at: presetStart } : {}),
    ...(presetEnd ? { scheduled_end_at: presetEnd } : {}),
  });
  const [error, setError] = useState("");

  const googleIntegration = useGoogleIntegration();
  const connectGoogle = useConnectGoogle();

  // Connecting Google mid-wizard bounces the whole browser to Google and
  // back, which would otherwise lose everything typed so far — stash it
  // right before leaving, restore it once we land back on this same route.
  const DRAFT_KEY = "meeting-wizard-draft";
  useEffect(() => {
    if (searchParams.get("google_connected") === null) return;
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        setStep(draft.step ?? 0);
        setProjectId(draft.projectId ?? null);
        setProjectName(draft.projectName ?? "");
        setMemberIds(draft.memberIds ?? []);
        setForm((current) => ({ ...current, ...draft.form }));
      }
    } catch {
      // Corrupt/missing draft — just continue with a fresh wizard.
    } finally {
      sessionStorage.removeItem(DRAFT_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onConnectGoogle = () => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ step, projectId, projectName, memberIds, form }));
    connectGoogle.mutate("/meetings/new");
  };

  useEffect(() => {
    if (preselectedProject) setProjectId(preselectedProject);
  }, [preselectedProject]);

  useEffect(() => {
    if (preloaded?.name) setProjectName(preloaded.name);
  }, [preloaded]);

  const selectedSummary = useMemo(() => {
    const extras = memberIds.filter((id) => id !== currentUserId).length;
    return {
      project: projectName,
      people: extras + 1,
    };
  }, [projectName, memberIds, currentUserId]);

  const selectProject = (id, project) => {
    setProjectId(id);
    setProjectName(project?.name ?? "");
  };

  const toggleMember = (id) => {
    if (id === currentUserId) return;
    setMemberIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const participants = memberIds
      .filter((id) => id !== currentUserId)
      .map((user_id) => ({ user_id }));

    try {
      const meeting = await createMeeting.mutateAsync({
        title: form.title,
        objective: form.objective || null,
        timezone: form.timezone,
        scheduled_start_at: form.scheduled_start_at,
        scheduled_end_at: form.scheduled_end_at,
        status: "scheduled",
        visibility: "organization",
        primary_language: "en",
        languages: ["en"],
        create_google_meet: form.create_google_meet,
        project_id: projectId || null,
        participants,
      });
      if (form.create_google_meet) {
        navigate(`/meetings/${meeting.id}/join`);
      } else {
        navigate(`/meetings/${meeting.id}`);
      }
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors).flat().join(" ") : (err.response?.data?.message || "Unable to create the meeting."));
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">New meeting</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Project → members → schedule. After the call, minutes, decisions, and analytics stay on the meeting.
        </p>
      </div>
      <Stepper step={step} />
      {searchParams.get("google_connected") === "1" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
          Google connected — pick up right where you left off.
        </div>
      )}
      {(selectedSummary.project || selectedSummary.people) && step > 0 && (
        <p className="text-sm text-ink-soft">
          {selectedSummary.project ? <>Project: <span className="font-medium text-ink">{selectedSummary.project}</span></> : "No project"}
          {" · "}
          {selectedSummary.people} participant{selectedSummary.people === 1 ? "" : "s"}
        </p>
      )}

      <Card className="p-6 sm:p-7">
        {step === 0 && (
          <ProjectStep
            selectedId={projectId}
            onSelect={selectProject}
            onCreated={(project) => selectProject(project.id, project)}
          />
        )}
        {step === 1 && (
          <MembersStep
            selectedIds={memberIds}
            onToggle={toggleMember}
            onInvited={(id) => setMemberIds((current) => (current.includes(id) ? current : [...current, id]))}
          />
        )}
        {step === 2 && <MeetingStep form={form} setForm={setForm} googleStatus={googleIntegration.data} connectGoogle={connectGoogle} onConnectGoogle={onConnectGoogle} />}
        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
      </Card>

      <div className="flex items-center justify-between gap-3">
        {step === 0 ? (
          <Button type="button" variant="ghost" onClick={() => navigate("/meetings")}>
            <ArrowLeft className="h-4 w-4" /> Cancel
          </Button>
        ) : (
          <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        )}
        {step < 2 ? (
          <Button type="button" onClick={() => setStep((s) => s + 1)}>
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" onClick={submit} disabled={createMeeting.isPending || !form.title.trim()}>
            <Video className="h-4 w-4" />
            {createMeeting.isPending ? "Scheduling…" : form.create_google_meet ? "Schedule & open Meet" : "Schedule meeting"}
          </Button>
        )}
      </div>
    </div>
  );
}
