"""FastAPI application factory for the Meeting AI service.

All pipeline routes are mounted under /v1 and protected by the service token.
Health routes are public. The service is stateless — Laravel owns persistence.
"""

from __future__ import annotations

from fastapi import Depends, FastAPI

from app.config import get_settings
from app.routers import (
    analysis,
    assistant,
    diarization,
    embeddings,
    health,
    language,
    transcription,
    translation,
)
from app.security import require_service_token


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="Meeting AI Intelligence Service",
        version="1.0.0",
        description="Speech-to-text, diarization, translation, grounded LLM extraction, and embeddings.",
    )

    # Public
    app.include_router(health.router)

    # Protected pipeline routes (service-token auth), versioned under /v1.
    protected = [
        transcription.router,
        diarization.router,
        language.router,
        translation.router,
        analysis.router,
        assistant.router,
        embeddings.router,
    ]
    for r in protected:
        app.include_router(r, prefix="/v1", dependencies=[Depends(require_service_token)])

    return app


app = create_app()
