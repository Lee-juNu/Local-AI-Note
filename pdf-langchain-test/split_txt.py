from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import TokenTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from langchain.schema import Document
from concurrent.futures import ThreadPoolExecutor

# PDF 로드
loader = PyPDFLoader("files/example.pdf")
documents = loader.load()

# 텍스트 분할기 정의
splitter = TokenTextSplitter(chunk_size=200, chunk_overlap=50)

# Document 객체 리스트 생성
split_documents = []

for doc in documents:
    chunks = splitter.split_text(doc.page_content)
    for chunk in chunks:
        split_documents.append(Document(page_content=chunk, metadata=doc.metadata))

print(f"Total split documents: {len(split_documents)}")

# 임베딩 생성
embedding_function = OllamaEmbeddings(
    model="deepseek-r1:8b",
    base_url="http://host.docker.internal:11434"
)
# 병렬 임베딩 (선택 사항)
def generate_embedding(doc: Document):
    return embedding_function.embed_query(doc.page_content)

with ThreadPoolExecutor() as executor:
    embeddings = list(executor.map(generate_embedding, split_documents))

print(f"Total embeddings generated: {len(embeddings)}")

# Chroma 저장
vectorstore = Chroma.from_documents(
    documents=split_documents,
    embedding=embedding_function,
    persist_directory="chroma_store"
)
vectorstore.persist()
