from __future__ import annotations

from fastapi import APIRouter, Depends

from app.schemas.transcription import TranscriptionRequest, TranscriptionResponse
from app.services.registry import get_transcriber

router = APIRouter(prefix="/transcription", tags=["transcription"])


@router.post("", response_model=TranscriptionResponse)
async def transcribe(req: TranscriptionRequest) -> TranscriptionResponse:
    return await get_transcriber().transcribe(req)
