import os
import json
from langchain_community.embeddings import HuggingFaceEmbeddings

embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
chunk_dir = "output/split_chunks"

result = []

for filename in sorted(os.listdir(chunk_dir)):
    with open(os.path.join(chunk_dir, filename), encoding="utf-8") as f:
        content = f.read()
    embedding = embedding_model.embed_query(content)
    result.append({
        "source": filename,
        "content": content,
        "embedding": embedding
    })

# JSON을 stdout에 출력
print(json.dumps(result, ensure_ascii=False, indent=2))
