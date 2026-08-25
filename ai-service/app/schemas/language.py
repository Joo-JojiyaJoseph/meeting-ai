"""Language detection contracts (supports code-switching, spec §18)."""

from __future__ import annotations

from pydantic import BaseModel, Field


class TextItem(BaseModel):
    id: str
    text: str


class LanguageDetectionRequest(BaseModel):
    items: list[TextItem] = Field(min_length=1)


class LanguageResult(BaseModel):
    id: str
    language: str
    confidence: float = Field(ge=0.0, le=1.0)
    is_code_switched: bool = False
    secondary_languages: list[str] = Field(default_factory=list)


class LanguageDetectionResponse(BaseModel):
    results: list[LanguageResult]
    provider: str
