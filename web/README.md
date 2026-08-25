# MeetingAI — Web (React + JavaScript + Vite)

The SPA client. Talks only to the Laravel API over REST (Sanctum bearer token +
the `X-Organization` header for tenancy). It builds clean with Vite.

## Run

```bash
npm install
cp .env.example .env        # set VITE_API_URL (default http://meeting-ai.test/api)
npm run dev                 # http://localhost:5173
npm run build               # vite build → dist/
```

## Design system (spec §3–5, §59)

Tailwind tokens in `tailwind.config.js` encode the brand exactly:

- **Purple** `#7C3AED` is the primary CTA; **blue** `#2563EB` is secondary
  (links, analytics, info). White cards on a `#F8FAFC` canvas.
- 14–16px radii, soft low-contrast shadows (`shadow-card`), thin `#E2E8F0`
  borders.
- The purple→blue gradient (`bg-ai`) is reserved for AI elements only — the brand
  mark and AI CTAs — never general decoration.
- Typography is a deliberate pairing rather than the default Inter-everywhere:
  **Space Grotesk** for headings and stat numerals (a technical, geometric face
  fitting a meeting-*intelligence* product), **Inter** for body and data.
- Reduced-motion is respected globally (§50); Framer Motion drives only subtle
  entrance transitions.

## Structure

```
src/
├── lib/          api.js (axios + token/org interceptors), queryClient, format
├── stores/       auth.js (Zustand, persisted token + active org; can() checks)
├── types/        api.js (mirrors the Laravel API Resources)
├── components/
│   ├── layout/   Sidebar, Topbar, AppLayout
│   └── ui/       Button, Card, Badge, StatCard, Skeleton, EmptyState, Placeholder
├── features/
│   ├── auth/     LoginPage + hooks (login, /auth/me)
│   ├── dashboard/ DashboardPage + useDashboard  → GET /v1/dashboard
│   └── meetings/  MeetingsPage + useMeetings     → GET /v1/meetings
├── routes/       ProtectedRoute (hydrates session from /auth/me)
└── App.js         router (all §46 routes; unbuilt ones use Placeholder)
```

## How tenancy reaches the API

`stores/auth.js` holds the active organization's ULID; `lib/api.js`'s request
interceptor sends it as `X-Organization` on every call, which is exactly what the
backend's `SetOrganizationContext` middleware reads. Switching org = one store
update, and all subsequent queries are re-scoped.

## What's wired vs. next

Wired end-to-end against the real API: auth/login, session hydration, the
dashboard (stat cards + today's meetings + pending actions), and the meetings
list (with status filters). Every sidebar route resolves — unbuilt pages render a
`Placeholder` so navigation is complete. Next: the create-meeting wizard (§14),
meeting detail tabs (§15), and the transcript/MoM/assistant views.

## Meeting detail + AI processing UI (added)

`MeetingDetailPage` (`/meetings/:id`) renders the tabbed meeting view (§15):
Overview, Transcript, Summary, Decisions, Action Items, MoM. It consumes the new
Laravel read endpoints (`/transcript`, `/summary`, `/decisions`, `/actions`,
`/mom`), each behind a lazily-enabled query hook so a tab only fetches when opened.

`AiProcessingStatus` is the animated pipeline view (§58): it reads
`/processing-status`, which the parent **polls every 3s until terminal**, and
renders each stage as pending/active/done with a failure + retry path.

Grounding surfaces in the UI: extracted decisions/action-items/risks show a
`ConfidenceBadge` and a `SourceRef` timestamp chip (the hook for "jump to
transcript at 00:32:15", §53), and low-confidence due dates are flagged inline
rather than shown as fact.

## AI Assistant page (added)

`/assistant` is a real chat interface (§33) hitting `POST /v1/assistant/ask`.
Answers render with a **Sources** list — each citation is a clickable chip
(timestamp + snippet) that deep-links to the source meeting, surfacing the
grounding all the way to the user. Animated typing indicator while the answer
streams back; suggestion prompts on an empty thread.
