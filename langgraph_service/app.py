from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.gpt_routes import router as gpt_router
# from routes.youtube_routes import router as youtube_router
from routes.music_router import router as music_router

from fastapi.responses import JSONResponse   # ✅ 이 줄 추가
from datetime import datetime

# ✅ (추가) 환경설정 로드
# 기존 하드코딩된 origins 대신 .env.dev 또는 .env.prod에서 로드
from core.config import settings  # ← 새로 추가됨


# ✅ FastAPI 앱 생성 시 환경설정 기반 타이틀 적용
# app = FastAPI(title="LangGraph-Service with Cookie-based Auth")
app = FastAPI(title=settings.APP_NAME)  # ← 수정됨


# ✅ (기존 CORS 하드코딩 제거)
# origins = [
#     "http://app1.127.0.0.1.nip.io",
#     "http://post.127.0.0.1.nip.io",
#     "http://diary.127.0.0.1.nip.io",
#     "http://auth.127.0.0.1.nip.io",
#     "https://*.nip.io",
#     "http://app3.127.0.0.1.nip.io:5175",
# ]

# ✅ CORS 설정 (.env에서 읽어옴)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ✅ 라우트 등록
app.include_router(gpt_router)
# app.include_router(youtube_router)
app.include_router(music_router)


@app.get("/")
def root():
    # ✅ 기존 메시지 → 환경 기반 응답으로 수정
    # return {"message": "LangGraph-Service is running"}
    return {
        "service": settings.APP_NAME,
        "env": settings.APP_ENV,
        "base_url": settings.BASE_URL
    }


if __name__ == "__main__":
    import uvicorn

    # ✅ 기존 하드코딩된 host/port → .env 기반 설정으로 변경
    # uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
    uvicorn.run(
        "app:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=(settings.APP_ENV == "dev")
    )


@app.get("/api/health")
async def health():
    return JSONResponse(
        content={
            "status": "OK",
            "service": "langgraph-service",
            "timestamp": datetime.now().isoformat()
        }
    )