from fastapi import FastAPI, HTTPException, Query, UploadFile
import shutil
from pathlib import Path

from app.health import router as health_router
from app.transcriber import transcribe_audio

app = FastAPI()

app.include_router(health_router)

@app.get("/", tags=["Transcription"])
def read_root(
    file_name: str = Query(..., description="サウンドファイル名"),
    extension: str = Query(..., description="拡張子")
):
    file_path = f"app/audio/{file_name}.{extension}"
    try:
        result = transcribe_audio(file_path)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return result

UPLOAD_DIR = Path(r".\uploads")

@app.post("/uploadfile/")
async def upload_audio(file: UploadFile):
    try:
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        save_path = UPLOAD_DIR / file.filename
        
        with save_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {"filename": file.filename, "save_path": str(save_path)}
    finally:
        file.file.close()
