# app/providers/openai_provider.py
import os
from typing import Any, Dict, List, Tuple
from fastapi import HTTPException
from .base import LLMProvider
from ..schemas import ChatMessage, ChatOutput, Usage

class OpenAIProvider(LLMProvider):
    async def chat(self, messages: List[ChatMessage]) -> Tuple[ChatOutput, Usage, Dict[str, Any]]:
        try:
            import openai  # lazy import
            import httpx
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"openai SDK not installed: {e}")

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OPENAI_API_KEY missing")

        # 선택: 조직/프로젝트 지정이 필요하면 사용
        org = os.getenv("OPENAI_ORG") or None
        project = os.getenv("OPENAI_PROJECT") or None

        # httpx 타임아웃(연결/읽기) 방어
        client = openai.AsyncOpenAI(
            api_key=api_key,
            organization=org,
            project=project,
            timeout=httpx.Timeout(30.0, read=60.0),
        )

        # OpenAI Chat Completions 포맷(role, content)
        payload_msgs = [{"role": m.role, "content": m.content} for m in messages]

        kwargs: Dict[str, Any] = {
            "model": self.model,
            "messages": payload_msgs,
        }
        if self.temperature is not None:
            kwargs["temperature"] = self.temperature
        if self.top_p is not None:
            kwargs["top_p"] = self.top_p
        if self.max_tokens is not None:
            # v1 SDK 및 최신 스펙에 맞춰 max_tokens 사용 (더 넓은 호환성)  
            kwargs["max_tokens"] = self.max_tokens
        if self.vendor_options:
            kwargs.update(self.vendor_options)

        try:
            resp = await client.chat.completions.create(**kwargs)
        except Exception as e:
            # SDK 예외를 FastAPI 표준 JSON으로 포장
            raise HTTPException(status_code=500, detail=f"OpenAI error: {e}")

        try:
            choice = resp.choices[0]
            text = (choice.message.content or "").strip()
            finish = getattr(choice, "finish_reason", None)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"OpenAI parse error: {e}")

        usage = Usage(
            input_tokens=getattr(getattr(resp, "usage", None), "prompt_tokens", None),
            output_tokens=getattr(getattr(resp, "usage", None), "completion_tokens", None),
            total_tokens=getattr(getattr(resp, "usage", None), "total_tokens", None),
        )

        # 원본 직렬화 방어
        try:
            raw: Dict[str, Any] = resp.model_dump()
        except Exception:
            try:
                raw = resp.dict()  # 구버전 대응
            except Exception:
                raw = {}

        return ChatOutput(content=text, finish_reason=finish or "stop"), usage, raw
