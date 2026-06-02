from fastapi import FastAPI, UploadFile
from fastapi.responses import FileResponse
from app.services.yolo_service import detect_smoke
import os

app = FastAPI()


@app.post("/detect")
async def detect(file: UploadFile):

    os.makedirs("uploads", exist_ok=True)

    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as f:
        f.write(await file.read())

    result = detect_smoke(file_path)

    return result


@app.get("/evidence/{filename}")
def get_evidence(filename: str):

    return FileResponse(
        f"evidences/{filename}"
    )