from langchain.text_splitter import TokenTextSplitter

splitter = TokenTextSplitter(
    chunk_size=200,
    chunk_overlap=50
)

with open("output/page_1.txt", "r", encoding="utf-8") as f:
    text = f.read()

chunks = splitter.split_text(text)

import os
os.makedirs("output/split_chunks", exist_ok=True)

for i, chunk in enumerate(chunks, start=1):
    with open(f"output/split_chunks/chunk_{i}.txt", "w", encoding="utf-8") as f:
        f.write(chunk)
