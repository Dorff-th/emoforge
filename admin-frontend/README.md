# 🛠️ **admin-frontend – Admin Console UI (React + Vite + TS)**

*emoforge 플랫폼의 관리자 기능을 제공하는 독립 SPA*

---

`admin-frontend`는 emoforge 플랫폼의 **관리자 도구(Admin Console)** 로,

일반 사용자에게 노출되지 않는 회원관리·카테고리 관리 등의 운영 기능을 위한 별도 프론트엔드입니다.

auth-service가 발급하는 **ADMIN 전용 JWT**를 사용하며,

Google reCAPTCHA v2를 통한 추가 인증 절차로 보안을 강화했습니다.

---

# 📌 **1. 주요 기능**

### 🔐 1) 관리자 전용 로그인

- 관리자 URL 전용 라우트
- Google reCAPTCHA v2 적용
- 로그인 성공 시 ADMIN Token 발급(auth-service)
- 자동 리다이렉트 → 관리자 대시보드

### 👥 2) 회원 관리

auth-service의 관리자 API와 연동하여 다음 기능 지원:

- 전체 회원 목록 조회
- 탈퇴 여부 토글
- 상태 변경(정상 / 정지 / 탈퇴 등)
- UUID·등록일·프로필 정보 조회

### 📁 3) 게시판 카테고리 관리

post-service와 연동:

- 카테고리 추가
- 카테고리 수정
- 카테고리 삭제
- 카테고리 순서 변경(필요할 경우 확장)

### 📊 4) 서비스 기반 통계 패널 (초기 버전)

- 가입자 수
- 게시글 수
- 일기 작성수
- GPT 활용 횟수
    
    (구체적인 차트 페이지는 향후 확장 영역)
    

---

# 🏗️ **2. 기술 스택**

### Frontend

- React 18
- Vite
- TypeScript
- TailwindCSS
- React Router v6
- Axios
- Google reCAPTCHA v2

### Infra

- Docker
- Docker Compose
- Nginx SPA Hosting

### 인증

- ADMIN JWT (auth-service 발급)
- 쿠키 또는 localStorage 기반 인증
- Axios interceptor 기반 리다이렉션

---

# 🗂️ **3. 디렉토리 구조**

```
admin-frontend/
 ├─ src/
 │   ├─ components/
 │   │   ├─ admin/              # Admin UI 모듈
 │   │   ├─ members/            # 회원관리 UI
 │   │   ├─ categories/         # 게시판 카테고리 UI
 │   │   ├─ ui/                 # 버튼, 토스트, 모달
 │   │   └─ layout/             # Sidebar / Header
 │   ├─ pages/
 │   │   ├─ AdminLoginPage.tsx
 │   │   ├─ DashboardPage.tsx
 │   │   ├─ MemberManagePage.tsx
 │   │   ├─ CategoryManagePage.tsx
 │   │   └─ NotFoundPage.tsx
 │   ├─ hooks/
 │   │   ├─ useAdminAuth.ts
 │   │   ├─ useMembers.ts
 │   │   ├─ useCategories.ts
 │   │   └─ useToast.ts
 │   ├─ api/ (axios clients)
 │   ├─ router/AppRouter.tsx
 │   ├─ assets/
 │   └─ main.tsx
 ├─ public/
 ├─ index.html
 └─ README.md ← (본 문서)

```

---

# 🔐 **4. 인증 구조**

관리자 인증은 일반 사용자 로그인과 완전히 분리되어 있음.

```
admin-frontend
      ↓
auth-service (/api/auth/admin/login)
      ↓
ADMIN JWT 발급
      ↓
admin-frontend 저장 → 관리자 페이지로 이동

```

### 보안 요소

- reCAPTCHA v2 검증 후 auth-service 호출
- ADMIN Secret Key로 서명된 별도 JWT
- 관리자 API는 ADMIN JWT 없으면 접근 불가
- EC2/Nginx 레벨에서 관리자 URL 접근 제한도 가능

---

# 🧑‍💼 **5. UI 기능 상세**

### 🔹 AdminLoginPage

- reCAPTCHA 렌더링
- 인증 성공 → ADMIN Token 저장

### 🔹 DashboardPage

- 향후 통계/패널 확장 포인트
- 현재는 회원/카테고리 진입 링크 중심

### 🔹 MemberManagePage

- 회원 전체 목록 테이블
- 탈퇴 여부(On/Off)
- 상태 변경 드롭다운
- UUID 검색 기능

### 🔹 CategoryManagePage

- 카테고리 목록 테이블
- 수정/삭제
- 신규 카테고리 추가

---

# 📦 **6. Docker 빌드 & 배포**

### 로컬 빌드

```
npm install
npm run build

```

### EC2에서 Docker 이미지 빌드

```
sudo docker-compose -f docker-compose.frontend.prod.yml build admin-frontend

```

### 실행

```
sudo docker-compose -f docker-compose.frontend.prod.yml --env-file .env.prod up -d admin-frontend

```

### 로그

```
sudo docker logs -f admin-frontend

```

---

# 🔧 **7. 환경 변수 (.env.prod 예시)**

```
VITE_ADMIN_API_AUTH_URL=https://www.emoforge.dev/api/auth/admin
VITE_ADMIN_API_MEMBER_URL=https://www.emoforge.dev/api/auth/admin/members
VITE_ADMIN_API_CATEGORY_URL=https://www.emoforge.dev/api/categories
VITE_RECAPTCHA_SITE_KEY=xxxx

```

---

# 🌐 **8. Nginx 라우팅**

관리자 페이지는 별도 경로 `/admin/`에서 제공됨.

```
location /admin/ {
    alias /home/ec2-user/emoforge/admin-frontend/dist/;
    try_files $uri $uri/ /admin/index.html;
}

```

---

# ⚠️ **9. 주의사항**

- reCAPTCHA는 운영환경에서 반드시 활성화
- ADMIN 토큰은 일반 USER 토큰과 전혀 다름
- 관리자 URL은 공개되지만 로그인 제한은 철저해야 함
- 카테고리 관리 API는 post-service 배포 상태 따라 영향을 받음
- EC2 t2.micro 환경에서는 관리자 페이지 빌드 파일 용량 관리 중요

---

# 🚀 **10. 향후 확장 계획**

- 게시글/댓글 관리자 페이지 추가
- 통계 대시보드(일기/게시판/GPT 데이터 분석)
- 공지사항/알림(Admin → User) 기능
- Role 기반 접근 제어 강화
- IP 기반 접근 제한(Nginx)