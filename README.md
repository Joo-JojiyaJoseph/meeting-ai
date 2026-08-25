# MeetingAI — AI Meeting Intelligence Platform

Google Meet + Google Calendar + multilingual AI → transcripts, summaries,
decisions, action items, tasks, Minutes of Meeting, and a grounded AI assistant
over your organization's meeting knowledge.

Three services, run directly on your machine — **no Docker, no Redis**:

| Service | Path | Stack | Role |
|---|---|---|---|
| **API** | `/` (Laravel root) | Laravel 12 / PHP 8.3 | System of record: auth, tenancy, RBAC, meetings, Google integration, orchestrates the AI pipeline |
| **AI service** | `ai-service/` | FastAPI / Python 3.12 | Stateless: transcription, diarization, translation, grounded LLM extraction, embeddings |
| **Web** | `web/` | React 18 / TypeScript / Vite | SPA client of the API only |

The only piece of infrastructure you need is **PostgreSQL** (with the `vector`
extension for semantic search). Queue, cache, and sessions all run on Laravel's
zero-additional-infra `database`/`file` drivers — see "Why no Redis?" below.

See `ARCHITECTURE.md` for the full design record (data model, tenancy, grounding
guarantees, the Google Meet artifact caveat). Each service also has its own
README with service-specific detail (`app/README.md` covers the whole Laravel
app; `ai-service/README.md`; `web/README.md`).

---

## Prerequisites

- PHP 8.3+ with the `pgsql`, `redis`-free standard extensions, and Composer
- PostgreSQL 16+ with the `pgvector` extension available
- Python 3.12+
- Node.js 20+ and npm

Install pgvector (once, on your Postgres server):

```bash
# Debian/Ubuntu
sudo apt install postgresql-16-pgvector

# macOS (Homebrew)
brew install pgvector

# Or build from source: https://github.com/pgvector/pgvector
```

Then create the database:

```bash
createdb meeting_ai
psql meeting_ai -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

## Setup — four terminals

**1. Configure and migrate the API**

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed          # permission catalogue + system roles
```

Edit `.env`: set `DB_*` to match your Postgres instance, and generate a long
random `AI_SERVICE_TOKEN` — you'll paste the *same* value into the AI service's
`.env` in the next step (they must match exactly).

**2. Configure the AI service**

```bash
cd ai-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env         # set AI_SERVICE_TOKEN to the SAME value as the API's .env
```

**3. Configure the web app**

```bash
cd web
npm install
cp .env.example .env         # VITE_API_URL=http://meeting-ai.test/api
```

**4. Run all four processes** (each in its own terminal, from the project root
unless noted):

```bash
# Terminal 1 — API
php artisan serve                                    # http://meeting-ai.test

# Terminal 2 — queue worker (runs the AI pipeline job chain)
php artisan queue:work database --queue=ai,default

# Terminal 3 — AI service
cd ai-service && source .venv/bin/activate
uvicorn app.main:app --reload --port 8001            # http://localhost:8001

# Terminal 4 — web app
cd web && npm run dev                                 # http://localhost:5173
```

Open **http://localhost:5173**. Register, create an organization, and you're in.

### Optional: the scheduler

`PollMeetingArtifacts` (discovers Meet recordings every 15 minutes) needs
Laravel's scheduler running. For local development, the simplest option is a
loop in a fifth terminal:

```bash
while true; do php artisan schedule:run; sleep 60; done
```

In production, use a real cron entry instead:

```cron
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```

## Why no Redis?

The architecture's one hard rule is that AI work must never run inline in a web
request — it always goes through a queue (see `ARCHITECTURE.md` → "AI processing
pipeline"). Redis is the common choice for that queue, but it's not the only
one: Laravel ships a `database` queue driver that gives the same asynchronous
guarantee using a `jobs` table instead of a separate service. This deployment
uses that, plus the `file` driver for cache and sessions — so the entire stack
needs only Postgres as infrastructure. If you later need Redis-grade throughput,
it's a config change (`QUEUE_CONNECTION=redis` + adding the `predis/predis`
package), not a code change — every job already goes through Laravel's queue
abstraction.

## What's real vs. stubbed out of the box

- **Everything runs and is internally consistent** — see the validation summary
  below.
- **The Python AI service ships with safe stub providers** (`ai-service/app/services/stub.py`):
  it returns empty, valid results rather than fabricating meeting content, so
  the full pipeline runs end-to-end with no external AI dependency. Swap in
  real providers (Whisper, pyannote, an LLM API, an embedding model) via
  `ai-service/app/services/registry.py` — the contracts don't change.
- **Google Calendar/Meet event creation** is real and uses the stable Google
  API. **Meet artifact discovery** (pulling recordings/transcripts) depends on
  Google Workspace with admin-enabled recording — see
  `app/README.md` → "Google Calendar / Meet integration" for the exact
  requirements and the manual-upload fallback that doesn't need any of it.
- **MoM PDF/DOCX export** needs `barryvdh/laravel-dompdf` and `phpoffice/phpword`
  (both in `composer.json`) — installed automatically by `composer install`.

## Validation status

This codebase was built with continuous verification rather than written once
and left untested:

- **Laravel**: 210 PHP files, all pass `php -l`; every `use App\...` import and
  every route `[Controller, method]` pair verified to resolve via a structural
  script (catches a class of bug `php -l` can't — typo'd imports, dangling
  route references).
- **AI service**: 33 Python files; **11 automated tests pass** (`pytest`),
  including a test that verifies the grounding guard actually strips a
  fabricated citation — not just that the endpoint responds.
- **Web**: 41 TypeScript/TSX files; **strict-mode typecheck passes clean** and
  **`vite build` succeeds**, producing a code-split bundle (~145KB gzip main
  chunk; Recharts/analytics deferred to its own chunk).
- **Known gap**: there is no Laravel PHPUnit/Pest test suite yet — see
  "Pending work" below. Lint + structural checks catch a real class of bugs
  (and did, several times during development) but are not a substitute for
  behavioral tests.

## Pending work

Honest accounting of what's *not* done, roughly in priority order:

1. **Laravel test suite** — zero feature/unit tests. Biggest quality gap.
2. **Notifications (§38)** — the table/model exist; no notification classes or
   sending logic yet.
3. **Audit logging (§42)** — table/model exist; nothing writes to it.
4. **Decision management** — read-only; no edit/approve/reject/link-to-task.
5. **MoM rich-text editor** — the workflow (approve/publish/export/email) is
   real; the editor itself is a structured read view, not an editable canvas.
6. **Create-meeting wizard UI** — the backend endpoint is complete; the
   multi-step frontend form doesn't exist yet (the "New meeting" button is
   inert).
7. Frontend placeholders still empty: Projects, Decisions, AI Search (as a
   dedicated page — search exists as an API and is used by the assistant),
   Members, Settings.
8. Demo/seed data (§56) beyond the RBAC seeders.
9. Speaker mapping UI, on-demand translation UI, recurring-meeting expansion.

## Repository layout

```
.
├── .env.example                                      # API environment template
├── composer.json                                     # Laravel dependencies
├── app/                                               # Laravel application code
│   ├── Models/, Enums/, Scopes/, Support/            # data layer + tenancy
│   ├── Policies/                                      # authorization
│   ├── Http/Controllers/Api/V1/, Requests/, Resources/
│   ├── Actions/, Services/                            # business logic (service layer)
│   ├── Jobs/Pipeline/, Jobs/Google/                   # queued work
│   └── README.md                                      # full Laravel-side documentation
├── database/migrations/, seeders/
├── routes/api.php, console.php
├── resources/views/mom/, emails/                      # PDF + email templates
├── ai-service/                                        # Python FastAPI service
│   ├── app/schemas/, routers/, services/
│   ├── tests/
│   └── README.md
├── web/                                                # React SPA
│   ├── src/features/, components/, stores/, lib/
│   └── README.md
└── ARCHITECTURE.md                                     # system design record
```
