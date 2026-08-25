"""Liveness/readiness — the only unauthenticated routes."""

from __future__ import annotations

from fastapi import APIRouter

from app.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@router.get("/ready")
async def ready() -> dict:
    s = get_settings()
    return {
        "status": "ready",
        "service": s.service_name,
        "environment": s.environment,
        "providers": {
            "transcription": s.transcription_provider,
            "diarization": s.diarization_provider,
            "language": s.language_provider,
            "translation": s.translation_provider,
            "llm": s.llm_provider,
            "embedding": s.embedding_provider,
        },
    }
