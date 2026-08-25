"""Translation contracts. Originals are never mutated — translations are
returned as a parallel set the platform stores separately (spec §19, §23)."""

from __future__ import annotations

from pydantic import BaseModel, Field


class TranslationItem(BaseModel):
    id: str
    text: str
    source_language: str | None = None


class TranslationRequest(BaseModel):
    target_language: str
    items: list[TranslationItem] = Field(min_length=1)


class TranslatedItem(BaseModel):
    id: str
    target_language: str
    text: str


class TranslationResponse(BaseModel):
    translations: list[TranslatedItem]
    provider: str
