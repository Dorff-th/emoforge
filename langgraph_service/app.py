# app.py
from fastapi import FastAPI, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from auth_dependency import verify_jwt_from_cookie, require_role
from graph_feeling import compiled_graph
from graph_feedback import compiled_feedback_graph
from graph_summary import compiled_summary_graph

app = FastAPI(title="LangGraph-Service with Cookie-based Auth")

# ✅ CORS 설정
origins = [
    
    "http://app1.127.0.0.1.nip.io",  # Emoforge 프론트 (subdomain 구조)
    "http://post.127.0.0.1.nip.io",
    "http://diary.127.0.0.1.nip.io",
    "http://auth.127.0.0.1.nip.io",
    "https://*.nip.io",              # (옵션) nip.io 와 wildcard 지원
    "http://app3.127.0.0.1.nip.io:5175"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # 접근 허용 도메인
    allow_credentials=True,
    allow_methods=["*"],             # GET, POST, PUT, DELETE 등
    allow_headers=["*"],             # Authorization, Content-Type 등
)

# ✅ 1) 로그인 없이 접근 가능한 엔드포인트
class FeelingRequest(BaseModel):
    feelingKo: str

@app.post("/api/diary/gpt/feeling")
async def get_feeling_suggestions(req: FeelingRequest):
    result = await compiled_graph.ainvoke({"feelingKo": req.feelingKo})
    lines = [line.strip() for line in result["result"].split("\n") if line.strip()]
    return {"suggestions": lines}


# ✅ 2) 인증 필요한 엔드포인트 (쿠키 기반 JWT 검증)
class FeedbackRequest(BaseModel):
    content: str
    feedbackType: str

@app.post("/api/diary/gpt/feedback")
async def get_diary_feedback(req: FeedbackRequest, user=Depends(verify_jwt_from_cookie)):
    result = await compiled_feedback_graph.ainvoke({
        "content": req.content,
        "feedbackType": req.feedbackType
    })

    member_uuid = user.get("member_uuid") or user.get("uuid")  # ✅ 둘 중 하나로 대응

    return {
        "member_uuid": member_uuid,
        "feedback": result["result"]
    }


class SummaryRequest(BaseModel):
    date: str
    content: str

@app.post("/api/diary/gpt/summary")
async def summarize_diary(req: SummaryRequest):
    result = await compiled_summary_graph.ainvoke({
        "date": req.date,
        "content": req.content
    })

    return {
        "summary": result["result"]
    }


# ✅ 3) 관리자 전용 테스트 엔드포인트
@app.get("/api/admin/test")
def admin_test(user=Depends(require_role("ADMIN"))):
    return {
        "message": f"관리자 접근 성공 ✅ - {user['member_uuid']}"
    }
