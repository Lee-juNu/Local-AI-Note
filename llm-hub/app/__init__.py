# app/__init__.py
from .providers.factory import get_provider  # 올바른 경로
__all__ = ["get_provider"]
