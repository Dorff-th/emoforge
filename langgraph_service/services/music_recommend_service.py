import os
import asyncio
from ytmusicapi import YTMusic
from openai import OpenAI

# ✅ 초기화
ytmusic = YTMusic()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def recommend_music_simple(emotionScore: int, feelingKo: str, diaryContent: str):
    """
    emotionScore + feelingKo + diaryContent 기반으로
    GPT가 감정 키워드를 생성하고, YouTube Music API로 노래를 추천한다.
    GPT 및 YouTube 호출은 동기 함수이므로 모두 스레드에서 실행.
    """

    # 1️⃣ GPT 감정 키워드 생성
    async def _generate_keywords():
        prompt = f"""
        다음 데이터를 기반으로 사용자의 감정을 음악 검색용 영어 키워드 2~3개로 만들어줘.
        emotionScore: {emotionScore}
        feelingKo: {feelingKo}
        diaryContent: {diaryContent}

        예시 출력: "happy upbeat pop", "sad chill lofi", "calm acoustic"
        답변은 오직 키워드만 출력.
        """

        def _sync_gpt_call():
            try:
                response = client.chat.completions.create(
                    model=os.getenv("OPENAI_MODEL", "gpt-5-mini"),
                    messages=[
                        {"role": "system", "content": "당신은 감정 기반 음악 큐레이션 전문가입니다."},
                        {"role": "user", "content": prompt},
                    ],
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                print(f"[GPT ERROR] {e}")
                return "chill lofi"

        return await asyncio.to_thread(_sync_gpt_call)

    mood_keywords = await _generate_keywords()

    # 2️⃣ YouTube Music 검색
    async def _search_youtube():
        def _sync_yt_search():
            try:
                return ytmusic.search(query=mood_keywords, filter="videos")
            except Exception as e:
                print(f"[YTMUSIC ERROR] {e}")
                return []

        return await asyncio.to_thread(_sync_yt_search)

    search_results = await _search_youtube()

    # 3️⃣ 결과 정리 (상위 5곡)
    recommendations = []
    for item in search_results[:5]:
        try:
            recommendations.append({
                "title": item.get("title"),
                "artist": ", ".join([a["name"] for a in item.get("artists", [])]),
                "url": f"https://music.youtube.com/watch?v={item.get('videoId')}"
            })
        except Exception:
            continue

    # 4️⃣ 결과 없을 때 기본값
    if not recommendations:
        recommendations = [{
            "title": "No results found",
            "artist": "N/A",
            "url": ""
        }]

    # ✅ 최종 응답
    return {
        "mood_keywords": mood_keywords,
        "recommendations": recommendations
    }
