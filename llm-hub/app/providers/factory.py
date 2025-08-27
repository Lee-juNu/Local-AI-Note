from fastapi import HTTPException
from typing import Dict, Any
from ..schemas import ChatRequest
from .base import LLMProvider
from .openai_provider import OpenAIProvider
from .anthropic_provider import AnthropicProvider
from .gemini_provider import GeminiProvider
from .ollama_provider import OllamaProvider

def get_provider(req: ChatRequest) -> LLMProvider:
    mapping = {
        "openai": OpenAIProvider,
        "anthropic": AnthropicProvider,
        "gemini": GeminiProvider,
        "ollama": OllamaProvider,
    }
    Cls = mapping.get(req.provider)
    if not Cls:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {req.provider}")
    return Cls(req.model, req.temperature, req.top_p, req.max_tokens, req.vendor_options)
