# Meeting AI Service

The stateless Python service that does the heavy AI lifting for the platform:
speech-to-text, speaker diarization, language detection, translation, grounded
LLM extraction, and embeddings. It is called **only** by Laravel's queue workers
over an internal network, authenticated with a shared service token. It persists
nothing — every result flows back to Laravel to store (see `../ARCHITECTURE.md`).

## Run

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env          # set AI_SERVICE_TOKEN
uvicorn app.main:app --reload
pytest                        # 8 tests, all green
```

Interactive docs at `/docs`. Health at `/health` and `/ready` (both public).

## Endpoints (all under `/v1`, service-token required)

Each maps to a stage of the pipeline in spec §21:

| Route | Pipeline stage |
|---|---|
| `POST /transcription` | Speech-to-text |
| `POST /diarization` | Speaker identification |
| `POST /language/detect` | Language detection (code-switching aware) |
| `POST /translation` | Translation (originals never mutated) |
| `POST /analysis/topics` | Topic extraction |
| `POST /analysis/summary` | Executive/detailed summary |
| `POST /analysis/decisions` | Decision extraction |
| `POST /analysis/action-items` | Action-item extraction |
| `POST /analysis/risks-questions` | Risks + open questions |
| `POST /analysis/agenda-coverage` | Was each agenda item discussed? |
| `POST /analysis/mom` | Minutes of Meeting |
| `POST /embeddings` | Vectors for semantic search |

## Grounding (the important part)

The service must never invent meeting content (spec §52). Two mechanisms enforce
this:

1. Every extraction schema carries `source_timestamp_ms` and a `confidence`
   label, so nothing can be asserted without a citation and an uncertainty
   signal.
2. The analysis routes run each LLM result through `app/grounding.py`
   (`drop_ungrounded`), which removes any item whose cited timestamp doesn't fall
   inside a real transcript segment. This is verified by a test that feeds the
   guard a valid item and a hallucinated one and asserts only the valid one
   survives.

## Structure

```
app/
├── main.py          # FastAPI factory; mounts /v1 behind the service token
├── config.py        # env-driven settings (provider selection)
├── security.py      # X-Service-Token dependency
├── grounding.py     # anti-hallucination guards
├── schemas/         # Pydantic v2 contracts (the real deliverable)
├── routers/         # one router per pipeline stage
└── services/        # provider interfaces (base) + stubs + registry
```

## Swapping in real providers

Implementations are selected in `app/services/registry.py` by
`app/config.py` settings. Replace the `Stub*` providers with real ones
(Whisper/faster-whisper for transcription, pyannote for diarization, an LLM API
for analysis, an embedding model) — the routers and contracts don't change. The
stubs return **empty, valid** results and never fabricate content, so the service
is safe to run end-to-end before the real models are wired.
