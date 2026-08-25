def test_protected_route_requires_token(client):
    r = client.post("/v1/translation", json={
        "target_language": "en",
        "items": [{"id": "1", "text": "hola"}],
    })
    assert r.status_code == 401


def test_protected_route_accepts_valid_token(client, auth):
    r = client.post(
        "/v1/translation",
        headers=auth,
        json={"target_language": "en", "items": [{"id": "1", "text": "hola"}]},
    )
    assert r.status_code == 200
    assert r.json()["translations"][0]["text"] == "hola"
