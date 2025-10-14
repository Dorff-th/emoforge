from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.gpt_routes import router as gpt_router
from routes.youtube_routes import router as youtube_router

app = FastAPI(title="LangGraph-Service with Cookie-based Auth")

# ✅ CORS 설정
origins = [
    "http://app1.127.0.0.1.nip.io",
    "http://post.127.0.0.1.nip.io",
    "http://diary.127.0.0.1.nip.io",
    "http://auth.127.0.0.1.nip.io",
    "https://*.nip.io",
    "http://app3.127.0.0.1.nip.io:5175",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 라우트 등록
app.include_router(gpt_router)
app.include_router(youtube_router)

@app.get("/")
def root():
    return {"message": "LangGraph-Service is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
