# Models & Tenancy Layer

This drop contains the Eloquent models (31), PHP enums (9), and the multi-tenancy
machinery that enforces organization isolation. It sits on top of the migrations
in `database/migrations/`.

## What's here

```
app/
├── Enums/                     # State machines as backed enums (cast on models)
├── Models/
│   ├── Concerns/
│   │   ├── BelongsToOrganization.php   # global org scope + auto-fill org_id
│   │   └── HasUlid.php                 # public ULID + route binding
│   └── *.php                            # 31 domain models, all relationships wired
├── Scopes/OrganizationScope.php
├── Support/OrganizationContext.php      # request-lifetime "current org" (singleton)
├── Http/Middleware/SetOrganizationContext.php
└── Providers/TenancyServiceProvider.php
```

## How tenancy works

1. After auth, `SetOrganizationContext` middleware resolves the user's active org
   (from the `X-Organization` header — a validated ULID — or their first active
   membership) and stores it on the `OrganizationContext` singleton.
2. Every model that carries `organization_id` uses `BelongsToOrganization`, which
   (a) adds a global scope filtering to the current org, and (b) auto-fills
   `organization_id` on create. Application code never sets it manually.
3. Child records (segments, decisions, participants, …) inherit isolation through
   their parent meeting, so they don't need the trait.
4. `Role`/`Permission` are intentionally NOT auto-scoped — they include
   cross-tenant system rows (e.g. the `super_admin` role) that the scope would
   otherwise hide.

Cross-tenant queries (super-admin tooling, reporting) use
`Model::withoutGlobalScope(OrganizationScope::class)`.

## Required wiring (3 steps)

1. **Delete Laravel's default users migration.** `create_users_table.php` in this
   drop supersedes `0001_01_01_000000_create_users_table.php`.

2. **Register the service provider.** In `bootstrap/providers.php`:
   ```php
   return [
       App\Providers\AppServiceProvider::class,
       App\Providers\TenancyServiceProvider::class,
   ];
   ```

3. **Register the middleware** on the API group. In `bootstrap/app.php`:
   ```php
   ->withMiddleware(function (Middleware $middleware) {
       $middleware->api(append: [
           App\Http\Middleware\SetOrganizationContext::class,
       ]);
   })
   ```
   (It must run after Sanctum auth so `$request->user()` is populated.)

## Google Calendar / Meet integration (Milestone 3)

Closes the schedule → Meet → artifact → pipeline loop. Requires
`composer require google/apiclient:^2.15` and the Google credentials block in
`config/services.php`.

- **`GoogleClientFactory`** builds an authenticated client from a stored
  `GoogleAccount`, refreshing (and persisting) the access token when expired.
- **`GoogleCalendarService`** creates a calendar event with an attached Meet
  conference and returns `google_event_id` / `google_meet_id` / `meet_url` /
  `calendar_event_url` to store on the meeting; also update + delete.
- **Jobs** wire the seams: `ScheduleGoogleEvent` (dispatched from
  `CreateMeeting` when `create_google_meet` is set), `UpdateGoogleEvent` (on
  reschedule/retitle), `CancelGoogleEvent` (on cancel).
- **`GoogleMeetArtifactService` + `SyncMeetingArtifacts`** discover Meet
  recordings/transcripts and register them as artifacts, then fire
  `MeetingArtifactReady` — which feeds straight into the AI pipeline.
  `PollMeetingArtifacts` (scheduled every 15 min in `routes/console.php`) drives
  this for recently-ended meetings.
- **`GET/DELETE /v1/integrations/google`** report connection status and
  disconnect; the OAuth connect flow is the existing `auth/google/*` routes,
  now requesting Meet + Drive read scopes.

**Validation caveat (read this):** the Calendar/Meet *event creation* uses the
stable, well-documented API. The Meet *artifact discovery*
(`GoogleMeetArtifactService::discover`) depends on Google Workspace (Business
Standard+), admin-enabled recording/transcription, the Meet REST API, and the
right scopes — and its exact response mapping should be verified against a live
Workspace account. Personal `@gmail.com` accounts can't record at all. The
**manual-upload path** (`POST /meetings/{id}/artifacts`) is the reliable
fallback and drives the identical pipeline with no Google dependency.

## AI processing pipeline (Laravel ↔ Python service)

The pipeline from spec §21/§45 runs as a **Bus chain** of queued jobs
(`app/Jobs/Pipeline/`), each calling the Python AI service via
`App\Services\AI\AiClient` and persisting grounded results:

```
ProcessMeeting (action)  →  Bus::chain on the "ai" queue:
  TranscribeMeetingJob      → transcript + segments + speakers (+ participation stats)
  ExtractTopicsJob
  GenerateSummaryJob        → meeting_summaries
  ExtractDecisionsJob       → decisions (source_timestamp_ms + confidence kept)
  ExtractActionItemsJob     → action items (status=suggested, for review)
  ExtractRisksQuestionsJob
  AnalyzeAgendaCoverageJob  → marks agenda items discussed/partial/not
  GenerateMomJob            → MoM draft (status=ai_generated) + version 1
  EmbedMeetingJob           → knowledge_chunks + embeddings (tenant + meeting scoped)
  FinalizeMeetingJob        → COMPLETED
```

Design points:

- **Jobs carry the meeting id, not the model**, and re-load it without global
  scopes inside `PipelineJob::handle`, then establish the org context so
  tenant-scoped writes (embeddings, chunks) resolve. Avoids serialization/scope
  surprises.
- **Each job sets `ai_processing_status`** for the live UI (§22, §58), and
  `failed()` flips the meeting to `FAILED` — a chain stops on first failure, so
  processing is resumable, not silently half-done.
- **Grounding survives persistence:** `source_timestamp_ms` and `ai_confidence`
  from the AI service are written straight onto decisions/action-items/risks, and
  the AI service has already dropped any item citing a non-existent segment.
- **Idempotent:** re-running clears prior AI-generated rows (keeping
  human-confirmed decisions) before inserting.

### Endpoints

- `POST /meetings/{meeting}/artifacts` — register a recording/transcript
  (Google Drive ref or uploaded path); fires `MeetingArtifactReady`, which the
  `StartMeetingProcessing` listener turns into a `ProcessMeeting` dispatch.
- `POST /meetings/{meeting}/process` — (re)trigger the pipeline.
- `GET  /meetings/{meeting}/processing-status` — status + per-stage booleans.

### Setup

```bash
# config/ai.php reads these:
AI_SERVICE_URL=http://ai-service:8000
AI_SERVICE_TOKEN=<same token the Python service expects>
AI_QUEUE=ai

php artisan queue:work database --queue=ai   # run the pipeline workers
```

The `StartMeetingProcessing` listener is auto-discovered (Laravel 11 registers
listeners by their `handle()` type-hint). On PostgreSQL, copy each embedding's
`vector_json` into the real `pgvector` column via a raw upsert (see
`../ARCHITECTURE.md` → Vector search); the JSON is the portable fallback.

## Milestone 1 API (auth + organizations + members)

Routes live in `routes/api.php` under `/api/v1`. Protected routes run
`auth:sanctum` then `SetOrganizationContext`, so the current org (and its global
scope) is established before any controller executes. The SPA selects its active
org with the `X-Organization: <org-ulid>` header.

Public:
- `POST /auth/register`, `POST /auth/login`
- `POST /auth/forgot-password`, `POST /auth/reset-password`
- `GET  /auth/google/redirect`, `GET /auth/google/callback`
- `GET  /auth/email/verify/{id}/{hash}` (signed)

Authenticated:
- `GET  /auth/me` — user + current org + org list + resolved permission slugs
- `POST /auth/logout`, `POST /auth/email/resend`
- `GET/PATCH /profile`, `POST /profile/change-password`
- `GET/POST /organizations`, `GET /organizations/current`, `PATCH /organizations/{organization}`
- `GET/POST /members`, `PATCH/DELETE /members/{user}`

Business logic sits in `app/Actions/` (the service layer — controllers stay
thin). `CreateOrganization` is the key one: in a single transaction it creates
the tenant, calls `RoleSeeder::seedForOrganization()`, and attaches the creator
as `org_admin`. This is exactly the create-org hook the RBAC layer needed.

## Milestone 2 API (dashboard + projects + meetings)

- `GET /dashboard` — the §9 stat cards (meetings today/upcoming/this month,
  pending & overdue action items, decisions, AI-processed) plus today's meetings
  and pending tasks. Aggregation lives in `App\Services\DashboardService`.
- `apiResource /projects` — full CRUD, with `meetings_count`/`tasks_count`.
- `apiResource /departments` (no show) — CRUD with department head.
- Meetings:
  - `GET /meetings` — filterable by `status`, `language`, `project_id`,
    `department_id`, `organizer_id`, `participant_id`, `from`/`to`, and free-text
    `q` (title, project name, participant name/guest). Paginated.
  - `POST /meetings` — via `CreateMeeting` action: meeting + participants +
    agenda in one transaction, organizer auto-added as a participant. The
    `create_google_meet` flag is accepted and leaves a documented seam for the
    Milestone 3 `ScheduleGoogleEvent` job.
  - `GET/PATCH/DELETE /meetings/{meeting}`, `POST /meetings/{meeting}/cancel`.
  - `.../participants` (list/add/remove) and `.../agenda` (list/add/update/
    delete/reorder). Child ids are always resolved *within* the bound meeting, so
    they can't be used to reach another meeting's rows.

All meeting reads/writes authorize through `MeetingPolicy`, so the visibility
tiers and organizer powers from Milestone 1.5 apply automatically. Public ULIDs
are used throughout the API; controllers/actions resolve them to internal ids.

## Runtime dependencies & setup (Sanctum, Socialite, Google)

```bash
composer require laravel/sanctum laravel/socialite
php artisan install:api        # publishes Sanctum, adds personal_access_tokens
```

Add Google credentials to `config/services.php`:
```php
'google' => [
    'client_id' => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect' => env('GOOGLE_REDIRECT_URI'),
],
```
and configure `SANCTUM_STATEFUL_DOMAINS` / CORS for your SPA origin. Google
access + refresh tokens are stored encrypted on `google_accounts` and never
returned to the client.

## Conventions

- **Mass assignment:** models use `$guarded` to block `id`, `ulid`,
  `organization_id`, and (on `User`) `is_super_admin`. Form Requests are the real
  validation boundary — never pass raw request input to `create()`/`update()`
  without one.
- **Google tokens** on `GoogleAccount` use the `encrypted` cast and are hidden
  from serialization — they never reach the client.
- **"Overdue"** is derived, never stored: `Task::overdue()` scope + `isOverdue()`.
- **Enums** back the meaningful status fields; other string columns (e.g.
  `response_status`) stay strings and are documented in their migrations.

## Authorization (seeders + policies)

The permission catalogue and roles live in `database/seeders/`, and enforcement
lives in `app/Policies/`.

- **`PermissionSeeder`** — 45 permissions across 16 domain groups. Idempotent.
- **`RoleSeeder`** — seeds the system `super_admin` role on `run()`, and exposes
  `seedForOrganization(Organization $org)` which creates the four org-scoped
  roles (`org_admin`, `manager`, `meeting_organizer`, `employee`) with their
  permission sets. **Call `seedForOrganization` from your create-organization
  flow** (an `Organization` observer or a `CreateOrganizationAction`) so every
  new tenant gets its roles automatically.
- **Policies** — `Meeting`, `MinutesOfMeeting`, `MeetingDecision`, `Task`,
  `Project`. Laravel 11+ auto-discovers them by naming convention
  (`App\Policies\{Model}Policy`), so no manual registration is needed. Each has a
  `before()` hook granting super admins everything.

The `MeetingPolicy` is where the interesting access logic lives: organizers and
explicit participants always have access; beyond that, only
`organization`-visible meetings are open to the wider org, while `private` and
`confidential` meetings stay restricted (spec §40). Organizer powers (update,
approve MoM, manage participants) are granted *relationally* on meetings the user
organizes, on top of any role they hold.

Run `php artisan db:seed` to load permissions + the super_admin role.

## RBAC note

`User::hasPermission($slug, $organization)` resolves the user's role in the org
and checks its permissions. This hand-rolled RBAC is intentionally compatible
with `spatie/laravel-permission` (teams = organizations) if you'd prefer to swap
it in. Either way, authorize through Policies calling `hasPermission`, not role
names.

## Meeting intelligence read API (added)

`MeetingIntelligenceController` exposes what the pipeline produced, all behind
the `MeetingPolicy`:

- `GET /meetings/{meeting}/transcript` — paginated segments + speakers + meta
  (authorizes `viewTranscript`).
- `GET /meetings/{meeting}/summary` — summary + topics + risks + open questions (§23).
- `GET /meetings/{meeting}/decisions`, `/actions`, `/mom`.

These close the loop the pipeline opened: intelligence is now both produced
(jobs) and consumed (API → SPA), with `source_timestamp_ms` and `ai_confidence`
carried through to the client for grounded citations.

## AI Assistant + semantic search (Milestones 9–10)

The headline capability: ask questions grounded in meeting data, with citations.

- **`SemanticSearchService`** embeds the query (via the AI service), then ranks
  `knowledge_chunks` by vector similarity — pgvector cosine on PostgreSQL, a PHP
  cosine fallback otherwise.
- **Authorization is first, not last.** `AuthorizedMeetings::idsFor($user)`
  resolves the meetings the user may read (organizer/participant always;
  org-visible only with `meetings.view`; private/confidential stay restricted),
  and retrieval is filtered to that set *before* similarity ranking. The AI can
  never surface a meeting the user can't open (§40).
- **`POST /v1/assistant/ask`** → retrieve authorized chunks → AI service
  synthesizes a grounded answer → returns `answer` + `citations` (each resolving
  to a meeting ULID + timestamp for deep-linking, §33). Optional `meeting_id`
  scopes to one meeting (authorized first).
- **`POST /v1/search`** → ranked chunks with snippets + source timestamps, no LLM
  synthesis (§34).
- Both respect the org's `ai_search_enabled` toggle (§41).

The AI service `/v1/assistant/answer` route drops any citation that doesn't map
to a provided chunk (verified by test), so the model can only cite context it was
actually given — grounding enforced on both sides of the boundary.

## MoM workflow + export + email (Milestone 8, §27–30)

`MomController` owns the full minutes lifecycle:

- **Edit** (`PATCH .../mom`) — replaces structured `content`, snapshots a new
  `mom_versions` row, moves `ai_generated` → `draft`.
- **Regenerate a section** (`POST .../mom/regenerate`) — re-runs the AI for one
  section (executive summary, discussions, decisions, action items, next steps)
  and versions it.
- **Approval gate** — `approve` / `reject` (perm `mom.approve` or organizer) →
  `publish` (perm `mom.distribute`). Publishing requires prior approval;
  emailing requires approved/published status. Enforced in the controller, not
  just the UI.
- **Export** — `GET .../mom/export/pdf` (dompdf + a branded corporate Blade
  template in `resources/views/mom/pdf.blade.php`) and `.../export/docx`
  (PhpWord), both streamed downloads.
- **Email** (`POST .../mom/email`) — a Markdown `MinutesOfMeetingMail` to the
  participants (or explicit recipients), optional PDF attachment.

Requires `composer require barryvdh/laravel-dompdf phpoffice/phpword`. The PDF
template uses the brand palette and the §26 section order. The frontend MoM tab
renders the structured content with Approve / Publish / PDF / DOCX actions.

## Analytics (§36)

`GET /v1/analytics` (perm `analytics.view`) returns six org-level datasets via
`AnalyticsService`: meetings/month, meeting-hours/month, meetings-by-department,
action-item completion, decisions/month, and language usage. Time series use a
portable fixed 12-month window (grouped in PHP, DB-agnostic); categorical cuts
use indexed `groupBy`. All tenant-scoped through the global scope.

Deliberately aggregate and descriptive — **never per-employee performance
scoring** (§36/§37). The frontend `/analytics` page renders these with Recharts
in the brand palette, and is lazily code-split so Recharts stays out of the
initial bundle.

## Task module + action-item conversion (§25, §31)

Closes the dangling flow where the pipeline produced "suggested" action items
with no way to act on them (Definition-of-Done step 21).

- **`ConvertActionItemToTask`** (service action) turns a suggested item into a
  tracked `Task` in one transaction, carrying the link (`tasks.action_item_id`),
  meeting, and transcript timestamp; marks the item `converted`; idempotent.
- **`POST /meetings/{meeting}/actions/{item}/accept`** (optional field overrides),
  `.../reject`, and `PATCH .../actions/{item}` to edit before accepting — all
  gated on organizer or `action_items.manage`.
- **Tasks API** — `apiResource /tasks` with filters (status, priority, mine,
  overdue, assignee, project), completion timestamping, and assignment gated on
  `tasks.assign`; plus task comments. Authorized via the existing `TaskPolicy`
  (assignee/creator can always update their own).
- **Frontend:** a real Tasks page (checkbox completion, filters) and Accept/
  Dismiss buttons on the meeting's Action Items tab.
