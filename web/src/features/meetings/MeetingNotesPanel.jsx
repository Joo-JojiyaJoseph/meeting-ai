import { useState } from "react";
import { NotebookPen, Pencil, Trash2, X, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatTime } from "@/lib/format";
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from "./notes-api";

/**
 * Manual, live "jot a note" panel — deliberately separate from AI-generated
 * output. Saving here never touches Meet artifact polling or AI processing;
 * it's just a fast create/list/edit/delete against meeting_notes.
 */
export function MeetingNotesPanel({ meetingId, compact = false }) {
  const { data, isLoading } = useNotes(meetingId);
  const create = useCreateNote(meetingId);
  const update = useUpdateNote(meetingId);
  const del = useDeleteNote(meetingId);

  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState("");

  const notes = data?.data ?? [];

  const submit = (e) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content) return;
    create.mutate(content, { onSuccess: () => setDraft("") });
  };

  const startEdit = (note) => {
    setEditingId(note.id);
    setEditDraft(note.content);
  };

  const saveEdit = (e) => {
    e.preventDefault();
    const content = editDraft.trim();
    if (!content) return;
    update.mutate({ id: editingId, content }, { onSuccess: () => setEditingId(null) });
  };

  return (
    <Card className={compact ? "p-4" : "p-5"}>
      <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-ink">
        <NotebookPen className="h-4 w-4 text-brand-600" /> Meeting notes
      </h3>

      <form onSubmit={submit} className="space-y-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Jot down something while you're in the meeting…"
          rows={compact ? 2 : 3}
          maxLength={4000}
          className="field w-full resize-none text-sm"
        />
        <div className="flex items-center justify-between">
          {create.isError ? (
            <p className="text-xs text-rose-600">Unable to save note. Please try again.</p>
          ) : (
            <span />
          )}
          <Button type="submit" size="sm" disabled={create.isPending || !draft.trim()}>
            {create.isPending ? "Saving…" : "Add note"}
          </Button>
        </div>
      </form>

      <div className="mt-4 space-y-2.5">
        {isLoading && <Skeleton className="h-16 rounded-xl" />}
        {!isLoading && notes.length === 0 && (
          <p className="rounded-xl border border-dashed border-line bg-canvas px-3 py-4 text-center text-sm text-ink-soft">
            No notes yet — jot down anything worth remembering.
          </p>
        )}
        {notes.map((note) =>
          editingId === note.id ? (
            <form key={note.id} onSubmit={saveEdit} className="space-y-2 rounded-xl border border-brand-200 bg-ai-soft p-2.5">
              <textarea
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                rows={2}
                maxLength={4000}
                autoFocus
                className="field w-full resize-none text-sm"
              />
              <div className="flex justify-end gap-1.5">
                <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                  <X className="h-3.5 w-3.5" /> Cancel
                </Button>
                <Button type="submit" size="sm" disabled={update.isPending || !editDraft.trim()}>
                  <Check className="h-3.5 w-3.5" /> Save
                </Button>
              </div>
            </form>
          ) : (
            <div key={note.id} className="group rounded-xl border border-line/70 bg-canvas px-3 py-2.5">
              <p className="whitespace-pre-wrap text-sm text-ink">{note.content}</p>
              <div className="mt-1.5 flex items-center justify-between">
                <p className="text-xs text-ink-soft">
                  {note.author} · {formatTime(note.created_at)}
                </p>
                {note.is_mine && (
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button type="button" onClick={() => startEdit(note)} className="focus-ring rounded-lg p-1 text-ink-soft hover:bg-slate-100 hover:text-ink">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => del.mutate(note.id)} className="focus-ring rounded-lg p-1 text-ink-soft hover:bg-rose-50 hover:text-rose-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ),
        )}
      </div>
    </Card>
  );
}
