#chroma_client.py
import chromadb
from langchain_ollama import OllamaEmbeddings, OllamaLLM
from langchain_chroma import Chroma
from langchain.chains import RetrievalQA

# embedding モデルの設定
embedding_function = OllamaEmbeddings(
    model="nomic-embed-text",
    base_url="http://host.docker.internal:11434"
)

# Chroma ベクトルストアの設定
vectorstore = Chroma(
    persist_directory="/app/chroma_store",
    embedding_function=embedding_function,
    collection_name="my_db"
)

# 使用する llm のモデル
llm = OllamaLLM(
    model="gemma3:12b",
    base_url="http://host.docker.internal:11434"
)
retriever = vectorstore.as_retriever()

# QA チェーン定義
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=retriever,
    return_source_documents=True
)

# 質問処理関数
def ask(query: str) -> str:
    return qa_chain.invoke(query)


