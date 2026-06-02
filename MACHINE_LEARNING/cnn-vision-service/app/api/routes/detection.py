from fastapi import APIRouter

router = APIRouter()

@router.post("/detect")
def detect():
    pass