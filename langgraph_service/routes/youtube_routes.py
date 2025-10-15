from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from services.music_recommend_service import recommend_music_simple

router = APIRouter(prefix="/api/diary/gpt/music", tags=["Music Recommendation"])

class SimpleMusicRequest(BaseModel):
    emotionScore: int
    feelingKo: str
    diaryContent: str
    artistPreferences: Optional[List[str]] = []  # ✅ 추가: 선호 아티스트 목록

@router.post("/recommendations/simple")
async def recommend_music(req: SimpleMusicRequest):
    """
    감정점수 + 감정단어 + 회고내용 기반으로 음악 추천
    """
    result = await recommend_music_simple(
        req.emotionScore, req.feelingKo, req.diaryContent,  req.artistPreferences
    )
    return result
