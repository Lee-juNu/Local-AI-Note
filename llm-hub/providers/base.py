from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Tuple, Any
from ..schemas import ChatMessage, ChatOutput, Usage

class LLMProvider(ABC):
    def __init__(
        self,
        model: str,
        temperature: Optional[float],
        top_p: Optional[float],
        max_tokens: Optional[int],
        vendor_options: Dict[str, Any],
    ):
        self.model = model
        self.temperature = temperature
        self.top_p = top_p
        self.max_tokens = max_tokens
        self.vendor_options = vendor_options or {}

    @abstractmethod
    async def chat(self, messages: List[ChatMessage]) -> Tuple[ChatOutput, Usage, Dict[str, Any]]:
        ...
