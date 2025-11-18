from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
from core.auth_dependency import verify_jwt_from_cookie, require_role
from services.gpt_summary_service import summarize_diary
from services.gpt_feedback_service import generate_feedback
from services.gpt_feeling_service import translate_feeling

router = APIRouter(
    prefix="/api/langgraph/diary/gpt",
    tags=["GPT Diary"]
)

# ============================================
# 📌 공통 Response 모델 정의 (Swagger 가독성 ↑)
# ============================================

class FeelingResponse(BaseModel):
    feelingEn: str = Field(..., description="GPT가 번역한 영어 표현", example="I'm exhausted today.")

class FeedbackResponse(BaseModel):
    feedback: str = Field(..., description="GPT가 생성한 피드백 메시지", example="오늘은 많이 힘들었겠네! 그래도 잘 버텼어.")

class SummaryResponse(BaseModel):
    summary: str = Field(..., description="GPT가 생성한 회고 요약문", example="오늘은 피로감이 큰 하루였고 운동을 하지 못해 아쉬움을 느꼈다.")

# ============================================
# 1️⃣ 감정 영어 표현 요청
# ============================================

class FeelingRequest(BaseModel):
    feelingKo: str = Field(..., description="한국어 감정 표현", example="오늘 너무 피곤하다")

@router.post(
    "/feeling",
    summary="감정 한국어 → 영어 표현 생성",
    description="사용자가 입력한 한국어 감정 문장을 GPT를 활용해 자연스러운 영어 표현으로 번역합니다.",
    response_model=FeelingResponse,
)
async def get_feeling(req: FeelingRequest):
    return await translate_feeling(req)


# ============================================
# 2️⃣ 감정·습관·회고 피드백 생성
# ============================================

class FeedbackRequest(BaseModel):
    emotionScore: int = Field(..., description="감정 점수 (1~5)", example=3)
    habitTags: Optional[List[str]] = Field(default_factory=list, description="오늘 체크한 습관 목록", example=["운동", "명상"])
    feelingKo: Optional[str] = Field("", description="한국어 감정 표현", example="피곤함")
    feelingEn: Optional[str] = Field("", description="영어 감정 표현 (GPT 추천 후 사용 가능)", example="I'm tired")
    diaryContent: str = Field(..., description="오늘 회고 내용", example="오늘 하루 종일 일하느라 너무 지쳐버렸다.")
    feedbackStyle: str = Field("encourage", description="피드백 스타일", example="encourage")

@router.post(
    "/feedback",
    summary="감정·습관·회고 기반 GPT 피드백 생성",
    description="감정 점수, 습관 태그, 회고 내용을 기반으로 GPT가 맞춤형 피드백 메시지를 생성합니다.",
    response_model=FeedbackResponse
)
async def get_feedback(req: FeedbackRequest, user=Depends(verify_jwt_from_cookie)):
    return await generate_feedback(req, user)


# ============================================
# 3️⃣ 회고 요약 생성
# ============================================

class SummaryRequest(BaseModel):
    date: str = Field(..., description="회고 날짜 (YYYY-MM-DD)", example="2025-11-18")
    content: str = Field(..., description="오늘 회고 텍스트", example="오늘은 정신없고 바쁜 하루였다.")

@router.post(
    "/summary",
    summary="회고 요약 생성",
    description="사용자가 작성한 회고 내용을 기반으로 GPT가 핵심 요약을 생성합니다.",
    response_model=SummaryResponse
)
async def get_summary(req: SummaryRequest):
    return await summarize_diary(req)


# ============================================
# 4️⃣ 관리자 테스트
# ============================================

@router.get(
    "/admin/test",
    summary="관리자 전용 테스트 엔드포인트",
    description="ADMIN 권한 JWT가 정상인지 확인할 때 사용하는 테스트 API입니다."
)
async def admin_test(user=Depends(require_role("ADMIN"))):
    return {"message": f"관리자 접근 성공 ✅ - {user['member_uuid']}"}
