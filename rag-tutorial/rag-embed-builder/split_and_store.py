from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import TokenTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from langchain.schema import Document

# 1.Load
loader = PyPDFLoader("files/example.pdf")
documents = loader.load()

# 2.Split
splitter = TokenTextSplitter(chunk_size=200, chunk_overlap=50)
split_documents = []

for doc in documents:
    chunks = splitter.split_text(doc.page_content)
    for chunk in chunks:
        split_documents.append(Document(page_content=chunk, metadata=doc.metadata))

print(f"Total split documents: {len(split_documents)}")


for i, doc in enumerate(split_documents):
    if "YOLO" in doc.page_content or "R-CNN" in doc.page_content or "DPM" in doc.page_content:
        print(f"[{i}] {doc.page_content[:200]}...")

# embedding_model 設定
embedding_function = OllamaEmbeddings(
    model="nomic-embed-text",
    base_url="http://host.docker.internal:11434"
)

# Chroma ベクトルストアに保存
vectorstore = Chroma.from_documents(
    documents=split_documents,
    embedding=embedding_function,
    persist_directory="/app/chroma_store",
    collection_name="my_db"
)

print("✅ ベクトル保存完了")
