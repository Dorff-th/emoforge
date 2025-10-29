import os
import asyncio
from ytmusicapi import YTMusic
from openai import OpenAI

# ✅ 초기화
ytmusic = YTMusic()  # 또는 YTMusic("headers_auth.json") 로 로그인 세션 사용
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# 🔹 Step 1. 아티스트 영어 변환 (GPT 기반)
async def normalize_artists_gpt(artist_prefs: list[str]) -> list[str]:
    if not artist_prefs:
        return []

    prompt = f"""
    아래 아티스트 이름들을 YouTube Music 검색에 적합한 영어 이름으로 변환해줘.
    이미 영어라면 그대로 두고, 존재하지 않으면 건너뛰어도 돼.
    입력: {', '.join(artist_prefs)}
    출력: 쉼표로 구분된 영어 이름만 (예: IU, BTS, Coldplay)
    """

    def _sync_gpt_call():
        try:
            res = client.chat.completions.create(
                model=os.getenv("OPENAI_MODEL", "gpt-5-mini"),
                messages=[
                    {"role": "system", "content": "당신은 음악 아티스트 이름을 영어로 정규화하는 전문가입니다."},
                    {"role": "user", "content": prompt},
                ],
            )
            text = res.choices[0].message.content.strip()
            return [a.strip() for a in text.split(",") if a.strip()]
        except Exception as e:
            print(f"[GPT Normalize ERROR] {e}")
            return artist_prefs

    return await asyncio.to_thread(_sync_gpt_call)


# 🔹 Step 2. 감정 기반 음악 추천 (아티스트 연관 강화)
async def recommend_music_simple(
    emotionScore: int,
    feelingKo: str,
    diaryContent: str,
    artist_preferences: list[str] = []
):
    # ✅ 아티스트명 정규화
    artist_preferences = await normalize_artists_gpt(artist_preferences)
    print(f"🎤 정규화된 아티스트 목록(music_recommend_service.py) → {artist_preferences}")

    # ✅ 1️⃣ GPT로 감정 + 아티스트 기반 키워드 생성
    async def _generate_keywords():
        artist_text = ", ".join(artist_preferences) if artist_preferences else "없음"
        prompt = f"""
        아래 데이터를 바탕으로 사용자의 감정을 영어 키워드 2~3개로 만들어줘.
        단, 반드시 선호 아티스트({artist_text})의 음악 스타일을 참고하고,
        아티스트 이름도 포함된 검색어로 만들어야 해.
        예: IU emotional ballad / Coldplay chill acoustic / BTS energetic pop

        emotionScore: {emotionScore}
        feelingKo: {feelingKo}
        diaryContent: {diaryContent}
        artistPreferences: {artist_text}

        답변은 오직 한 줄로 영어 키워드만 출력 (예: IU emotional ballad)
        """

        def _sync_gpt_call():
            try:
                res = client.chat.completions.create(
                    model=os.getenv("OPENAI_MODEL", "gpt-5-mini"),
                    messages=[
                        {"role": "system", "content": "당신은 감정 기반 음악 큐레이션 전문가입니다."},
                        {"role": "user", "content": prompt},
                    ],
                )
                return res.choices[0].message.content.strip()
            except Exception as e:
                print(f"[GPT ERROR] {e}")
                return "chill pop"

        return await asyncio.to_thread(_sync_gpt_call)

    mood_keywords = await _generate_keywords()
    mood_keywords = mood_keywords.replace("\n", " ").replace("-", " ").replace('"', "").strip()
    print(f"🎧 GPT mood keywords → {mood_keywords}")

    # ✅ 2️⃣ YouTube Music 검색
    async def _search_youtube():
        def _sync_yt_search():
            try:
                queries = []
                # 아티스트별로 개별 검색 쿼리 구성
                if artist_preferences:
                    for artist in artist_preferences:
                        # 아티스트 이름을 앞뒤로 반복해 강조
                        queries.append(f"{artist} {mood_keywords} song {artist}")
                else:
                    queries.append(f"{mood_keywords} song")

                results = []
                for q in queries:
                    print(f"🔍 Searching YouTubeMusic: {q}")
                    items = ytmusic.search(query=q, filter="videos")
                    results.extend(items or [])

                # 🔎 아티스트 이름 필터링 (정확도 향상)
                filtered = [
                    item for item in results
                    if any(
                        artist.lower() in (item.get("title") or "").lower()
                        or artist.lower() in ", ".join([a["name"].lower() for a in item.get("artists", [])])
                        for artist in artist_preferences
                    )
                ]

                # 중복 제거
                seen = set()
                unique_results = []
                for item in filtered:
                    vid = item.get("videoId")
                    if vid and vid not in seen:
                        seen.add(vid)
                        unique_results.append(item)
                return unique_results
            except Exception as e:
                print(f"[YTMUSIC ERROR] {e}")
                return []

        return await asyncio.to_thread(_sync_yt_search)

    search_results = await _search_youtube()

    # ✅ 3️⃣ 결과 정리
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

    if not recommendations:
        recommendations = [{"title": "No results found", "artist": "N/A", "url": ""}]

    # ✅ 최종 응답
    return {
        "mood_keywords": mood_keywords,
        "recommendations": recommendations,
        "used_artists": artist_preferences
    }
