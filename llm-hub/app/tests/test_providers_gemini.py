import os
import pytest

from app.providers.gemini_provider import GeminiProvider
from app.schemas import ChatMessage


class _FakeResp:
    def __init__(self):
        self.text = "ok"
        self._result = {"candidates": []}


class _FakeGenModel:
    async def generate_content_async(self, **kwargs):
        return _FakeResp()


class _FakeGenAI:
    def configure(self, **kwargs):
        pass

    class GenerativeModel:
        def __init__(self, *a, **k):
            pass

        async def generate_content_async(self, **kwargs):
            return _FakeResp()


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
