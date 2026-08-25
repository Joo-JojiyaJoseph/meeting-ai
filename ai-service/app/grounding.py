"""Server-side grounding guards.

The single most important safety property of this service is that it must not
invent meeting content (spec §52). These helpers enforce that any item claiming
a transcript source actually points at a real segment, and clamp a stray
timestamp to the nearest real one rather than trusting a hallucinated value.
"""

from __future__ import annotations

from collections.abc import Iterable

from .schemas.common import ContextSegment


def timestamp_in_segments(ts: int | None, segments: Iterable[ContextSegment]) -> bool:
    if ts is None:
        return True  # "no source given" is allowed; "wrong source" is not
    return any(s.start_ms <= ts <= s.end_ms for s in segments)


def snap_to_segment(ts: int | None, segments: list[ContextSegment]) -> int | None:
    """Snap a timestamp to the start of the segment it falls in (or the nearest),
    so citations always land on a real segment boundary."""
    if ts is None or not segments:
        return ts
    for s in segments:
        if s.start_ms <= ts <= s.end_ms:
            return s.start_ms
    nearest = min(segments, key=lambda s: abs(s.start_ms - ts))
    return nearest.start_ms


def drop_ungrounded(items: list, segments: list[ContextSegment], attr: str = "source_timestamp_ms") -> list:
    """Remove any extracted item whose cited timestamp doesn't map to a segment.
    Items with no timestamp are kept (they simply carry no citation)."""
    return [it for it in items if timestamp_in_segments(getattr(it, attr, None), segments)]


def filter_citations(citations: list, allowed_chunk_ids: set[str]) -> list:
    """Drop any citation that references a chunk not in the provided context —
    the assistant may only cite what it was actually given (spec §33)."""
    return [c for c in citations if getattr(c, "chunk_id", None) in allowed_chunk_ids]
