import chromadb
from langchain_ollama import OllamaEmbeddings, OllamaLLM
from langchain_chroma import Chroma
from langchain.chains import RetrievalQA

# 임베딩 함수 정의
embedding_function = OllamaEmbeddings(
    model="nomic-embed-text",
    base_url="http://host.docker.internal:11434"
)

# Chroma 벡터스토어 클라이언트
vectorstore = Chroma(
    persist_directory="/app/chroma_store",
    embedding_function=embedding_function,
    collection_name="my_db"
)

# LLM 정의
llm = OllamaLLM(
    model="gemma3:12b",
    base_url="http://host.docker.internal:11434"
)
retriever = vectorstore.as_retriever()

# QA 체인 정의
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=retriever,
    return_source_documents=True
)

# 질문 처리 함수
def ask(query: str) -> str:
    return qa_chain.invoke(query)


