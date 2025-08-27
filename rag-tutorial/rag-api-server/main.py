# main.py
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from chroma_client import ask  # 아래의 ask(query) 그대로 사용

app = FastAPI()

# 필요 도메인으로 제한해도 됨
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ask")
def ask_question(q: str = Query(..., description="질문 내용")):
    out = ask(q)                   # LangChain RetrievalQA 결과(dict)
    # LangChain RetrievalQA는 {"result": str, "source_documents": [...]} 형태
    text = out.get("result", str(out))
    sources = [
        {"metadata": getattr(doc, "metadata", {}), "page_content": getattr(doc, "page_content", "")}
        for doc in out.get("source_documents", [])
    ]
    return {"question": q, "answer": text, "sources": sources}
