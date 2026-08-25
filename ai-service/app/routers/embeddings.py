from __future__ import annotations

from fastapi import APIRouter

from app.schemas.embeddings import EmbeddingRequest, EmbeddingResponse
from app.services.registry import get_embedder

router = APIRouter(prefix="/embeddings", tags=["embeddings"])


@router.post("", response_model=EmbeddingResponse)
async def embed(req: EmbeddingRequest) -> EmbeddingResponse:
    return await get_embedder().embed(req)
