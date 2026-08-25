"""LLM analysis routes. Each applies grounding guards to the LLM output so no
item can cite a transcript position that doesn't exist (spec §52)."""

from __future__ import annotations

from fastapi import APIRouter

from app.grounding import drop_ungrounded
from app.schemas.analysis import (
    ActionItemsResponse,
    AgendaCoverageResponse,
    AnalysisRequest,
    DecisionsResponse,
    MomResponse,
    RisksQuestionsResponse,
    SummaryResponse,
    TopicsResponse,
)
from app.services.registry import get_llm_analyzer

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/topics", response_model=TopicsResponse)
async def topics(req: AnalysisRequest) -> TopicsResponse:
    return await get_llm_analyzer().topics(req.context)


@router.post("/summary", response_model=SummaryResponse)
async def summary(req: AnalysisRequest) -> SummaryResponse:
    return await get_llm_analyzer().summary(req.context)


@router.post("/decisions", response_model=DecisionsResponse)
async def decisions(req: AnalysisRequest) -> DecisionsResponse:
    result = await get_llm_analyzer().decisions(req.context)
    result.decisions = drop_ungrounded(result.decisions, req.context.segments)
    return result


@router.post("/action-items", response_model=ActionItemsResponse)
async def action_items(req: AnalysisRequest) -> ActionItemsResponse:
    result = await get_llm_analyzer().action_items(req.context)
    result.action_items = drop_ungrounded(result.action_items, req.context.segments)
    return result


@router.post("/risks-questions", response_model=RisksQuestionsResponse)
async def risks_questions(req: AnalysisRequest) -> RisksQuestionsResponse:
    result = await get_llm_analyzer().risks_questions(req.context)
    result.risks = drop_ungrounded(result.risks, req.context.segments)
    result.questions = drop_ungrounded(result.questions, req.context.segments)
    return result


@router.post("/agenda-coverage", response_model=AgendaCoverageResponse)
async def agenda_coverage(req: AnalysisRequest) -> AgendaCoverageResponse:
    return await get_llm_analyzer().agenda_coverage(req.context)


@router.post("/mom", response_model=MomResponse)
async def minutes(req: AnalysisRequest) -> MomResponse:
    return await get_llm_analyzer().minutes(req.context)
