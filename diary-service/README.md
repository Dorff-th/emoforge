# 📘 **diary-service – Emotion & Reflection Diary Backend**

*emoforge 감정일기, GPT 요약, 음악추천 등 모든 감정 기반 기능을 담당하는 백엔드*

---

`diary-service`는 emoforge 플랫폼의 핵심 기능 중 하나인

**감정 입력, 회고 작성, GPT 기반 요약/피드백, YouTube 음악 추천, 감정 통계**

등을 처리하는 독립 백엔드 서비스입니다.

React 기반의 `diary-frontend`와 연동되며

LangGraph-FastAPI 서비스와 협업하여 고급 AI 기능을 제공합니다.

---

# 📌 **1. 서비스 개요**

`diary-service`는 다음 기능을 담당합니다:

- 하루 감정 점수(emotion) 저장
- 습관 체크(habit tags) 저장
- 감정 한마디(한국어/영어) 저장
- 회고일기(content) 저장
- GPT 기반 자동 요약(summary)
- GPT 기반 감정 피드백(feedback)
- 감정 기반 YouTube 음악 추천
- 날짜별 일기 조회 / 검색
- 감정 통계(일/주/월)
- Summary API 제공 (오늘의 회고요약)

AI 기반 기능은 모두 LangGraph FastAPI 서버와 통신하여 처리합니다.

---

# 🏗️ **2. 주요 기술 스택**

### Backend

- Spring Boot 3.3.x
- Spring Security
- JPA / Hibernate
- MariaDB (AWS RDS – `nfe_diary_db`)
- Lombok
- Swagger / SpringDoc

### AI / External Services

- LangGraph FastAPI
- OpenAI GPT-4o-mini (향후 교체 예정)

### Infra

- Docker / Docker Compose
- EC2 / RDS
- JWT 인증(auth-service)

---

# 🗂️ **3. 디렉토리 구조**

```
diary-service/
 ├─ src/main/java/dev/emoforge/diary/
 │   ├─ controller/        # 회고, 요약, 통계 API
 │   ├─ service/           # 로직(GPT 연계 포함)
 │   ├─ repository/        # DiaryEntry, GptSummary, MusicRecommendHistory
 │   ├─ entity/            # 엔티티 정의
 │   ├─ dto/               # Request/Response DTO
 │   └─ security/          # JWT 검증
 │
 └─ resources/
     ├─ application.yml
     └─ schema.sql

```

---

# 🗄️ **4. 데이터베이스 구조 (nfe_diary_db)**

## 📘 주요 테이블

### `diary_entry`

- id
- member_uuid
- diary_date
- emotion
- feeling_ko
- feeling_en
- habit_tags
- content
- feedback
- created_at

### `gpt_summary`

- id
- member_uuid
- diary_entry_id
- diary_date
- summary

### `music_recommend_history`

- id
- diary_entry_id
- member_uuid
- emotion_score
- feeling_ko
- cotent
- keyword_summary
- created_at

### `music_recommend_song`

- id
- history_id
- artist_name
- song_title
- youtube_url
- liked
- thumbnail_url

---

# 🔍 **5. 주요 기능 요약**

## ✏️ 감정 + 회고 입력

- emotion (1~5)
- feelingKo
- feelingEn (GPT 자동 생성)
- habitTags
- content

## 🧠 GPT 기반 요약 & 피드백

LangGraph FastAPI → OpenAI 호출

```
/api/langgraph/diary/gpt/feeling
/api/langgraph/diary/gpt/feedback
/api/langgraph/diary/gpt/summary

```

## 🎵 감정 기반 음악 추천

```
/api/diary/music/recommend → (B2B) langgraph_service : /api/langgraph/diary/gpt/music/recommendations/simple

```

→ GPT → YouTube Music 검색 → 결과 저장

## 📅 캘린더 / 목록 조회

- 일자별 조회
- 감정 캘린더 표시
- 최신순 정렬

## 📈 감정 통계

```
/api/diary/statistics/emotion

```

### 제공 항목:

- averageEmotion
- emotionFrequency
- weeklyTrend

## 🏠 오늘의 요약 Summary (UserHomePage)

```
GET /api/diary/summary/today

```

---

# 🔧 **6. API 구조**

### 📘 Diary API

```
POST   /api/diary
GET    /api/diary/{date}
GET    /api/diary/list?start&end

```

### 🧠 GPT API (LangGraph 연계)

```
POST /api/diary/gpt/summary
POST /api/diary/gpt/feedback
POST /api/diary/gpt/music

```

### 📊 통계 API

```
GET /api/diary/statistics/emotion

```

### 🏠 Summary API

```
GET /api/diary/summary/today

```

---

# 🔗 **7. LangGraph 연동 구조**

Flow 예시:

```
diary-frontend
      ↓
diary-service
      ↓ (REST API)
langgraph-service (FastAPI)
      ↓
OpenAI GPT

```

LangGraph가 GPT 프롬프트·흐름 제어를 담당하고

diary-service는 결과를 받아 DB에 저장하거나 프론트로 전달함.

---

# 🐳 **8. Docker 빌드 & 배포**

로컬 빌드:

```
./diary-service/gradlew clean build -x test

```

EC2에서 이미지 빌드:

```
sudo docker-compose -f docker-compose.backend.prod.yml build diary-service

```

실행:

```
sudo docker-compose -f docker-compose.backend.prod.yml --env-file .env.prod up -d diary-service

```

로그:

```
sudo docker logs -f diary-service

```

---

# 🔧 **9. 환경 변수 (.env.prod 예시)**

```
DIARY_DB_URL=jdbc:mariadb://xxx.amazonaws.com:3306/nfe_diary_db
DIARY_DB_USER=xxxx
DIARY_DB_PASS=xxxx

JWT_USER_SECRET=xxxx
JWT_ADMIN_SECRET=xxxx

LANGGRAPH_URL=http://langgraph_service:8000

```

---

# 🌐 **10. Swagger**

```
/swagger-ui/index.html

```

---

# ⚠️ **11. 주의사항**

- GPT 호출이 반복될 경우 비용 증가 가능 → 캐싱 필요
- 감정 캘린더는 diary_date 기준 (UTC 보정 필요)
- 생성/수정일 포맷은 yyyy-MM-dd HH:mm:ss (KST)
- 음악 추천은 YouTube Music 결과가 달라질 수 있음
- t2.micro는 LangGraph 통신 시 CPU 스파이크 발생 가능

---

# 🎯 **12. 향후 확장 계획**

- GPT 모델 교체(gpt-4.1-mini 등)
- 주간/월간 감정 리포트 자동 생성
- 감정 기반 영어 표현 추천 고도화
- diary_entry 테이블과 summary/gpt 기록 통합 개선