# 📘 **diary-frontend – Emotion & Diary UI (React + Vite + TS)**

*emoforge의 감정 입력 · 회고 작성 · GPT 요약 · 음악 추천 · 통계 UI 담당 프론트엔드*

---

`diary-frontend`는 emoforge 플랫폼의 감정/회고 기능을 전담하는 React SPA이다.

사용자로부터 하루의 감정·습관·회고를 입력받고, LangGraph + diary-service와 통신해

GPT 요약, 감정 피드백, 음악 추천까지 지원하는 **AI 기반 감정일기 UI**이다.

---

# 📌 **1. 주요 기능**

### 😄 1) 감정 입력 UI

- 감정 점수(1~5) 선택
- 오늘의 기분 한마디(한국어 → 영어번역 GPT)
- 실천 습관 체크박스(habit_tags)

### 📘 2) 회고일기(일기작성)

- 텍스트 기반 일기 작성
- 저장/수정/삭제
- 최신순 정렬

### 🤖 3) GPT 기반 기능 (LangGraph 연동)

- 감정 한마디 영어 변환(feeling_en)
- 회고일기 자동 요약(summary)
- 감정 기반 피드백(feedback)
- 감정 기반 YouTube 음악 추천(video_url + title)

### 📅 4) 감정 Calendar

- 날짜 선택
- 해당 날짜의 감정/회고 요약 표시
- 오늘 요약 자동 표출 (UserHomePage 연동)

### 📊 5) 감정 통계

- 감정 변화 추이
- 작성한 일기 개수
- GPT 음악 추천/요약 횟수
- 감정별 색상 뱃지 표시

### 🔍 6) 회고 목록 + 검색

- 날짜 범위 기반 검색
- 내용/감정 기반 필터링
- infinite scroll 또는 pagination 지원

---

# 🏗️ **2. 기술 스택**

### Frontend

- React 18
- Vite
- TypeScript
- TailwindCSS
- React Router v6
- Axios
- Recharts (감정 통계 차트)
- Custom Modal / Toast components

### Infra

- Docker
- Docker Compose
- EC2 + Nginx SPA Hosting

### 인증

- JWT AccessToken / RefreshToken (auth-frontend에서 로그인)
- axios instance → 자동 토큰 전달

---

# 🗂️ **3. 디렉토리 구조**

```
diary-frontend/
 ├─ src/
 │   ├─ components/
 │   │   ├─ diary/            # 감정·일기·요약 UI
 │   │   ├─ calendar/         # 캘린더 UI
 │   │   ├─ stats/            # 통계 UI
 │   │   ├─ gpt/              # GPT 결과 모달·요약 UI
 │   │   ├─ ui/               # 버튼·토스트·모달
 │   │   └─ layout/           # Header / Navbar
 │   ├─ pages/
 │   │   ├─ DiaryInputPage.tsx
 │   │   ├─ DiaryListPage.tsx
 │   │   ├─ DiaryDetailPage.tsx
 │   │   ├─ SummaryPage.tsx   # 오늘 요약 & 감정요약
 │   │   ├─ CalendarPage.tsx
 │   │   └─ NotFoundPage.tsx
 │   ├─ hooks/
 │   │   ├─ useDiary.ts
 │   │   ├─ useCalendar.ts
 │   │   ├─ useStats.ts
 │   │   └─ useToast.ts
 │   ├─ api/                  # axios client들
 │   ├─ router/AppRouter.tsx
 │   ├─ assets/
 │   └─ main.tsx
 ├─ public/
 ├─ index.html
 └─ README.md ← (본 문서)

```

---

# 🔗 **4. diary-service / langgraph-service 연동 구조**

```
diary-frontend
     ↓
diary-service (Spring Boot)
     ↓
langgraph_service (FastAPI)
     ↓
OpenAI GPT

```

### API 연동 요약:

### 감정/회고 저장

```
POST /api/diary

```

### GPT 자동 요약

```
POST /api/diary/gpt/summary

```

### 감정 기반 음악 추천

```
POST /api/diary/gpt/music

```

### 오늘 요약

```
GET /api/diary/summary/today

```

---

# 🎨 **5. UI 특징**

### 감정색 테마 (Emotion Color Theme)

- emotion 1~5에 따라 다른 색상 적용
- 캘린더/감정태그/모달에도 연동

### GPT 모달 UX

- 결과 나오기 전 로딩 애니메이션
- 요약/피드백/음악 추천 모달 분리
- GPT 오류 발생 시 토스트로 안내

### 감정 캘린더 UI

- 날짜별 감정 색상 칠하기
- 클릭 시 해당 날짜 diaryEntry 상세 조회
- 빈 날짜는 연한 그레이 표시

### SummaryPage

- 로그인 후 첫 화면
- “오늘 감정요약”을 diary-service에서 받아 표시

---

# 🔍 **6. 검색 & 리스트 UI**

- 기간별 검색(시작일~종료일)
- 페이징 or infinite scroll
- emotion 범위 필터
- 내용 검색
- 포지션이 많은 diary-entry를 빠르게 탐색 가능

---

# 🐳 **7. Docker 빌드 & 배포**

### 로컬 빌드

```
npm install
npm run build

```

### EC2에서 Docker 이미지 빌드

```
sudo docker-compose -f docker-compose.frontend.prod.yml build diary-frontend

```

### 실행

```
sudo docker-compose -f docker-compose.frontend.prod.yml --env-file .env.prod up -d diary-frontend

```

### 로그

```
sudo docker logs -f diary-frontend

```

---

# 🔧 **8. 환경 변수 (.env.prod 예시)**

```
VITE_API_DIARY_URL=https://www.emoforge.dev/api/diary
VITE_API_GPT_SUMMARY_URL=https://www.emoforge.dev/api/diary/gpt/summary
VITE_API_GPT_MUSIC_URL=https://www.emoforge.dev/api/diary/gpt/music
VITE_API_GPT_FEEDBACK_URL=https://www.emoforge.dev/api/diary/gpt/feedback

```

---

# 🌐 **9. Nginx 라우팅**

SPA 기반이므로 반드시 index.html fallback 필요:

```
location /diary/ {
    alias /home/ec2-user/emoforge/diary-frontend/dist/;
    try_files $uri $uri/ /diary/index.html;
}

```

---

# ⚠️ **10. 주의사항**

- 감정점수는 1~5 범위만 허용
- GPT 호출은 실패 가능성 있으므로 토스트 처리 필요
- diary_date는 KST 보정 필요
- 캘린더에서 여러달 이동 시 성능 고려
- 음악 추천 API는 외부 구조 변화 시 동작 불가 가능성 있음
- t2.micro 환경은 애니메이션 로딩 시 프레임 드랍 발생 가능

---

# 🚀 **11. 향후 확장 계획**

- 주간/월간 감정리포트 생성
- GPT 기반 일기 분석(감정 키워드, 패턴)
- 음악 추천 히스토리 시각화
- 감정 기반 루틴 추천 기능
- diary-entry 히스토리 버전 관리