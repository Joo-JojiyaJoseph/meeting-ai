from __future__ import annotations

from fastapi import APIRouter

from app.schemas.diarization import DiarizationRequest, DiarizationResponse
from app.services.registry import get_diarizer

router = APIRouter(prefix="/diarization", tags=["diarization"])


@router.post("", response_model=DiarizationResponse)
async def diarize(req: DiarizationRequest) -> DiarizationResponse:
    return await get_diarizer().diarize(req)
