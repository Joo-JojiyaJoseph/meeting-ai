"""Speech-to-text contracts (pipeline stage: TRANSCRIBING)."""

from __future__ import annotations

from pydantic import BaseModel, Field

from .common import Segment


class TranscriptionRequest(BaseModel):
    meeting_id: str
    audio_url: str = Field(description="Signed URL or storage reference to the audio/recording")
    mime_type: str | None = None
    primary_language: str | None = Field(default=None, description="Hint; omit for auto-detect")
    language_hints: list[str] = Field(default_factory=list)
    enable_diarization: bool = True
    model: str | None = None


class TranscriptionResponse(BaseModel):
    segments: list[Segment]
    detected_languages: list[str] = Field(default_factory=list)
    primary_language: str | None = None
    word_count: int = 0
    duration_ms: int = 0
    provider: str
