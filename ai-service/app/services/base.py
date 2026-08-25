"""Provider interfaces.

Each pipeline capability is a Protocol so real implementations (Whisper,
pyannote, an LLM API, an embedding model) can be dropped in without touching
routers. The service selects an implementation per config.get_settings().
"""

from __future__ import annotations

from typing import Protocol

from app.schemas.assistant import AssistantRequest, AssistantResponse
from app.schemas.analysis import (
    ActionItemsResponse,
    AgendaCoverageResponse,
    AnalysisContext,
    DecisionsResponse,
    MomResponse,
    RisksQuestionsResponse,
    SummaryResponse,
    TopicsResponse,
)
from app.schemas.diarization import DiarizationRequest, DiarizationResponse
from app.schemas.embeddings import EmbeddingRequest, EmbeddingResponse
from app.schemas.language import LanguageDetectionRequest, LanguageDetectionResponse
from app.schemas.transcription import TranscriptionRequest, TranscriptionResponse
from app.schemas.translation import TranslationRequest, TranslationResponse


class Transcriber(Protocol):
    async def transcribe(self, req: TranscriptionRequest) -> TranscriptionResponse: ...


class Diarizer(Protocol):
    async def diarize(self, req: DiarizationRequest) -> DiarizationResponse: ...


class LanguageDetector(Protocol):
    async def detect(self, req: LanguageDetectionRequest) -> LanguageDetectionResponse: ...


class Translator(Protocol):
    async def translate(self, req: TranslationRequest) -> TranslationResponse: ...


class Embedder(Protocol):
    async def embed(self, req: EmbeddingRequest) -> EmbeddingResponse: ...


class LLMAnalyzer(Protocol):
    async def topics(self, ctx: AnalysisContext) -> TopicsResponse: ...
    async def summary(self, ctx: AnalysisContext) -> SummaryResponse: ...
    async def decisions(self, ctx: AnalysisContext) -> DecisionsResponse: ...
    async def action_items(self, ctx: AnalysisContext) -> ActionItemsResponse: ...
    async def risks_questions(self, ctx: AnalysisContext) -> RisksQuestionsResponse: ...
    async def agenda_coverage(self, ctx: AnalysisContext) -> AgendaCoverageResponse: ...
    async def minutes(self, ctx: AnalysisContext) -> MomResponse: ...
    async def answer(self, req: AssistantRequest) -> AssistantResponse: ...
