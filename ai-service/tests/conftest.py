import os

os.environ.setdefault("AI_SERVICE_TOKEN", "test-token")

import pytest
from fastapi.testclient import TestClient

from app.main import create_app


@pytest.fixture()
def client() -> TestClient:
    return TestClient(create_app())


@pytest.fixture()
def auth() -> dict:
    return {"X-Service-Token": "test-token"}
