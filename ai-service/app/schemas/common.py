"""Shared types used across the AI pipeline contracts.

Every extraction the LLM produces is anchored to a transcript timestamp and
carries an explicit confidence label — the grounding guarantees the platform
depends on (spec §52, §53).
"""

from __future__ import annotations

from datetime import date
from enum import Enum

from pydantic import BaseModel, Field, model_validator

# The languages the platform is architected for (spec §18). Detection may return
# others; these are the first-class set for hints and validation messages.
SUPPORTED_LANGUAGES: set[str] = {"en", "ml", "hi", "ta", "te", "kn", "bn"}


class Confidence(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"


class Segment(BaseModel):
    """A single diarized, transcribed span of speech (original language)."""

    index: int = Field(ge=0)
    speaker_label: str | None = None
    start_ms: int = Field(ge=0)
    end_ms: int = Field(ge=0)
    language: str | None = None
    text: str
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)

    @model_validator(mode="after")
    def _end_after_start(self) -> "Segment":
        if self.end_ms < self.start_ms:
            raise ValueError("end_ms must be >= start_ms")
        return self


class ContextSegment(BaseModel):
    """A transcript segment as passed to the analysis endpoints."""

    index: int = Field(ge=0)
    speaker: str | None = None
    start_ms: int = Field(ge=0)
    end_ms: int = Field(ge=0)
    text: str


class SourceRef(BaseModel):
    """A citation back into a meeting's transcript."""

    meeting_id: str
    timestamp_ms: int = Field(ge=0)
    segment_index: int | None = None


class AnalysisContext(BaseModel):
    """Common input for every LLM analysis endpoint.

    The service is stateless: the caller supplies the transcript and metadata,
    and receives structured, grounded output back. Nothing is persisted here.
    """

    meeting_id: str
    output_language: str = "en"
    title: str | None = None
    objective: str | None = None
    agenda: list[str] = Field(default_factory=list)
    participants: list[str] = Field(default_factory=list)
    segments: list[ContextSegment] = Field(min_length=1)
