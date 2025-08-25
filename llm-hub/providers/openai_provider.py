import os
from fastapi import HTTPException
from typing import Any, Dict, List, Tuple
from .base import LLMProvider
from ..schemas import ChatMessage, ChatOutput, Usage

class OpenAIProvider(LLMProvider):
    async def chat(self, messages: List[ChatMessage]) -> Tuple[ChatOutput, Usage, Dict[str, Any]]:
        try:
            from openai import AsyncOpenAI
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"openai SDK not installed: {e}")
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OPENAI_API_KEY missing")

        client = AsyncOpenAI(api_key=api_key)
        kwargs: Dict[str, Any] = {
            "model": self.model,
            "messages": [m.model_dump() for m in messages],
        }
        if self.temperature is not None:
            kwargs["temperature"] = self.temperature
        if self.top_p is not None:
            kwargs["top_p"] = self.top_p
        if self.max_tokens is not None:
            kwargs["max_completion_tokens"] = self.max_tokens
        kwargs.update(self.vendor_options or {})

        resp = await client.chat.completions.create(**kwargs)
        choice = resp.choices[0]
        text = choice.message.content or ""
        usage = Usage(
            input_tokens=getattr(resp.usage, "prompt_tokens", None) if getattr(resp, "usage", None) else None,
            output_tokens=getattr(resp.usage, "completion_tokens", None) if getattr(resp, "usage", None) else None,
            total_tokens=getattr(resp.usage, "total_tokens", None) if getattr(resp, "usage", None) else None,
        )
        return ChatOutput(content=text, finish_reason=choice.finish_reason), usage, resp.model_dump()
