import os
import sys
import pytest

from app.providers.gemini_provider import GeminiProvider  

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
async def test_gemini_mock(monkeypatch):
    os.environ["GOOGLE_API_KEY"] = "x"

    # monkeypatch google.generativeai
    import builtins

    class _FakeModule:
        def configure(**kwargs):
            return None

        class GenerativeModel:
            def __init__(self, *a, **k):
                pass

            async def generate_content_async(self, **kwargs):
                return _FakeResp()

    monkeypatch.setitem(builtins.__dict__, "google", type("G", (), {})())
    monkeypatch.setitem(builtins.__dict__["google"].__dict__, "generativeai", _FakeModule)

    provider = GeminiProvider(
        model="gemini-1.5-pro",
        temperature=0.2,
        top_p=0.9,
        max_tokens=64,
        vendor_options={},
    )
    out, usage, raw = await provider.chat(
        [
            ChatMessage(role="system", content="sys"),
            ChatMessage(role="user", content="u"),
        ]
    )
    assert out.content == "ok"
    assert isinstance(raw, dict)
