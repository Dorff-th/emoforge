# 🔐 **auth-frontend – Authentication Frontend (React + Vite + TS)**

*emoforge 플랫폼의 사용자 인증·프로필·통계 UI 담당 프론트엔드*

---

`auth-frontend`는 emoforge 플랫폼에서 **로그인 / 회원가입 / 프로필 관리 / 사용자 통계 / 탈퇴 관리 / 관리자 로그인(reCAPTCHA 포함)** 등을 담당하는 독립적인 React 프론트엔드입니다.

Auth-Service(Spring Boot), Attachment-Service, Diary-Service, Post-Service 등과 통신하며

사용자의 진입점(로그인, 프로필, 서비스 선택) UI를 제공합니다.

---

# 📌 **1. 주요 기능**

### 🔑 1) 로그인 / 회원가입

- Kakao OAuth2 로그인
- 최초 로그인 시 자동 회원가입(auth-service 연동)
- 로그인 성공 시 AccessToken/RefreshToken 쿠키 저장

### 🧑‍💼 2) 사용자 프로필 관리

- 닉네임 변경
- 이메일 변경
- 프로필 이미지 업로드(attachment-service 연동)
- 프로필 이미지 삭제

### 📊 3) 서비스별 활동 통계 조회

통합 프로필 화면에서 다음 통계 제공:

- 작성한 게시글 수
- 감정일기 수
- GPT 요약 및 음악추천 기록 수
- 첨부파일/에디터 이미지 사용량

### ⚠️ 4) 탈퇴 / 탈퇴 철회

- 탈퇴 신청
- 탈퇴 상태 해제
- auth-service API 기반

### 🛡️ 5) 관리자 로그인

- 관리자 전용 로그인 화면
- Google reCAPTCHA v2 적용
- ADMIN Token 발급(auth-service)
- 관리자 전용 페이지로 라우팅(admin-frontend 연동)

---

# 🏗️ **2. 기술 스택**

### Frontend

- **React 18**
- **Vite**
- **TypeScript**
- **React Router v6**
- **TailwindCSS**
- **Axios**

### Infra

- Docker / Docker Compose
- EC2 + Nginx Gateway

### 인증

- JWT AccessToken / RefreshToken
- HttpOnly Secure Cookie 저장
- auth-service 연동

---

# 🗂️ **3. 디렉토리 구조**

```
auth-frontend/
 ├─ src/
 │   ├─ components/
 │   │   ├─ forms/            # 프로필 입력 폼들
 │   │   ├─ profile/          # 프로필 정보·이미지
 │   │   ├─ stats/            # 사용자 활동 통계
 │   │   ├─ ui/               # 버튼, 모달, 토스트
 │   │   └─ auth/             # OAuth 버튼, 로그인 UI
 │   ├─ contexts/
 │   │   ├─ AuthContext.tsx   # JWT + 사용자 정보
 │   │   └─ ThemeContext.tsx
 │   ├─ pages/
 │   │   ├─ LoginPage.tsx
 │   │   ├─ ProfilePage.tsx
 │   │   ├─ AdminLoginPage.tsx
 │   │   ├─ SettingsPage.tsx
 │   │   └─ NotFoundPage.tsx
 │   ├─ hooks/
 │   │   ├─ useAuth.ts
 │   │   ├─ useAxios.ts
 │   │   └─ useToast.ts
 │   ├─ router/AppRouter.tsx
 │   ├─ api/ (axios client)
 │   ├─ assets/
 │   └─ main.tsx
 ├─ public/
 ├─ index.html
 └─ README.md  ← (본 문서)

```

---

# 🔗 **4. auth-service 연동 구조**

```
auth-frontend
    ↓
auth-service (Spring Boot)
    ↓
JWT Access / Refresh 발급
    ↓
쿠키 저장 후 /profile 이동

```

통신 방식:

- Axios 인스턴스 2개 운영
    - baseURL: /api/auth
    - interceptors: 토큰 만료 → 자동 로그아웃

---

# 🧠 **5. 주요 UI 페이지**

### 🟦 LoginPage

- Kakao OAuth2 버튼
- 로그인 후 자동 리다이렉트

### 🟩 ProfilePage

- 닉네임/이메일 변경
- 프로필 이미지 업로드(attachment-service)
- 사용자 활동 통계 조회
- 탈퇴/철회 버튼

### 🟥 AdminLoginPage

- reCAPTCHA v2 적용
- 관리자 전용 토큰 발급
- admin-frontend로 리다이렉트

### 🟨 SettingsPage

- 테마(라이트/다크)
- 쿠키 삭제
- 로그아웃

---

# 📦 **6. 빌드 & 배포**

### 로컬 빌드

```
npm install
npm run build

```

### EC2에서 Docker 이미지 빌드

```
sudo docker-compose -f docker-compose.frontend.prod.yml build auth-frontend

```

### 실행

```
sudo docker-compose -f docker-compose.frontend.prod.yml --env-file .env.prod up -d auth-frontend

```

### 로그 확인

```
sudo docker logs -f auth-frontend

```

---

# 🔧 **7. 환경 변수 (.env.prod 예시)**

```
VITE_API_AUTH_URL=https://www.emoforge.dev/api/auth
VITE_KAKAO_AUTH_URL=https://www.emoforge.dev/api/auth/kakao/login
VITE_RECAPTCHA_SITE_KEY=xxxx

```

---

# 🌐 **8. Nginx 라우팅**

`/auth/` 경로 아래로 서빙됨

예시:

```
location /auth/ {
    alias /home/ec2-user/emoforge/auth-frontend/dist/;
    try_files $uri $uri/ /auth/index.html;
}

```

SPA 라우팅 기반으로 404 방지 위해 index.html fallback 필요.

---

# ⚠️ **9. 주의사항**

- JWT는 HttpOnly + Secure Cookie로만 저장
- 카카오 Redirect URI는 HTTPS 필요
- 프로필 이미지 업로드 시 attachment-service URL 변경 시 수정 필요
- admin-login은 반드시 reCAPTCHA 활성화 상태에서 배포
- EC2 t2.micro 환경에서는 프론트빌드 파일 용량 관리 주의

---

# 🚀 **10. 향후 확장 계획**

- SNS 로그인 추가 (Google, Apple)
- 전체 서비스 대시보드 UI
- 사용자 알림(Notification) 기능
- 사용자 경험 개선 (애니메이션·토스트 강화)