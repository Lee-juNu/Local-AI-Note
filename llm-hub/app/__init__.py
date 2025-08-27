# app/__init__.py
from .providers.factory import get_provider  # 올바른 경로
from app.routes import test_db   # 👈 반드시 import
from fastapi import FastAPI


app = FastAPI(title="Unified Chat API")

# 라우터 등록
app.include_router(test_db.router)

__all__ = ["get_provider"]
