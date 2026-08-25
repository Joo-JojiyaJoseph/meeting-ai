"""Embedding contracts for semantic search / knowledge base (spec §34)."""

from __future__ import annotations

from pydantic import BaseModel, Field


class EmbeddingItem(BaseModel):
    id: str
    text: str


class EmbeddingRequest(BaseModel):
    items: list[EmbeddingItem] = Field(min_length=1)
    model: str | None = None


class EmbeddingVector(BaseModel):
    id: str
    vector: list[float]


class EmbeddingResponse(BaseModel):
    model: str
    dimensions: int
    embeddings: list[EmbeddingVector]
