import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, X, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useMembers, useInviteMember, useUpdateMember, useRemoveMember } from "./api";

const ROLES = [
  { value: "org_admin", label: "Org admin" },
  { value: "manager", label: "Manager" },
  { value: "meeting_organizer", label: "Meeting organizer" },
  { value: "employee", label: "Employee" },
];

const statusTone = { active: "success", invited: "warning", suspended: "danger" };

function InviteForm({ onClose }) {
  const invite = useInviteMember();
  const [form, setForm] = useState({ email: "", role: "employee" });

  const submit = (e) => {
    e.preventDefault();
    if (!form.email.trim()) return;
    invite.mutate(form, { onSuccess: onClose });
  };

  return (
    <Card className="p-5">
      <form onSubmit={submit} className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">Invite a member</h3>
          <button type="button" onClick={onClose} className="focus-ring rounded-lg p-1 text-ink-soft hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <input
          autoFocus
          required
          type="email"
          placeholder="name@company.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="focus-ring w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="focus-ring w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
        >
          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        {invite.isError && (
          <p className="text-sm text-rose-600">
            {invite.error?.response?.data?.message ?? "Couldn't send the invite."}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" disabled={invite.isPending}>
            {invite.isPending ? "Sending…" : "Send invite"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function MemberRow({ m }) {
  const [open, setOpen] = useState(false);
  const update = useUpdateMember();
  const remove = useRemoveMember();

  return (
    <div className="flex items-center gap-3 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 font-medium text-brand-700">
        {m.name?.[0]?.toUpperCase() ?? "?"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{m.name}</p>
        <p className="truncate text-sm text-ink-soft">{m.email}</p>
      </div>
      {m.role?.name && <Badge tone="brand">{m.role.name}</Badge>}
      {m.status && <Badge tone={statusTone[m.status] ?? "neutral"}>{m.status}</Badge>}
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="focus-ring rounded-lg p-1.5 text-ink-soft hover:bg-canvas hover:text-ink"
          aria-label="Member actions"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {open && (
          <div className="absolute right-0 z-10 mt-1 w-44 rounded-xl border border-line bg-surface py-1 shadow-card">
            {ROLES.map((r) => (
              <button
                key={r.value}
                onClick={() => { update.mutate({ id: m.id, role: r.value }); setOpen(false); }}
                className="block w-full px-3 py-1.5 text-left text-sm text-ink-soft hover:bg-canvas hover:text-ink"
              >
                Make {r.label}
              </button>
            ))}
            <div className="my-1 border-t border-line" />
            <button
              onClick={() => { if (window.confirm(`Remove ${m.name} from the organization?`)) remove.mutate(m.id); setOpen(false); }}
              className="block w-full px-3 py-1.5 text-left text-sm text-rose-600 hover:bg-rose-50"
            >
              Remove member
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function MembersPage() {
  const [showInvite, setShowInvite] = useState(false);
  const navigate = useNavigate();
  const { data, isLoading } = useMembers();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Members</h1>
          <p className="mt-1 text-sm text-ink-soft">Invite teammates, then select them when you create a meeting.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => navigate("/meetings/new")}>
            Schedule meeting
          </Button>
          <Button size="sm" onClick={() => setShowInvite((v) => !v)}>
            <Plus className="h-4 w-4" /> Invite member
          </Button>
        </div>
      </div>

      {showInvite && <InviteForm onClose={() => setShowInvite(false)} />}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
        </div>
      ) : data && data.data.length > 0 ? (
        <Card className="divide-y divide-line">
          {data.data.map((m) => <MemberRow key={m.id} m={m} />)}
        </Card>
      ) : (
        <EmptyState
          icon={Users}
          title="No members yet"
          description="Invite teammates to give them access to this organization."
          action={<Button size="sm" onClick={() => setShowInvite(true)}><Plus className="h-4 w-4" /> Invite member</Button>}
        />
      )}
    </div>
  );
}
