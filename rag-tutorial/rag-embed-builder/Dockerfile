FROM python:3.11-slim

WORKDIR /app

# PDF 추출을 위해 필요
RUN apt-get update && apt-get install -y poppler-utils && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "split_and_store.py"]
