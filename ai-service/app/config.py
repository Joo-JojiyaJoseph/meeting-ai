"""Runtime configuration, loaded from environment variables."""

from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="AI_", extra="ignore")

    environment: str = "local"
    service_name: str = "meeting-ai-service"

    # Shared secret required on every non-health request. Laravel sends it as
    # the X-Service-Token header. MUST be set to a strong value in production.
    service_token: str = "change-me"

    # Provider selection. "stub" wires the contracts without calling real models
    # so the service runs end-to-end; swap for real providers as they're built.
    transcription_provider: str = "stub"   # e.g. "whisper"
    diarization_provider: str = "stub"     # e.g. "pyannote"
    language_provider: str = "stub"
    translation_provider: str = "stub"
    llm_provider: str = "stub"             # e.g. "anthropic" / "openai"
    embedding_provider: str = "stub"

    embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536


@lru_cache
def get_settings() -> Settings:
    return Settings()
