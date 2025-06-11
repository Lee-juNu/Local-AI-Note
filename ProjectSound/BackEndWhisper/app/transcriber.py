import os
import whisper
import torch
import time
from threading import Lock

model_name = os.getenv("ASR_MODEL", "base")
model_lock = Lock()

def transcribe_audio(file_path: str):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Audio file '{file_path}' not found.")

    if torch.cuda.is_available():
        model = whisper.load_model(model_name).cuda()
    else:
        model = whisper.load_model(model_name)

    with model_lock:
        start = time.time()
        result = model.transcribe(file_path)
        if torch.cuda.is_available():
            torch.cuda.synchronize()
        end = time.time()

    return {"content": result["text"], "processing_seconds": end - start}
