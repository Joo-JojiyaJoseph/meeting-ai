"""Conversational assistant + semantic-search answer contracts (spec §33, §34).

The service is given a question and the *already-retrieved, already-authorized*
context chunks (Laravel does retrieval + access control). Its only job is to
synthesize a grounded answer and cite which chunks it used. It must never answer
from outside the provided context.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class RetrievedChunk(BaseModel):
    id: str
    meeting_id: str
    content: str
    source_timestamp_ms: int | None = Field(default=None, ge=0)


class AssistantRequest(BaseModel):
    question: str
    output_language: str = "en"
    # May be empty — in which case the assistant must say it has no information
    # rather than answer from general knowledge.
    chunks: list[RetrievedChunk] = Field(default_factory=list)


class Citation(BaseModel):
    chunk_id: str
    meeting_id: str
    source_timestamp_ms: int | None = None
    snippet: str


class AssistantResponse(BaseModel):
    answer: str
    citations: list[Citation] = Field(default_factory=list)
    used_context: bool = False
    provider: str
