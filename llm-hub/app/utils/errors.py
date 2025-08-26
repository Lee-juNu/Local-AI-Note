from fastapi import HTTPException


class ConfigError(HTTPException):
    def __init__(self, msg: str, status_code: int = 500) -> None:
        super().__init__(status_code=status_code, detail=msg)


class ProviderNotSupported(HTTPException):
    def __init__(self, provider: str) -> None:
        super().__init__(status_code=400, detail=f"Unsupported provider: {provider}")


class UpstreamError(HTTPException):
    def __init__(self, provider: str, msg: str, status_code: int = 502) -> None:
        super().__init__(status_code=status_code, detail=f"{provider} error: {msg}")
