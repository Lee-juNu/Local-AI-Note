import os
import sys
import pytest

from app.providers.openai_provider import OpenAIProvider
from app.schemas import ChatMessage


class _FakeUsage:
    prompt_tokens = 3
    completion_tokens = 5
    total_tokens = 8


class _FakeChoice:
    def __init__(self):
        self.message = type("M", (), {"content": "ok"})
        self.finish_reason = "stop"


class _FakeResp:
    def __init__(self):
        self.choices = [_FakeChoice()]
        self.usage = _FakeUsage()

    def model_dump(self):
        return {"choices": [{"message": {"content": "ok"}}]}


class _FakeChat:
    class Completions:
        async def create(self, **kwargs):
            return _FakeResp()

    def __init__(self):
        self.completions = self.Completions()


class _FakeClient:
    def __init__(self, *a, **kw):
        self.chat = _FakeChat()


@pytest.mark.asyncio
async def test_openai_mock(monkeypatch):
    os.environ["OPENAI_API_KEY"] = "x"

    # ✅ sys.modules에 가짜 openai 모듈 주입
    class _FakeOpenAI:
        AsyncOpenAI = lambda *a, **k: _FakeClient()

    monkeypatch.setitem(sys.modules, "openai", _FakeOpenAI())

    provider = OpenAIProvider(
        model="gpt-4",
        temperature=0.2,
        top_p=0.9,
        max_tokens=64,
        vendor_options={},
    )
    out, usage, raw = await provider.chat([ChatMessage(role="user", content="ping")])

    assert out.content == "ok"
    assert out.finish_reason == "stop"
    assert usage.input_tokens == 3
    assert usage.output_tokens == 5
    assert usage.total_tokens == 8
    assert isinstance(raw, dict)
