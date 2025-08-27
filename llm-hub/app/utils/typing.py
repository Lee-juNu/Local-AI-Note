from typing import Any, Dict, List, Tuple, TypedDict, Literal

Role = Literal["system", "user", "assistant"]


class ProviderOutput(TypedDict, total=False):
    content: str
    finish_reason: str | None


JsonDict = Dict[str, Any]
JsonList = List[Any]
ChatIO = Tuple[ProviderOutput, Dict[str, int | None], JsonDict]

