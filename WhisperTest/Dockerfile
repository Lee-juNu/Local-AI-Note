FROM python:3.9.7

WORKDIR /code

RUN apt update && apt install ffmpeg -y
RUN pip install --upgrade pip

RUN pip install openai-whisper==20230314
RUN pip install setuptools-rust==1.5.2
RUN pip install numpy==1.26.4

RUN pip install fastapi[all]==0.95.1
RUN pip install uvicorn[standard]==0.21.1
RUN pip install gunicorn==20.1.0
RUN pip install python-multipart

COPY ./app /code/app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
#CMD ["uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"]
