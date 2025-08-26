import os, httpx
from fastapi import HTTPException
from typing import Any, Dict, List, Tuple
from .base import LLMProvider
from ..schemas import ChatMessage, ChatOutput, Usage

class OllamaProvider(LLMProvider):
    async def chat(self, messages: List[ChatMessage]) -> Tuple[ChatOutput, Usage, Dict[str, Any]]:
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        url = f"{base_url}/api/chat"
        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "stream": False,
        }
        if self.temperature is not None:
            payload.setdefault("options", {})["temperature"] = self.temperature
        if self.top_p is not None:
            payload.setdefault("options", {})["top_p"] = self.top_p
        if self.max_tokens is not None:
            payload.setdefault("options", {})["num_predict"] = self.max_tokens
        if self.vendor_options:
            payload.update(self.vendor_options)

        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(url, json=payload)
        if resp.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Ollama error: {resp.text}")
        data = resp.json()
        msg = (data or {}).get("message", {}) or {}
        text = msg.get("content", "")
        usage = Usage(
            input_tokens=(data or {}).get("prompt_eval_count"),
            output_tokens=(data or {}).get("eval_count"),
        )
        return ChatOutput(content=text, finish_reason="stop" if (data or {}).get("done") else None), usage, data
