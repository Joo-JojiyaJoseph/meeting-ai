"""Provider selection. Swaps stub/real implementations based on settings.

Wire real providers here as they land, e.g.:
    if settings.transcription_provider == "whisper":
        return WhisperTranscriber(...)
"""

from __future__ import annotations

from app.config import get_settings

from .base import (
    Diarizer,
    Embedder,
    LanguageDetector,
    LLMAnalyzer,
    Transcriber,
    Translator,
)
from .stub import (
    StubDiarizer,
    StubEmbedder,
    StubLanguageDetector,
    StubLLMAnalyzer,
    StubTranscriber,
    StubTranslator,
)


def get_transcriber() -> Transcriber:
    return StubTranscriber()


def get_diarizer() -> Diarizer:
    return StubDiarizer()


def get_language_detector() -> LanguageDetector:
    return StubLanguageDetector()


def get_translator() -> Translator:
    return StubTranslator()


def get_embedder() -> Embedder:
    return StubEmbedder()


def get_llm_analyzer() -> LLMAnalyzer:
    return StubLLMAnalyzer()
