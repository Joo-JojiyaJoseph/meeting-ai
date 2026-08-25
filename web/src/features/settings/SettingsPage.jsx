import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Building2, Plus, X, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Toggle } from "@/components/ui/Toggle";
import {
  useCurrentOrganization,
  useUpdateOrganization,
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "./api";

const TABS = [
  { key: "general", label: "General" },
  { key: "privacy", label: "Privacy & AI" },
  { key: "departments", label: "Departments" },
];

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

const inputClass = "focus-ring w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm";

function GeneralTab({ org }) {
  const update = useUpdateOrganization();
  const [form, setForm] = useState({ name: org.name ?? "", timezone: org.timezone ?? "", default_locale: org.default_locale ?? "" });
  const [saved, setSaved] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    update.mutate({ id: org.id, ...form }, {
      onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000); },
    });
  };

  return (
    <Card className="max-w-lg p-6">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Organization name">
          <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Timezone">
          <input className={inputClass} placeholder="e.g. Asia/Kolkata" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
        </Field>
        <Field label="Default locale">
          <input className={inputClass} placeholder="e.g. en" value={form.default_locale} onChange={(e) => setForm({ ...form, default_locale: e.target.value })} />
        </Field>
        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" size="sm" disabled={update.isPending}>
            {update.isPending ? "Saving…" : "Save changes"}
          </Button>
          {saved && <span className="text-sm text-emerald-600">Saved</span>}
        </div>
      </form>
    </Card>
  );
}

const PRIVACY_FIELDS = [
  { key: "ai_processing_enabled", label: "AI processing", description: "Run the AI pipeline (transcription, summaries, decisions) on processed meetings." },
  { key: "ai_search_enabled", label: "AI search", description: "Let members semantically search across meeting content." },
  { key: "speaker_identification_enabled", label: "Speaker identification", description: "Diarize and label speakers in transcripts." },
];

function PrivacyTab({ org }) {
  const update = useUpdateOrganization();
  const [privacy, setPrivacy] = useState(org.privacy);
  const [retention, setRetention] = useState({
    transcript_retention_days: org.privacy.transcript_retention_days ?? 365,
    recording_retention_days: org.privacy.recording_retention_days ?? 90,
  });

  const toggle = (key) => {
    const next = { ...privacy, [key]: !privacy[key] };
    setPrivacy(next);
    update.mutate({ id: org.id, [key]: next[key] });
  };

  const saveRetention = (e) => {
    e.preventDefault();
    update.mutate({ id: org.id, ...retention });
  };

  return (
    <div className="max-w-lg space-y-5">
      <Card className="divide-y divide-line p-0">
        {PRIVACY_FIELDS.map((f) => (
          <div key={f.key} className="flex items-start justify-between gap-4 p-5">
            <div>
              <p className="font-medium text-ink">{f.label}</p>
              <p className="mt-0.5 text-sm text-ink-soft">{f.description}</p>
            </div>
            <Toggle checked={!!privacy[f.key]} onChange={() => toggle(f.key)} label={f.label} />
          </div>
        ))}
      </Card>

      <Card className="p-6">
        <h3 className="mb-3 font-display font-semibold text-ink">Retention</h3>
        <form onSubmit={saveRetention} className="space-y-4">
          <Field label="Transcript retention (days)">
            <input
              type="number"
              min={1}
              max={3650}
              className={inputClass}
              value={retention.transcript_retention_days}
              onChange={(e) => setRetention({ ...retention, transcript_retention_days: Number(e.target.value) })}
            />
          </Field>
          <Field label="Recording retention (days)">
            <input
              type="number"
              min={1}
              max={3650}
              className={inputClass}
              value={retention.recording_retention_days}
              onChange={(e) => setRetention({ ...retention, recording_retention_days: Number(e.target.value) })}
            />
          </Field>
          <Button type="submit" size="sm" disabled={update.isPending}>
            {update.isPending ? "Saving…" : "Save retention"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function DepartmentForm({ initial, onSubmit, onClose, pending }) {
  const [form, setForm] = useState({ name: initial?.name ?? "", description: initial?.description ?? "" });
  return (
    <Card className="p-5">
      <form
        onSubmit={(e) => { e.preventDefault(); if (form.name.trim()) onSubmit(form); }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">{initial ? "Edit department" : "New department"}</h3>
          <button type="button" onClick={onClose} className="focus-ring rounded-lg p-1 text-ink-soft hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <input
          autoFocus
          required
          placeholder="Department name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputClass}
        />
        <textarea
          placeholder="Description (optional)"
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={inputClass}
        />
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
        </div>
      </form>
    </Card>
  );
}

function DepartmentsTab() {
  const { data, isLoading } = useDepartments();
  const create = useCreateDepartment();
  const update = useUpdateDepartment();
  const remove = useDeleteDepartment();
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setEditing(null); setShowNew((v) => !v); }}>
          <Plus className="h-4 w-4" /> New department
        </Button>
      </div>

      {showNew && (
        <DepartmentForm
          onSubmit={(form) => create.mutate(form, { onSuccess: () => setShowNew(false) })}
          onClose={() => setShowNew(false)}
          pending={create.isPending}
        />
      )}

      {editing && (
        <DepartmentForm
          initial={editing}
          onSubmit={(form) => update.mutate({ id: editing.id, ...form }, { onSuccess: () => setEditing(null) })}
          onClose={() => setEditing(null)}
          pending={update.isPending}
        />
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
        </div>
      ) : data && data.length > 0 ? (
        <Card className="divide-y divide-line">
          {data.map((d) => (
            <div key={d.id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{d.name}</p>
                {d.description && <p className="truncate text-sm text-ink-soft">{d.description}</p>}
                {d.head?.name && <p className="text-xs text-ink-soft">Head: {d.head.name}</p>}
              </div>
              <button
                onClick={() => { setShowNew(false); setEditing(d); }}
                className="focus-ring rounded-lg p-1.5 text-ink-soft hover:bg-canvas hover:text-ink"
                aria-label="Edit department"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => { if (window.confirm(`Delete ${d.name}?`)) remove.mutate(d.id); }}
                className="focus-ring rounded-lg p-1.5 text-ink-soft hover:bg-rose-50 hover:text-rose-600"
                aria-label="Delete department"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </Card>
      ) : (
        <EmptyState
          icon={Building2}
          title="No departments yet"
          description="Departments let you group projects and members by team."
          action={<Button size="sm" onClick={() => setShowNew(true)}><Plus className="h-4 w-4" /> New department</Button>}
        />
      )}
    </div>
  );
}

export function SettingsPage() {
  const [tab, setTab] = useState("general");
  const { data: org, isLoading } = useCurrentOrganization();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-ink-soft">Organization details, AI behavior, and departments.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`focus-ring rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key ? "border-brand-200 bg-brand-50 text-brand-700" : "border-line bg-surface text-ink-soft hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "departments" ? (
        <DepartmentsTab />
      ) : isLoading ? (
        <Skeleton className="h-64 max-w-lg rounded-2xl" />
      ) : org ? (
        tab === "general" ? <GeneralTab org={org} /> : <PrivacyTab org={org} />
      ) : (
        <EmptyState icon={SettingsIcon} title="Couldn't load organization" description="Try refreshing the page." />
      )}
    </div>
  );
}
