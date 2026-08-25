def _context(segments):
    return {
        "context": {
            "meeting_id": "mtg_1",
            "output_language": "en",
            "title": "Project Review",
            "agenda": ["API testing", "Deployment"],
            "participants": ["Rahul", "Anu"],
            "segments": segments,
        }
    }


SEGMENTS = [
    {"index": 0, "speaker": "Rahul", "start_ms": 0, "end_ms": 5000, "text": "We ship Friday."},
    {"index": 1, "speaker": "Anu", "start_ms": 5000, "end_ms": 9000, "text": "I'll test the API."},
]


def test_summary_contract(client, auth):
    r = client.post("/v1/analysis/summary", headers=auth, json=_context(SEGMENTS))
    assert r.status_code == 200
    body = r.json()
    assert body["language"] == "en"
    assert "executive_summary" in body


def test_embeddings_dimensions(client, auth):
    r = client.post(
        "/v1/embeddings",
        headers=auth,
        json={"items": [{"id": "a", "text": "hello"}]},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["dimensions"] == len(body["embeddings"][0]["vector"])


def test_analysis_requires_segments(client, auth):
    # Empty segments must fail validation (min_length=1).
    r = client.post("/v1/analysis/decisions", headers=auth, json=_context([]))
    assert r.status_code == 422


def test_decisions_grounding_drops_bad_timestamps(client, auth, monkeypatch):
    # Force the analyzer to emit one grounded + one ungrounded decision, and
    # assert the router's grounding guard removes the ungrounded one.
    from app.schemas.analysis import DecisionsResponse, ExtractedDecision

    class FakeAnalyzer:
        async def decisions(self, ctx):
            return DecisionsResponse(
                decisions=[
                    ExtractedDecision(decision="Ship Friday", source_timestamp_ms=1000),   # valid (in seg 0)
                    ExtractedDecision(decision="Invented", source_timestamp_ms=999999),     # invalid
                ],
                provider="fake",
            )

    monkeypatch.setattr("app.routers.analysis.get_llm_analyzer", lambda: FakeAnalyzer())

    r = client.post("/v1/analysis/decisions", headers=auth, json=_context(SEGMENTS))
    assert r.status_code == 200
    decisions = r.json()["decisions"]
    assert len(decisions) == 1
    assert decisions[0]["decision"] == "Ship Friday"
