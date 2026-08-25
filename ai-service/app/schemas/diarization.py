"""Speaker diarization contracts (pipeline stage: IDENTIFYING_SPEAKERS)."""

from __future__ import annotations

from pydantic import BaseModel, Field


class DiarizationRequest(BaseModel):
    meeting_id: str
    audio_url: str
    expected_speakers: int | None = Field(default=None, ge=1)


class SpeakerSpan(BaseModel):
    start_ms: int = Field(ge=0)
    end_ms: int = Field(ge=0)
    speaker_label: str


class DiarizedSpeaker(BaseModel):
    label: str
    total_speaking_ms: int = 0
    segment_count: int = 0


class DiarizationResponse(BaseModel):
    speakers: list[DiarizedSpeaker] = Field(default_factory=list)
    spans: list[SpeakerSpan] = Field(default_factory=list)
    provider: str
