import os
from typing import Any, Dict, List, Tuple

from fastapi import HTTPException

from .base import LLMProvider
from ..schemas import ChatMessage, ChatOutput, Usage


class AnthropicProvider(LLMProvider):
    async def chat(self, messages: List[ChatMessage]) -> Tuple[ChatOutput, Usage, Dict[str, Any]]:
        try:
            import anthropic
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"anthropic SDK not installed: {e}")

        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY missing")

        client = anthropic.AsyncAnthropic(api_key=api_key)

        # system / conversation 분리
        system_parts: List[str] = []
        chat_parts: List[Dict[str, str]] = []
        for m in messages:
            if m.role == "system":
                system_parts.append(m.content)
            else:
                # Claude는 "user" | "assistant" 만 허용
                role = "user" if m.role == "user" else "assistant"
                chat_parts.append({"role": role, "content": m.content})

        kwargs: Dict[str, Any] = {
            "model": self.model,
            "messages": chat_parts,
        }
        if system_parts:
            kwargs["system"] = "\n".join(system_parts)
        if self.max_tokens is not None:
            kwargs["max_tokens"] = self.max_tokens
        if self.temperature is not None:
            kwargs["temperature"] = self.temperature
        if self.top_p is not None:
            kwargs["top_p"] = self.top_p
        if self.vendor_options:
            kwargs.update(self.vendor_options)

        try:
            resp = await client.messages.create(**kwargs)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Anthropic error: {e}")

        # 텍스트 추출
        text_chunks: List[str] = []
        for blk in getattr(resp, "content", []) or []:
            # SDK: content=[{"type":"text","text":"..."}] 등
            t = getattr(blk, "text", None) or (blk.get("text") if isinstance(blk, dict) else None)
            if t:
                text_chunks.append(t)
        text = "".join(text_chunks)

        usage_raw = getattr(resp, "usage", None) or {}
        usage = Usage(
            input_tokens=getattr(usage_raw, "input_tokens", None) if not isinstance(usage_raw, dict) else usage_raw.get("input_tokens"),
            output_tokens=getattr(usage_raw, "output_tokens", None) if not isinstance(usage_raw, dict) else usage_raw.get("output_tokens"),
            total_tokens=None,
        )

        raw = resp.model_dump() if hasattr(resp, "model_dump") else (resp if isinstance(resp, dict) else {})
        return ChatOutput(content=text, finish_reason=None), usage, raw
