from __future__ import annotations

from fastapi import APIRouter

from app.schemas.translation import TranslationRequest, TranslationResponse
from app.services.registry import get_translator

router = APIRouter(prefix="/translation", tags=["translation"])


@router.post("", response_model=TranslationResponse)
async def translate(req: TranslationRequest) -> TranslationResponse:
    return await get_translator().translate(req)
