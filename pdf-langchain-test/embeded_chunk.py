from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma
from langchain.docstore.document import Document
import os

# 임베딩 모델 초기화
embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# 청크 로드
chunk_dir = "output/split_chunks"
documents = []

for filename in sorted(os.listdir(chunk_dir)):
    with open(os.path.join(chunk_dir, filename), "r", encoding="utf-8") as f:
        content = f.read()
        documents.append(Document(page_content=content, metadata={"source": filename}))

# Chroma DB에 저장
persist_directory = "output/chroma_db"
os.makedirs(persist_directory, exist_ok=True)

vectordb = Chroma.from_documents(
    documents=documents,
    embedding=embedding_model,
    persist_directory=persist_directory,
)

# 디스크에 저장
vectordb.persist()
