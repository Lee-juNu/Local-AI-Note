import os
from typing import Any, Dict, List, Tuple

from fastapi import HTTPException

from .base import LLMProvider
from ..schemas import ChatMessage, ChatOutput, Usage


class GeminiProvider(LLMProvider):
    async def chat(self, messages: List[ChatMessage]) -> Tuple[ChatOutput, Usage, Dict[str, Any]]:
        try:
            import google.generativeai as genai
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"google-generativeai SDK not installed: {e}")

        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="GOOGLE_API_KEY missing")

        genai.configure(api_key=api_key)

        # 시스템 프롬프트 수집
        system_texts = [m.content for m in messages if m.role == "system"]

        # 대화 히스토리 구성
        history: List[Dict[str, Any]] = []
        for m in messages:
            if m.role == "user":
                history.append({"role": "user", "parts": [{"text": m.content}]})
            elif m.role == "assistant":
                history.append({"role": "model", "parts": [{"text": m.content}]})
            # system 은 아래 system_instruction 로 넣음

        generation_config: Dict[str, Any] = {}
        if self.temperature is not None:
            generation_config["temperature"] = self.temperature
        if self.top_p is not None:
            generation_config["top_p"] = self.top_p
        if self.max_tokens is not None:
            generation_config["max_output_tokens"] = self.max_tokens

        # vendor_options 머지
        vendor_options = self.vendor_options or {}
        if "generation_config" in vendor_options:
            generation_config.update(vendor_options["generation_config"])

        model = genai.GenerativeModel(self.model)

        try:
            resp = await model.generate_content_async(
                contents=history,
                system_instruction="\n".join(system_texts) if system_texts else None,
                generation_config=generation_config if generation_config else None,
                **{k: v for k, v in vendor_options.items() if k != "generation_config"},
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Gemini error: {e}")

        # SDK의 resp.text 사용
        text = getattr(resp, "text", None) or ""

        # usage 노출이 제한되는 경우가 많아 None 처리
        usage = Usage()

        # 원본 결과를 가능한 한 dict 로 변환
        raw = getattr(resp, "_result", None)
        if not isinstance(raw, dict):
            raw = {}

        return ChatOutput(content=text, finish_reason=None), usage, raw
