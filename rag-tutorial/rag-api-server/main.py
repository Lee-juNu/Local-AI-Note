from fastapi import FastAPI, Query
from chroma_client import ask

app = FastAPI()

@app.get("/ask")
def ask_question(q: str = Query(..., description="질문 내용")):
    answer = ask(q)
    return {"question": q, "answer": answer}
