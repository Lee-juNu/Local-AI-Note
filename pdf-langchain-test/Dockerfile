FROM python:3.11-slim

WORKDIR /app

# 시스템 패키지 설치 (PDF 등 텍스트 처리용)
RUN apt-get update && apt-get install -y \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# 파이썬 패키지 설치
RUN pip install --no-cache-dir \
    langchain \
    langchain-community \
    pypdf \
    tiktoken \
    chromadb \
    sentence-transformers

COPY . .

CMD ["python", "embeded_chunk.py"]
