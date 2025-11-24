# 📝 **post-frontend – Board UI (React + Vite + TS)**

*emoforge 게시판 기능을 담당하는 React 기반 프론트엔드*

---

`post-frontend`는 emoforge 플랫폼의 게시판 기능(게시글, 댓글, 태그, 첨부파일)을 위한 **독립 React SPA**입니다.

post-service(Spring Boot) + attachment-service와 연동하며 **ToastUI Markdown Editor** 기반의 강력한 글쓰기 경험을 제공합니다.

---

# 📌 **1. 주요 기능**

### 📝 1) 게시글 기능

- 게시글 목록 조회 (페이징)
- 게시글 상세보기
- 게시글 작성
- 게시글 수정
- 게시글 삭제
- 게시글 조회수 증가

### 💬 2) 댓글 기능

- 댓글 작성
- 댓글 삭제
- 댓글 개수 표시
- 실시간 반영(리렌더링 중심 방식)

### 🔖 3) 태그 기능

- 태그 추가
- 태그 삭제
- 태그 기반 검색
- 빈 태그 방지(프론트에서 유효성 체크)

### 🖼️ 4) 첨부파일 기능

- 에디터 이미지 업로드(attachment-service 연동, TEMP → CONFIRM)
- 일반 첨부파일 업로드
- 첨부파일 다운로드
- 게시글에 연결된 첨부파일 리스트 표시

### 📰 5) 마크다운 기반 작성

- **ToastUI Markdown Editor** 탑재
- 이미지 업로드 훅 커스터마이징
- 코드블럭/표/인라인 이미지 지원

### 🔍 6) 검색 기능 (미구현)

- 제목/내용/작성자 검색
- 태그 검색
- 카테고리 기반 검색
- 최신순/과거순 정렬

---

# 🏗️ **2. 기술 스택**

### Frontend

- React 18
- Vite
- TypeScript
- TailwindCSS
- React Router v6
- ToastUI Editor
- Axios

### Infra

- Docker
- Docker Compose
- EC2 + Nginx SPA hosting

### 인증

- JWT 기반 인증(auth-frontend Auto Login)
- axios instance로 토큰 자동전달

---

# 🗂️ **3. 디렉토리 구조**

```
post-frontend/
 ├─ src/
 │   ├─ components/
 │   │   ├─ posts/           # 목록, 상세, 글쓰기
 │   │   ├─ editor/          # ToastUI editor wrapper
 │   │   ├─ comments/        # 댓글 UI
 │   │   ├─ tags/            # 태그 UI
 │   │   ├─ attachments/     # 첨부파일 UI
 │   │   ├─ ui/              # 공통 UI(버튼,모달,토스트)
 │   │   └─ layout/          # Header, Footer, Nav
 │   ├─ pages/
 │   │   ├─ PostListPage.tsx
 │   │   ├─ PostDetailPage.tsx
 │   │   ├─ PostWritePage.tsx
 │   │   ├─ PostEditPage.tsx
 │   │   ├─ SearchPage.tsx
 │   │   └─ NotFoundPage.tsx
 │   ├─ hooks/
 │   │   ├─ usePosts.ts
 │   │   ├─ useComments.ts
 │   │   ├─ useTags.ts
 │   │   └─ useToast.ts
 │   ├─ api/ (axios client)
 │   ├─ router/AppRouter.tsx
 │   ├─ assets/
 │   └─ main.tsx
 ├─ public/
 ├─ index.html
 └─ README.md  ← (본 문서)

```

---

# 🔗 **4. 백엔드 연동 구조**

```
post-frontend
     ↓
post-service (Spring Boot)
     ↓
attachment-service (이미지/파일 업로드)

```

### Axios 인스턴스 특징

- baseURL: `/api/posts`
- interceptor 적용
    
    → 토큰 만료 시 자동 로그아웃(auth-frontend로 리디렉션)
    

---

# ✏️ **5. ToastUI Editor 구성**

### 커스텀 기능

- 이미지 업로드 → attachment-service 로 TEMP 저장
- 저장 버튼 클릭 시 → post-service가 TEMP → CONFIRM
- 에디터 안에서 즉시 이미지 프리뷰
- 태그와 첨부파일을 에디터 외부에서 관리

### 기본 지원

- 마크다운 / WYSIWYG 모드
- 코드블럭
- 표
- 인라인 이미지
- TOC (목차)

---

# 🔍 **6. 검색 기능 구조**

### 검색 항목

- 제목
- 내용
- 닉네임
- 태그
- 카테고리

### 검색 방식

```
POST /api/posts/search
{
  keyword, tags, category, page, size
}

```

검색 결과에는 다음 정보 포함:

- 제목
- 카테고리명
- 작성자 닉네임
- 프로필 이미지
- 댓글 수
- 첨부파일 수
- 생성일

---

# 🐳 **7. Docker 빌드 & 배포**

### 로컬 빌드

```
npm install
npm run build

```

### EC2에서 Docker 이미지 빌드

```
sudo docker-compose -f docker-compose.frontend.prod.yml build post-frontend

```

### 실행

```
sudo docker-compose -f docker-compose.frontend.prod.yml --env-file .env.prod up -d post-frontend

```

### 로그

```
sudo docker logs -f post-frontend

```

---

# 🔧 **8. 환경 변수 (.env.prod 예시)**

```
VITE_API_POST_URL=https://www.emoforge.dev/api/posts
VITE_API_ATTACH_URL=https://www.emoforge.dev/api/attachments
VITE_IMAGE_UPLOAD_URL=https://www.emoforge.dev/api/attachments/editor

```

---

# 🌐 **9. Nginx 라우팅**

SPA 방식이므로 반드시 `try_files` 필요:

```
location /posts/ {
    alias /home/ec2-user/emoforge/post-frontend/dist/;
    try_files $uri $uri/ /posts/index.html;
}

```

---

# ⚠️ **10. 주의사항**

- 이미지 업로드는 반드시 TEMP → CONFIRM 흐름 필요
- 태그 빈값 허용 안함 (프론트에서 필터링 처리함)
- axios interceptors에서 토큰 만료 처리 필수
- ToastUI 에디터의 onImageUpload 훅 변경 시 attachment-service URL도 수정 필요
- 대용량 에디터 이미지 다수 업로드 시 t2.micro 메모리 부담됨

---

# 🚀 **11. 향후 확장 계획**

- 게시글 북마크 기능
- 무한 스크롤 기반 목록
- 댓글 트리(Thread) 기능
- 추천/좋아요 기능
- 태그 자동완성
- 게시글 버전 히스토리 표시