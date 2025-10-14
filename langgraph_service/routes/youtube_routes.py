from fastapi import APIRouter
from pydantic import BaseModel
from services.music_recommend_service import recommend_music_simple

router = APIRouter(prefix="/api/diary/gpt/music", tags=["Music Recommendation"])

class SimpleMusicRequest(BaseModel):
    emotionScore: int
    feelingKo: str
    diaryContent: str

@router.post("/recommendations/simple")
async def recommend_music(req: SimpleMusicRequest):
    """
    감정점수 + 감정단어 + 회고내용 기반으로 음악 추천
    """
    result = await recommend_music_simple(
        req.emotionScore, req.feelingKo, req.diaryContent
    )
    return result
