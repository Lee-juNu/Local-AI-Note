# main.py
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from chroma_client import ask  # 以下のask(query)をそのまま使用  

app = FastAPI()

# 必要なドメインに制限しても良い
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ask")
def ask_question(q: str = Query(..., description="質問内容")):
    out = ask(q)                   # LangChain RetrievalQA 結果(dict)
    # LangChain RetrievalQAは{"result": str, "source_documents": [...]} 形式
    text = out.get("result", str(out))
    sources = [
        {"metadata": getattr(doc, "metadata", {}), "page_content": getattr(doc, "page_content", "")}
        for doc in out.get("source_documents", [])
    ]
    return {"question": q, "answer": text, "sources": sources}
