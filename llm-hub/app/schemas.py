from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field

Role = Literal["system", "user", "assistant"]

class ChatMessage(BaseModel):
    role: Role
    content: str

class ChatRequest(BaseModel):
    provider: Literal["openai", "anthropic", "gemini", "ollama"]
    model: str
    messages: List[ChatMessage]
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = None
    max_tokens: Optional[int] = None
    vendor_options: Dict[str, Any] = Field(default_factory=dict)

class Usage(BaseModel):
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None
    total_tokens: Optional[int] = None

class ChatOutput(BaseModel):
    role: Role = "assistant"
    content: str
    finish_reason: Optional[str] = None

class ChatResponse(BaseModel):
    provider: str
    model: str
    output: ChatOutput
    usage: Usage = Usage()
    raw: Optional[Dict[str, Any]] = None
