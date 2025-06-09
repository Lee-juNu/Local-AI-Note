from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import TokenTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from langchain.schema import Document

# PDF 로드
loader = PyPDFLoader("files/example.pdf")
documents = loader.load()

# 텍스트 분할
splitter = TokenTextSplitter(chunk_size=200, chunk_overlap=50)
split_documents = []

for doc in documents:
    chunks = splitter.split_text(doc.page_content)
    for chunk in chunks:
        split_documents.append(Document(page_content=chunk, metadata=doc.metadata))

print(f"Total split documents: {len(split_documents)}")

# ✅ 여기에서 확인용 코드 삽입
for i, doc in enumerate(split_documents):
    if "YOLO" in doc.page_content or "R-CNN" in doc.page_content or "DPM" in doc.page_content:
        print(f"[{i}] {doc.page_content[:200]}...")

# 임베딩 생성기 (Ollama에서 실행 중인 모델 사용)
embedding_function = OllamaEmbeddings(
    model="nomic-embed-text",  # 또는 "deepseek-r1:8b" 가능
    base_url="http://host.docker.internal:11434"
)

# Chroma 벡터스토어에 저장
vectorstore = Chroma.from_documents(
    documents=split_documents,
    embedding=embedding_function,
    persist_directory="/app/chroma_store",
    collection_name="my_db"
)

print("✅ 벡터 저장 완료")
