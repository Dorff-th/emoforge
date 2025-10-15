from fastapi import FastAPI
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv

# ✅ .env 파일에서 API 키 로드
load_dotenv()
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

app = FastAPI()

# ✅ 요청 데이터 모델
class MusicRecommendRequest(BaseModel):
    emotionScore: float
    feelingKo: str
    diaryContent: str
    artistPreferences: list[str]


@app.post("/api/diary/gpt/music/recommendations/simple")
def recommend_music(request: MusicRecommendRequest):
    """
    간단한 감정 기반 유튜브 추천 테스트
    """
    query = f"{request.feelingKo} 감정 노래 {', '.join(request.artistPreferences)}"

    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "videoCategoryId": "10",  # 🎵 Music 카테고리
        "key": YOUTUBE_API_KEY,
        "maxResults": 5,
        "regionCode": "KR"
    }

    res = requests.get(url, params=params)

    if res.status_code != 200:
        return {"error": f"API 요청 실패: {res.status_code}", "detail": res.text}

    data = res.json()

    # ✅ 필요한 정보만 추려서 리턴
    results = [
        {
            "title": item["snippet"]["title"],
            "channel": item["snippet"]["channelTitle"],
            "url": f"https://www.youtube.com/watch?v={item['id']['videoId']}",
            "thumbnail": item["snippet"]["thumbnails"]["medium"]["url"]
        }
        for item in data.get("items", [])
    ]

    return {
        "query": query,
        "total": len(results),
        "results": results
    }
