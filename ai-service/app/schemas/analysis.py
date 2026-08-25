"""LLM analysis contracts (pipeline stages: ANALYZING → GENERATING_MOM).

These are the grounded-extraction outputs. Every item that asserts something
happened in the meeting carries a source_timestamp_ms and a confidence label so
the platform can render citations and flag uncertainty rather than presenting
fabrications as fact (spec §52, §53).
"""

from __future__ import annotations

from datetime import date
from typing import Literal

from pydantic import BaseModel, Field

from .common import AnalysisContext, Confidence, Priority

# ---- Requests: every analysis endpoint takes the same context ----------------


class AnalysisRequest(BaseModel):
    context: AnalysisContext


# ---- Topics ------------------------------------------------------------------


class Topic(BaseModel):
    title: str
    description: str | None = None
    start_ms: int | None = Field(default=None, ge=0)
    end_ms: int | None = Field(default=None, ge=0)


class TopicsResponse(BaseModel):
    topics: list[Topic] = Field(default_factory=list)
    provider: str


# ---- Summary -----------------------------------------------------------------


class SummaryResponse(BaseModel):
    executive_summary: list[str] = Field(default_factory=list, description="5-8 bullets (spec §23)")
    detailed_summary: str | None = None
    key_points: list[str] = Field(default_factory=list)
    next_steps: list[str] = Field(default_factory=list)
    language: str = "en"
    provider: str


# ---- Decisions ---------------------------------------------------------------


class ExtractedDecision(BaseModel):
    topic: str | None = None
    decision: str
    context: str | None = None
    source_timestamp_ms: int | None = Field(default=None, ge=0)
    confidence: Confidence = Confidence.medium


class DecisionsResponse(BaseModel):
    decisions: list[ExtractedDecision] = Field(default_factory=list)
    provider: str


# ---- Action items ------------------------------------------------------------


class ExtractedActionItem(BaseModel):
    title: str
    description: str | None = None
    assignee_name_raw: str | None = Field(default=None, description="Name exactly as spoken")
    due_date: date | None = None
    due_date_confidence: Confidence | None = Field(
        default=None, description="Flag uncertain deadlines instead of inventing them"
    )
    priority: Priority = Priority.medium
    source_timestamp_ms: int | None = Field(default=None, ge=0)
    confidence: Confidence = Confidence.medium


class ActionItemsResponse(BaseModel):
    action_items: list[ExtractedActionItem] = Field(default_factory=list)
    provider: str


# ---- Risks & open questions --------------------------------------------------


class ExtractedRisk(BaseModel):
    title: str
    description: str | None = None
    severity: Literal["low", "medium", "high"] = "medium"
    mitigation: str | None = None
    source_timestamp_ms: int | None = Field(default=None, ge=0)
    confidence: Confidence = Confidence.medium


class ExtractedQuestion(BaseModel):
    question: str
    context: str | None = None
    source_timestamp_ms: int | None = Field(default=None, ge=0)
    confidence: Confidence = Confidence.medium


class RisksQuestionsResponse(BaseModel):
    risks: list[ExtractedRisk] = Field(default_factory=list)
    questions: list[ExtractedQuestion] = Field(default_factory=list)
    provider: str


# ---- Agenda coverage (spec §16) ---------------------------------------------


class AgendaCoverageItem(BaseModel):
    agenda_title: str
    discussed_status: Literal["discussed", "partially", "not_discussed"]
    confidence: Confidence = Confidence.medium
    source_timestamp_ms: int | None = Field(default=None, ge=0)


class AgendaCoverageResponse(BaseModel):
    items: list[AgendaCoverageItem] = Field(default_factory=list)
    provider: str


# ---- Minutes of Meeting (spec §26) ------------------------------------------


class DiscussionSection(BaseModel):
    heading: str
    points: list[str] = Field(default_factory=list)
    source_timestamp_ms: int | None = Field(default=None, ge=0)


class MinutesOfMeeting(BaseModel):
    title: str
    objective: str | None = None
    executive_summary: list[str] = Field(default_factory=list)
    detailed_discussions: list[DiscussionSection] = Field(default_factory=list)
    key_points: list[str] = Field(default_factory=list)
    decisions: list[ExtractedDecision] = Field(default_factory=list)
    action_items: list[ExtractedActionItem] = Field(default_factory=list)
    risks: list[ExtractedRisk] = Field(default_factory=list)
    open_questions: list[ExtractedQuestion] = Field(default_factory=list)
    next_steps: list[str] = Field(default_factory=list)


class MomResponse(BaseModel):
    minutes: MinutesOfMeeting
    language: str = "en"
    provider: str
