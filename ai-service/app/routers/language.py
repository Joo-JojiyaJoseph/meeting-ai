from __future__ import annotations

from fastapi import APIRouter

from app.schemas.language import LanguageDetectionRequest, LanguageDetectionResponse
from app.services.registry import get_language_detector

router = APIRouter(prefix="/language", tags=["language"])


@router.post("/detect", response_model=LanguageDetectionResponse)
async def detect(req: LanguageDetectionRequest) -> LanguageDetectionResponse:
    return await get_language_detector().detect(req)
