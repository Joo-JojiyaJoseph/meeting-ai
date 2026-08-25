"""Grounded assistant endpoint. Retrieval + authorization happen in Laravel; this
route only synthesizes an answer from the supplied context and cites it, dropping
any citation that doesn't map to a provided chunk."""

from __future__ import annotations

from fastapi import APIRouter

from app.grounding import filter_citations
from app.schemas.assistant import AssistantRequest, AssistantResponse
from app.services.registry import get_llm_analyzer

router = APIRouter(prefix="/assistant", tags=["assistant"])


@router.post("/answer", response_model=AssistantResponse)
async def answer(req: AssistantRequest) -> AssistantResponse:
    result = await get_llm_analyzer().answer(req)
    allowed = {c.id for c in req.chunks}
    result.citations = filter_citations(result.citations, allowed)
    return result
