FROM python:3.11-slim

WORKDIR /app

# 시스템 패키지 설치 (PDF 처리용)
RUN apt-get update && apt-get install -y \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# 의존성 설치
RUN pip install --no-cache-dir langchain langchain-community pypdf

COPY . .

CMD ["bash"]
