# app/providers/gemini_provider.py
import os
from typing import List, Tuple, Dict, Any
from fastapi import HTTPException
from ..schemas import ChatMessage, ChatOutput, Usage
from .llm_provider import LLMProvider  

class GeminiProvider:
    def __init__(self, model: str, temperature=None, top_p=None, max_tokens=None, vendor_options=None):
        self.model = model
        self.temperature = temperature
        self.top_p = top_p
        self.max_tokens = max_tokens
        self.vendor_options = vendor_options or {}

    async def chat(self, messages: List[ChatMessage]) -> Tuple[ChatOutput, Usage, Dict[str, Any]]:
        try:
            import google.generativeai as genai
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"google-generativeai SDK not installed: {e}")

        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="GOOGLE_API_KEY missing")

        genai.configure(api_key=api_key)

        # system 프롬프트 수집
        system_texts = [m.content for m in messages if m.role == "system"]

        # 대화 히스토리 구성 (user -> role=user, assistant -> role=model)
        history: List[Dict[str, Any]] = []
        for m in messages:
            if m.role == "user":
                history.append({"role": "user", "parts": [{"text": m.content}]})
            elif m.role == "assistant":
                history.append({"role": "model", "parts": [{"text": m.content}]})
            # system 은 아래 system_instruction 로 전달

        # 생성 파라미터
        generation_config: Dict[str, Any] = {}
        if self.temperature is not None:
            generation_config["temperature"] = self.temperature
        if self.top_p is not None:
            generation_config["top_p"] = self.top_p
        if self.max_tokens is not None:
            generation_config["max_output_tokens"] = self.max_tokens

        # vendor_options 병합 (generation_config 중첩 허용)
        vendor_options = dict(self.vendor_options) if self.vendor_options else {}
        if "generation_config" in vendor_options and isinstance(vendor_options["generation_config"], dict):
            generation_config.update(vendor_options["generation_config"])

        # ✅ 시스템 프롬프트는 생성자에 넣는다
        model = genai.GenerativeModel(
            self.model,
            system_instruction="\n".join(system_texts) if system_texts else None,
        )

        try:
            # generate_content_async(*contents, **kwargs) 시그니처를 따른다
            resp = await model.generate_content_async(
                history,
                generation_config=generation_config if generation_config else None,
                **{k: v for k, v in vendor_options.items() if k != "generation_config"},
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Gemini error: {e}")

        # 응답 파싱
        text = getattr(resp, "text", None) or ""
        out = ChatOutput(role="assistant", content=text, finish_reason="stop")
        usage = Usage(input_tokens=None, output_tokens=None, total_tokens=None)

        # 원본 직렬화 시도
        raw: Dict[str, Any] = {}
        try:
            raw = getattr(resp, "to_dict", lambda: {})() or {}
        except Exception:
            try:
                raw = resp.__dict__
            except Exception:
                raw = {}

        return out, usage, raw
