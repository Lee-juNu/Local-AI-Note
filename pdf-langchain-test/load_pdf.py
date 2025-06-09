import os
import json
from langchain_community.document_loaders import PyPDFLoader

loader = PyPDFLoader("files/example.pdf")
documents = loader.load()

os.makedirs("output", exist_ok=True)

metadata_list = []

for i, doc in enumerate(documents, start=1):
    with open(f"output/page_{i}.txt", "w", encoding="utf-8") as f:
        f.write(doc.page_content)
    
    metadata_list.append({
        "page": i,
        **doc.metadata
    })

with open("output/metadata.json", "w", encoding="utf-8") as f:
    json.dump(metadata_list, f, ensure_ascii=False, indent=2)
