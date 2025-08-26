import pytest
from app.schemas import ChatRequest, ChatMessage
from app.providers.factory import get_provider
from app.providers.base import LLMProvider


def test_factory_mapping():
    req = ChatRequest(
        provider="ollama",
        model="llama3",
        messages=[ChatMessage(role="user", content="hi")],
    )
    p = get_provider(req)
    assert isinstance(p, LLMProvider)
