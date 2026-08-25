def _payload(chunks):
    return {"question": "What did we decide about deployment?", "output_language": "en", "chunks": chunks}


CHUNKS = [
    {"id": "c1", "meeting_id": "mtg_1", "content": "We decided to deploy on Friday.", "source_timestamp_ms": 1000},
    {"id": "c2", "meeting_id": "mtg_1", "content": "Rahul will run the migration.", "source_timestamp_ms": 5000},
]


def test_assistant_answers_with_context(client, auth):
    r = client.post("/v1/assistant/answer", headers=auth, json=_payload(CHUNKS))
    assert r.status_code == 200
    body = r.json()
    assert body["used_context"] is True
    assert {c["chunk_id"] for c in body["citations"]} == {"c1", "c2"}


def test_assistant_no_context_admits_it(client, auth):
    r = client.post("/v1/assistant/answer", headers=auth, json=_payload([]))
    assert r.status_code == 200
    body = r.json()
    assert body["used_context"] is False
    assert body["citations"] == []


def test_assistant_drops_fabricated_citations(client, auth, monkeypatch):
    # An answerer that cites a chunk it was never given must have that citation
    # stripped by the router's grounding guard.
    from app.schemas.assistant import AssistantResponse, Citation

    class FakeAnalyzer:
        async def answer(self, req):
            return AssistantResponse(
                answer="…",
                citations=[
                    Citation(chunk_id="c1", meeting_id="mtg_1", snippet="real"),
                    Citation(chunk_id="ghost", meeting_id="mtg_9", snippet="fabricated"),
                ],
                used_context=True,
                provider="fake",
            )

    monkeypatch.setattr("app.routers.assistant.get_llm_analyzer", lambda: FakeAnalyzer())

    r = client.post("/v1/assistant/answer", headers=auth, json=_payload(CHUNKS))
    assert r.status_code == 200
    cited = {c["chunk_id"] for c in r.json()["citations"]}
    assert cited == {"c1"}  # "ghost" dropped
