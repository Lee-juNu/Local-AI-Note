from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import ChatRequest, ChatResponse
from .providers.factory import get_provider
from .database import db_health_ok

app = FastAPI(title="Unified Chat API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    provider = get_provider(req)
    out, usage, raw = await provider.chat(req.messages)
    return ChatResponse(provider=req.provider, model=req.model, output=out, usage=usage, raw=raw)

@app.get("/health")
def health():
    return {"ok": True}


@app.get("/health/db")
def health_db():
    try:
        ok = db_health_ok()
        return {"db": "ok" if ok else "ng"}
    except Exception as e:
        # 임시: 에러 원인 확인용
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {e}")