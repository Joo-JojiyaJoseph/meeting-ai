"""Stub providers.

These wire every endpoint end-to-end WITHOUT calling real models, so the service
runs and its contracts can be exercised in tests and by the Laravel integration.

Crucially, the stubs never fabricate meeting content: extraction endpoints return
empty result sets (safe, ungrounded-by-omission) rather than inventing decisions
or action items. Replace each stub with a real provider as it's built.
"""

from __future__ import annotations

import hashlib

from app.config import get_settings
from app.schemas.assistant import AssistantRequest, AssistantResponse, Citation
from app.schemas.analysis import (
    ActionItemsResponse,
    AgendaCoverageResponse,
    AnalysisContext,
    DecisionsResponse,
    MinutesOfMeeting,
    MomResponse,
    RisksQuestionsResponse,
    SummaryResponse,
    TopicsResponse,
)
from app.schemas.diarization import DiarizationRequest, DiarizationResponse
from app.schemas.embeddings import EmbeddingRequest, EmbeddingResponse, EmbeddingVector
from app.schemas.language import (
    LanguageDetectionRequest,
    LanguageDetectionResponse,
    LanguageResult,
)
from app.schemas.transcription import TranscriptionRequest, TranscriptionResponse
from app.schemas.translation import (
    TranslatedItem,
    TranslationRequest,
    TranslationResponse,
)

_PROVIDER = "stub"


class StubTranscriber:
    async def transcribe(self, req: TranscriptionRequest) -> TranscriptionResponse:
        return TranscriptionResponse(
            segments=[],
            detected_languages=[],
            primary_language=req.primary_language,
            word_count=0,
            duration_ms=0,
            provider=_PROVIDER,
        )


class StubDiarizer:
    async def diarize(self, req: DiarizationRequest) -> DiarizationResponse:
        return DiarizationResponse(speakers=[], spans=[], provider=_PROVIDER)


class StubLanguageDetector:
    async def detect(self, req: LanguageDetectionRequest) -> LanguageDetectionResponse:
        # A harmless heuristic default; a real detector replaces this.
        results = [
            LanguageResult(id=item.id, language="en", confidence=0.0)
            for item in req.items
        ]
        return LanguageDetectionResponse(results=results, provider=_PROVIDER)


class StubTranslator:
    async def translate(self, req: TranslationRequest) -> TranslationResponse:
        # Echo text unchanged so the shape is exercised without a real model.
        translations = [
            TranslatedItem(id=i.id, target_language=req.target_language, text=i.text)
            for i in req.items
        ]
        return TranslationResponse(translations=translations, provider=_PROVIDER)


class StubEmbedder:
    async def embed(self, req: EmbeddingRequest) -> EmbeddingResponse:
        settings = get_settings()
        dims = settings.embedding_dimensions
        vectors = []
        for item in req.items:
            # Deterministic pseudo-vector from a hash — NOT semantic, just shape.
            seed = int(hashlib.sha256(item.text.encode()).hexdigest(), 16)
            vec = [((seed >> (i % 64)) & 0xFF) / 255.0 for i in range(dims)]
            vectors.append(EmbeddingVector(id=item.id, vector=vec))
        return EmbeddingResponse(
            model=req.model or settings.embedding_model,
            dimensions=dims,
            embeddings=vectors,
        )


class StubLLMAnalyzer:
    """Returns empty, valid, ungrounded results — never invented content."""

    async def topics(self, ctx: AnalysisContext) -> TopicsResponse:
        return TopicsResponse(topics=[], provider=_PROVIDER)

    async def summary(self, ctx: AnalysisContext) -> SummaryResponse:
        return SummaryResponse(language=ctx.output_language, provider=_PROVIDER)

    async def decisions(self, ctx: AnalysisContext) -> DecisionsResponse:
        return DecisionsResponse(decisions=[], provider=_PROVIDER)

    async def action_items(self, ctx: AnalysisContext) -> ActionItemsResponse:
        return ActionItemsResponse(action_items=[], provider=_PROVIDER)

    async def risks_questions(self, ctx: AnalysisContext) -> RisksQuestionsResponse:
        return RisksQuestionsResponse(risks=[], questions=[], provider=_PROVIDER)

    async def agenda_coverage(self, ctx: AnalysisContext) -> AgendaCoverageResponse:
        items = []
        return AgendaCoverageResponse(items=items, provider=_PROVIDER)

    async def minutes(self, ctx: AnalysisContext) -> MomResponse:
        minutes = MinutesOfMeeting(title=ctx.title or "Minutes of Meeting", objective=ctx.objective)
        return MomResponse(minutes=minutes, language=ctx.output_language, provider=_PROVIDER)

    async def answer(self, req: AssistantRequest) -> AssistantResponse:
        # Stub cannot synthesize prose, but it must stay grounded: cite only the
        # provided context and never fabricate an answer from outside it.
        if not req.chunks:
            return AssistantResponse(
                answer="I couldn't find anything about that in the meetings you have access to.",
                citations=[],
                used_context=False,
                provider=_PROVIDER,
            )
        citations = [
            Citation(
                chunk_id=c.id,
                meeting_id=c.meeting_id,
                source_timestamp_ms=c.source_timestamp_ms,
                snippet=c.content[:160],
            )
            for c in req.chunks
        ]
        return AssistantResponse(
            answer="Answer generation is not configured (stub provider); see the cited sources below.",
            citations=citations,
            used_context=True,
            provider=_PROVIDER,
        )
