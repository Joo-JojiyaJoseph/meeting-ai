import { useState } from "react";
import { Link } from "react-router-dom";
import { Search as SearchIcon, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { EmptySearchIllustration } from "@/components/illustrations/EmptyIllustrations";
import { SourceRef } from "@/components/ui/SourceRef";
import { useSemanticSearch } from "./api";

export function SearchPage() {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const search = useSemanticSearch();

  const submit = (e) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    setSubmitted(query);
    search.mutate({ q: query });
  };

  const disabled = search.isError && search.error?.response?.status === 403;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">AI Search</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Semantic search across every meeting you have access to — grounded, with a source and timestamp for every hit.
        </p>
      </div>

      <form onSubmit={submit} className="relative">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="What did we decide about the Q3 roadmap?"
          className="focus-ring w-full rounded-2xl border border-white/60 bg-white/60 py-3 pl-10 pr-4 text-sm shadow-glass"
        />
      </form>

      {disabled ? (
        <EmptyState
          icon={Sparkles}
          title="AI search is off for this organization"
          description="An org admin can turn on semantic search in organization settings."
        />
      ) : search.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : search.data ? (
        search.data.length > 0 ? (
          <div className="space-y-3">
            {search.data.map((hit) => (
              <Card key={hit.chunk_id} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    to={`/meetings/${hit.meeting_id}`}
                    className="focus-ring truncate font-medium text-ink hover:text-brand-700"
                  >
                    {hit.meeting_title ?? "Untitled meeting"}
                  </Link>
                  <Badge tone="brand">{Math.round(hit.score * 100)}% match</Badge>
                </div>
                <p className="mt-2 text-sm text-ink-soft">{hit.snippet}</p>
                {hit.source_timestamp_ms !== null && (
                  <div className="mt-2">
                    <SourceRef
                      timestampMs={hit.source_timestamp_ms}
                      onJump={() => { window.location.href = `/meetings/${hit.meeting_id}`; }}
                    />
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={SearchIcon}
            illustration={EmptySearchIllustration}
            title="No matches"
            description={`Nothing found for "${submitted}". Try different wording.`}
          />
        )
      ) : (
        <EmptyState
          icon={Sparkles}
          title="Search your meetings"
          description="Ask a question or describe what you're looking for — results are grounded in real transcripts, never invented."
        />
      )}
    </div>
  );
}
