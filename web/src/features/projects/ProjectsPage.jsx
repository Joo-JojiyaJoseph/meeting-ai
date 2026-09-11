import { useState } from "react";
import { Link } from "react-router-dom";
import { FolderKanban, Plus, X, CalendarDays, CheckSquare, Video } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useProjects, useCreateProject } from "./api";

const FILTERS = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "On hold", value: "on_hold" },
  { label: "Completed", value: "completed" },
];

const statusTone = { active: "brand", on_hold: "warning", completed: "success", archived: "neutral" };

function NewProjectForm({ onClose }) {
  const create = useCreateProject();
  const [form, setForm] = useState({ name: "", code: "", description: "" });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    create.mutate(form, { onSuccess: onClose });
  };

  return (
    <Card className="p-5">
      <form onSubmit={submit} className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">New project</h3>
          <button type="button" onClick={onClose} className="focus-ring rounded-lg p-1 text-ink-soft hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <input
          autoFocus
          required
          placeholder="Project name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="focus-ring w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
        />
        <input
          placeholder="Code (optional)"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          className="focus-ring w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
        />
        <textarea
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          className="focus-ring w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
        />
        {create.isError && (
          <p className="text-sm text-rose-600">
            {create.error?.response?.data?.message ?? "Couldn't create the project."}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" disabled={create.isPending}>
            {create.isPending ? "Creating…" : "Create project"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function ProjectsPage() {
  const [filter, setFilter] = useState(0);
  const [showNew, setShowNew] = useState(false);
  const { data, isLoading } = useProjects(FILTERS[filter].value ? { status: FILTERS[filter].value } : {});

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Projects</h1>
          <p className="mt-1 text-sm text-ink-soft">Create a project first, then pick members and schedule a meeting.</p>
        </div>
        <Button size="sm" onClick={() => setShowNew((v) => !v)}>
          <Plus className="h-4 w-4" /> New project
        </Button>
      </div>

      {showNew && <NewProjectForm onClose={() => setShowNew(false)} />}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f, i) => (
          <button
            key={f.label}
            onClick={() => setFilter(i)}
            className={`focus-ring rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === i ? "border-brand-200 bg-brand-50 text-brand-700" : "border-line bg-surface text-ink-soft hover:text-ink"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      ) : data && data.data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((p) => (
            <Card key={p.id} className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: p.color ?? "#8b5cf6" }}
                  />
                  <h3 className="truncate font-display font-semibold text-ink">{p.name}</h3>
                </div>
                <Badge tone={statusTone[p.status] ?? "neutral"}>{p.status}</Badge>
              </div>
              {p.description && <p className="line-clamp-2 text-sm text-ink-soft">{p.description}</p>}
              <div className="mt-auto flex items-center gap-4 pt-2 text-sm text-ink-soft">
                <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {p.meetings_count ?? 0}</span>
                <span className="flex items-center gap-1"><CheckSquare className="h-3.5 w-3.5" /> {p.tasks_count ?? 0}</span>
                {p.owner?.name && <span className="ml-auto truncate">{p.owner.name}</span>}
              </div>
              <Link
                to={`/meetings/new?project=${p.id}`}
                className="focus-ring mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
              >
                <Video className="h-3.5 w-3.5" /> Schedule meeting
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create a project to group meetings and tasks under one initiative."
          action={<Button size="sm" onClick={() => setShowNew(true)}><Plus className="h-4 w-4" /> New project</Button>}
        />
      )}
    </div>
  );
}
