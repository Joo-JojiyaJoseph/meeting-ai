"""Service-to-service authentication.

Only Laravel's queue workers call this service, over an internal network, with a
shared token. There is no user auth here — that stays in Laravel.
"""

from __future__ import annotations

import secrets

from fastapi import Header, HTTPException, status

from .config import get_settings


async def require_service_token(x_service_token: str | None = Header(default=None)) -> None:
    expected = get_settings().service_token
    if not x_service_token or not secrets.compare_digest(x_service_token, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing service token.",
        )
