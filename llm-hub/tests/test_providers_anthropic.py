import os
import pytest
from types import SimpleNamespace

from app.providers.anthropic_provider import AnthropicProvider
from app.schemas import ChatMessage


class _FakeAnthropicResp:
    def __init__(self, text: str):
        self.content = [SimpleNamespace(type="text", text=text)]
        self.usage = {"input_tokens": 3, "output_tokens": 5}

    def model_dump(self):
        return {"content": [{"type": "text", "text": "ok"}], "usage": self.usage}


class _FakeClient:
    class _Messages:
        async def create(self, **kwargs):
            return _FakeAnthropicResp("ok")

    def __init__(self, *args, **kwargs):
        self.messages = self._Messages()


@pytest.mark.asyncio
async def test_anthropic_mock(monkeypatch):
    os.environ["ANTHROPIC_API_KEY"] = "x"

    # monkeypatch anthropic.AsyncAnthropic
    import builtins

    class _FakeAnthropicModule:
        AsyncAnthropic = lambda *a, **k: _FakeClient()

    monkeypatch.setitem(builtins.__dict__, "anthropic", _FakeAnthropicModule())

    provider = AnthropicProvider(
        model="claude-3-5-haiku",
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
    assert usage.input_tokens == 3
    assert usage.output_tokens == 5
    assert isinstance(raw, dict)
