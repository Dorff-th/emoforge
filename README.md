# 2. README.md 파일 정리 (검토필요)

# 🛠️ **Emoforge – Personal Productivity & Diary Platform (MSA)**

**Emoforge**는 감정일기, 게시판, 사용자 인증, 첨부파일 관리, GPT 기반 컨텐츠 생성(요약·피드백·음악추천)을 하나의 플랫폼으로 통합한 **개인용 MSA 기반 서비스**입니다.

이 프로젝트는 2025년 기준 약 5개월간 진행되었고, 다음 기술들을 활용하여 실제 운영 가능한 형태로 구축되었습니다:

- **Spring Boot 3** 기반의 다중 백엔드 서비스
- **React + Vite + TypeScript** 기반 4개의 프론트엔드
- **FastAPI + LangGraph** 기반 GPT 기능 엔진
- **Docker Compose + Nginx + HTTPS(Certbot)** 기반 인프라
- **AWS EC2 + RDS** 기반 배포 환경

개발자 개인 프로젝트 수준을 넘어서, **실제 서비스 운영에 필요한 거의 모든 요소**를 갖춘 풀스택 플랫폼입니다.

---

# 🏗️ 1. 아키텍처 개요

```
┌───────────────────────────────────────────────┐
│                  Nginx Gateway                │
│       HTTPS Termination / Routing / Logs      │
└───────────────────────────────────────────────┘
           │
           ▼
┌───────────────────────────────────────────────┐
│ Docker Compose (Backend / Frontend stacks)    │
│                                               │
│  • Auth-Service (Spring Boot + JWT + Kakao)   │
│  • Diary-Service (GPT Summary, Music Reco)    │
│  • Post-Service (게시판)                      │
│  • Attachment-Service (첨부파일)               │
│  • LangGraph-Service (FastAPI + OpenAI)       │
│                                               │
│  • auth-frontend / diary-frontend             │
│  • post-frontend / admin-frontend             │
└───────────────────────────────────────────────┘

        ▼
┌─────────────────────────┐
│   AWS RDS (MySQL/Maria) │
│   nfe_auth_db           │
│   nfe_post_db           │
│   nfe_diary_db          │
│   nfe_file_db           │
└─────────────────────────┘

```

---

# 📁 2. 디렉토리 구조 요약

```
emoforge/
 ├─ auth-service/
 ├─ auth-frontend/
 ├─ diary-service/
 ├─ diary-frontend/
 ├─ post-service/
 ├─ post-frontend/
 ├─ attachment-service/
 ├─ admin-frontend/
 ├─ langgraph_service/
 ├─ cleanup-service/
 ├─ docker-compose.backend.prod.yml
 ├─ docker-compose.frontend.prod.yml
 ├─ nginx/conf.d/default.conf
 └─ README.md   ← (본 문서)

```

---

# ⚙️ 3. 기술 스택

### Backend

- Spring Boot 3
- JPA / Hibernate
- Spring Security
- JWT 인증 (USER / ADMIN 분리)
- Kakao OAuth2 로그인
- MariaDB (AWS RDS)

### Frontend

- React
- Vite
- TypeScript
- TailwindCSS
- ToastUI Editor (게시판 에디터)

### Infra / DevOps

- Docker Compose
- Nginx Gateway
- Certbot (HTTPS)
- AWS EC2
- AWS RDS
- ~~GitHub Actions (CI/CD 일부 프로젝트에 적용)~~

### AI / GPT

- FastAPI
- LangGraph 기반 orchestration
- OpenAI ~~gpt-4o-mini (서비스 종료 예정)~~ → gpt-4.1-mini 교체

---

# 🚀 4. 서비스별 설명

---

## 🔐 **auth-service (Backend)**

- 로그인 / 회원가입 / 인증 / 인가
- Kakao OAuth2 로그인
- 사용자 프로필 관리
- 관리자 기능 제공
- DB: **nfe_auth_db**

### 빌드 & 배포

```
./auth-service/gradlew clean build -x test
sudo docker-compose -f docker-compose.backend.prod.yml build auth-service
sudo docker-compose -f docker-compose.backend.prod.yml --env-file .env.prod up -d auth-service

```

---

## 🎨 **auth-frontend (React)**

- Kakao OAuth 로그인
- 프로필 이미지 / 닉네임 / 이메일 관리
- 3개 서비스 통계 조회
- 탈퇴 / 탈퇴 철회 기능

### 빌드 & 배포

```
./auth-frontend/npm run build
sudo docker-compose -f docker-compose.frontend.prod.yml build auth-frontend
sudo docker-compose -f docker-compose.frontend.prod.yml --env-file .env.prod up -d auth-frontend

```

---

## 📎 **attachment-service (Backend)**

- 프로필 이미지
- 게시판 첨부파일
- 에디터 이미지
- TEMP → CONFIRMED 워크플로우
- DB: nfe_file_db

---

## 📝 **post-service (Backend)**

- 게시글 CRUD
- 댓글 CRUD
- 태그
- 첨부파일 연동
- DB: nfe_post_db

---

## 🖥️ **post-frontend (React)**

- ToastUI Markdown 에디터
- 게시글 목록/조회/등록/수정/삭제
- 댓글 작성/삭제
- 첨부파일 미리보기/다운로드

---

## 📘 **diary-service (Backend)**

- 감정 기록
- GPT 요약
- GPT 음악 추천
- 감정 통계
- DB: nfe_diary_db

---

## 📔 **diary-frontend (React)**

- 감정 입력 UI
- 감정 Calendar
- 감정 통계
- GPT 음악 추천 모달
- 회고 목록 및 검색

---

## 🤖 **langgraph_service (FastAPI)**

- GPT 요약 / 피드백
- GPT 음악 추천
- OpenAI gpt-4o-mini 기반

---

## 🧹 **cleanup-service**

- 첨부파일 가비지 데이터 삭제
- orphan 이미지 정리
- TEMP 파일 주기적 정리

---

# 🌐 5. Nginx + HTTPS 구성

### 설정파일

```
./nginx/conf.d/default.conf

```

### 설정 테스트 & 재로드

```
sudo docker exec nginx_gateway nginx -t
sudo docker exec nginx_gateway nginx -s reload

```

### Certbot 인증서 발급 (최초 1회)

```
sudo docker-compose -f docker-compose.backend.prod.yml up -d nginx certbot

sudo docker exec -it certbot certbot certonly --webroot \
  -w /var/www/certbot \
  -d emoforge.dev -d www.emoforge.dev \
  --email {your@email} \
  --agree-tos --no-eff-email

```

---

# 🐳 6. Backend 전체 실행 방법

예시:

```
sudo docker-compose -f docker-compose.backend.prod.yml build
sudo docker-compose -f docker-compose.backend.prod.yml --env-file .env.prod up -d

```

서비스 하나만 재기동:

```
sudo docker-compose -f docker-compose.backend.prod.yml build diary-service
sudo docker-compose -f docker-compose.backend.prod.yml --env-file .env.prod up -d diary-service

```

---

# 📦 7. Frontend 전체 실행 방법

```
sudo docker-compose -f docker-compose.frontend.prod.yml build
sudo docker-compose -f docker-compose.frontend.prod.yml --env-file .env.prod up -d

```

[1) auth-service ](2%20README%20md%20%ED%8C%8C%EC%9D%BC%20%EC%A0%95%EB%A6%AC%20(%EA%B2%80%ED%86%A0%ED%95%84%EC%9A%94)/1)%20auth-service%202b56eb4e297780cea9d6f4c75904a04c.md)

[2) attachment-service](2%20README%20md%20%ED%8C%8C%EC%9D%BC%20%EC%A0%95%EB%A6%AC%20(%EA%B2%80%ED%86%A0%ED%95%84%EC%9A%94)/2)%20attachment-service%202b56eb4e297780ce9abdc840df469396.md)

[3) post-service](2%20README%20md%20%ED%8C%8C%EC%9D%BC%20%EC%A0%95%EB%A6%AC%20(%EA%B2%80%ED%86%A0%ED%95%84%EC%9A%94)/3)%20post-service%202b56eb4e297780ada80efbe8c6c8a584.md)

[4) diary-service](2%20README%20md%20%ED%8C%8C%EC%9D%BC%20%EC%A0%95%EB%A6%AC%20(%EA%B2%80%ED%86%A0%ED%95%84%EC%9A%94)/4)%20diary-service%202b56eb4e2977809ba07de13d6eec373b.md)

[5) langgraph_service](2%20README%20md%20%ED%8C%8C%EC%9D%BC%20%EC%A0%95%EB%A6%AC%20(%EA%B2%80%ED%86%A0%ED%95%84%EC%9A%94)/5)%20langgraph_service%202b56eb4e297780b7a602ef668832aeaa.md)

[6) auth-frontend](2%20README%20md%20%ED%8C%8C%EC%9D%BC%20%EC%A0%95%EB%A6%AC%20(%EA%B2%80%ED%86%A0%ED%95%84%EC%9A%94)/6)%20auth-frontend%202b56eb4e297780b4809acf91fe494de4.md)

[7) post-frontend](2%20README%20md%20%ED%8C%8C%EC%9D%BC%20%EC%A0%95%EB%A6%AC%20(%EA%B2%80%ED%86%A0%ED%95%84%EC%9A%94)/7)%20post-frontend%202b56eb4e297780559a0af486fbc7b4eb.md)

[8) diary-frontend](2%20README%20md%20%ED%8C%8C%EC%9D%BC%20%EC%A0%95%EB%A6%AC%20(%EA%B2%80%ED%86%A0%ED%95%84%EC%9A%94)/8)%20diary-frontend%202b56eb4e297780ba871ce3c969dec932.md)

[9) admin-frontend](2%20README%20md%20%ED%8C%8C%EC%9D%BC%20%EC%A0%95%EB%A6%AC%20(%EA%B2%80%ED%86%A0%ED%95%84%EC%9A%94)/9)%20admin-frontend%202b56eb4e2977803da830c9be055769e0.md)

[10) cleanup-service](2%20README%20md%20%ED%8C%8C%EC%9D%BC%20%EC%A0%95%EB%A6%AC%20(%EA%B2%80%ED%86%A0%ED%95%84%EC%9A%94)/10)%20cleanup-service%202b56eb4e2977807e84a9c133cc897a1b.md)