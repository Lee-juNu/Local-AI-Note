import os
import json
import respx
import httpx
import pytest
import asyncio

from app.providers.ollama_provider import OllamaProvider
from app.schemas import ChatMessage


@pytest.mark.asyncio
async def test_ollama_basic_chat():
    os.environ["OLLAMA_BASE_URL"] = "http://ollama.example:11434"

    provider = OllamaProvider(
        model="llama3.1:8b-instruct-q4_K_M",
        temperature=0.2,
        top_p=0.9,
        max_tokens=64,
        vendor_options={},
    )

    # Mock Ollama /api/chat
    with respx.mock(assert_all_called=True) as rsx:
        route = rsx.post("http://ollama.example:11434/api/chat").mock(
            return_value=httpx.Response(
                200,
                json={
                    "model": "llama3.1",
                    "created_at": "2024-01-01T00:00:00Z",
                    "message": {"role": "assistant", "content": "ok"},
                    "done": True,
                    "eval_count": 10,
                    "prompt_eval_count": 5,
                },
            )
        )

        out, usage, raw = await provider.chat(
            [ChatMessage(role="user", content="ping")]
        )

        assert out.content == "ok"
        assert usage.output_tokens == 10
        assert isinstance(raw, dict)
        assert route.called
