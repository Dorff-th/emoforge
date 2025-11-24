# 📝 **post-service – Board / Markdown Editor Backend**

`post-service`는 emoforge 플랫폼의 **게시판(노트포지 스타일)** 기능을 담당하는 독립 백엔드 서비스입니다.

React 기반의 `post-frontend`와 연동되며, 게시글/댓글/태그/첨부파일을 중심으로 한 생산성 게시판 기능을 제공합니다.

---

# 📌 **1. 서비스 개요**

post-service는 다음 핵심 기능을 담당합니다:

- 게시글 CRUD
- 댓글 CRUD
- 태그 입력/삭제
- 게시글 첨부파일 관리
    
    → attachment-service와 연동
    
- ToastUI Markdown Editor 이미지 업로드
- 게시글 검색 및 페이징
- 카테고리 관리(관리자 기능)
- 작성자 프로필 이미지/닉네임 표시
- 게시글 조회수, 댓글수, 첨부파일수 자동 집계
- React 기반 post-frontend와 API 연동

게시판 단일 기능이 아니라,

**첨부파일-회원정보-관리자 기능까지 연결된 완전한 게시판 백엔드** 역할을 합니다.

---

# 🏗️ **2. 주요 기술 스택**

### Backend

- Spring Boot 3.3.x
- Spring Security
- JPA / Hibernate
- MariaDB (AWS RDS – `nfe_post_db`)
- Lombok
- Swagger / SpringDoc

### Infra

- Docker
- Docker Compose
- EC2 / RDS
- attachment-service 연동
- auth-service JWT 기반 인증

---

# 🗂️ **3. 디렉토리 구조**

```
post-service/
 ├─ src/main/java/dev/emoforge/post/
 │   ├─ controller/          # 게시글, 댓글, 태그, 카테고리 API
 │   ├─ service/             # 비즈니스 로직
 │   ├─ repository/          # JPA Repository
 │   ├─ entity/              # Post, Comment, Tag, Category
 │   ├─ dto/                 # Request/Response
 │   └─ security/            # JWT 인증 처리
 │
 └─ resources/
     ├─ application.yml
     ├─ schema.sql
     └─ data.sql (선택)

```

---

# 🗄️ **4. DB 구조 (nfe_post_db)**

### 주요 테이블

### 🧱 `post`

- id
- title
- content
- member_uuid
- ~~nickname (조회용 캐싱)~~
- category_id
- created_at / updated_at
- view_count

### 💬 `comment`

- id
- post_id (FK)
- content
- member_uuid
- ~~nickname~~
- created_at
- updated_at (미사용)

### 🔖 `tag`

- id
- ~~post_id (FK)~~
- tag_name

### 🔖 post_tag

- post_id
- tag_id

### 📁 첨부파일 (attachment-service 연동)

post-service 자체에는 저장하지 않지만

게시글에 연결되는 attachment ID 리스트를 관리함.

---

# 🔐 **5. 인증 구조**

### 인증 방식

- `Authorization: Bearer {JWT}`
- auth-service에서 발급한 USER / ADMIN JWT 사용

### 주요 필터

- `JwtAuthenticationFilter`
- `JwtTokenProvider`

Board 기능 전체가 인증 기반이며,

조회(Read)는 Public 전략도 적용 가능하지만 현재는 로그인 기반으로 통일.

---

# 🧰 **6. 주요 API**

### 📌 게시글 (Post)

```
GET    /api/posts            # 목록 조회 + 페이징
GET    /api/posts/{id}       # 상세조회
POST   /api/posts            # 작성
PUT    /api/posts/{id}       # 수정
DELETE /api/posts/{id}       # 삭제

```

### 📌 댓글 (Comment)

```
POST   /api/posts/{id}/comments
DELETE /api/comments/{id}

```

### 📌 태그

```
POST   /api/posts/{id}/tags
DELETE /api/posts/{id}/tags/{tagId}

```

### 📌 카테고리 (Admin)

```
GET    /api/categories
POST   /api/categories
PUT    /api/categories/{id}
DELETE /api/categories/{id}

```

### 📌 파일 첨부 연동

attachment-service의 `/api/attachments/confirm` 사용

(post-service가 TEMP를 Confirm 처리)

---

# 🧩 **7. attachment-service 연동**

post-service는 파일 저장을 **하지 않음**.

모든 파일 처리는 attachment-service가 담당.

게시글 저장 흐름:

```
1) ToastUI 에디터에서 이미지 업로드 → TEMP 저장
2) post 저장 API 호출 시
   → TEMP group_temp_key 전달
3) post-service가 confirm 요청
4) attachment-service가 TEMP → CONFIRMED로 변경
5) 게시글 ID에 맞게 파일 매핑 저장

```

덕분에 게시판에서 취소/실패 시 발생하는

“고아 이미지(Orphan)” 문제를 방지함.

---

# 🔍 **8. 검색 기능 (미구현)**

- 제목 검색
- 내용 검색
- 태그 기반 검색
- 카테고리 기반 검색
- 작성자 기반 검색
- 최신순 정렬
- 페이지당 게시글 수 조정 가능

React post-frontend의 검색 페이지와 연동됨.

---

# 📊 **9. 게시글 통계 필드(미구현)**

post-service는 게시글 리스트를 반환할 때 다음 정보를 함께 제공:

- 댓글 개수
- 첨부파일 개수
- 작성자 프로필 이미지 URL
- 작성자 닉네임
- 카테고리 이름
- 생성일

이 덕분에 frontend는 별도 추가 API 없이

리스트 화면을 한 번에 그릴 수 있음.

---

# 🐳 **10. Docker 빌드 & 배포**

### 로컬 빌드

```
./post-service/gradlew clean build -x test

```

### EC2에서 이미지 빌드

```
sudo docker-compose -f docker-compose.backend.prod.yml build post-service

```

### 실행

```
sudo docker-compose -f docker-compose.backend.prod.yml --env-file .env.prod up -d post-service

```

### 로그

```
sudo docker logs -f post-service

```

---

# 🔧 **11. 환경 변수 (.env.prod 예시)**

```
POST_DB_URL=jdbc:mariadb://xxx.amazonaws.com:3306/nfe_post_db
POST_DB_USER=xxxx
POST_DB_PASS=xxxx

JWT_USER_SECRET=xxxx
JWT_ADMIN_SECRET=xxxx

ATTACH_SERVICE_URL=http://attachment-service:8080
AUTH_SERVICE_URL=http://auth-service:8080

```

---

# 🌐 **12. Swagger**

```
/swagger-ui/index.html

```

---

# ⚠️ **13. 주의사항**

- 게시글 삭제 시 댓글, 태그도 함께 삭제됨
- 첨부파일은 attachment-service에서 정리되므로
    
    → post-service는 파일 ID만 관리
    
- TEMP 파일이 Confirm되지 않으면 cleanup-service가 정리
- t2.micro 성능 제약 때문에 페이지 로직 최적화 필수

---

# 📌 **14. 향후 확장 계획**

- 게시글 버전 관리(History)
- 검색 고도화 (ElasticSearch 도입 가능)
- 조회수 트래킹 캐싱
- 북마크 기능
- 좋아요 기능
- 이미지 (썸네일) 자동 생성

---

# 🎯 **15. 릴리즈 히스토리**

- v1.0 – CRUD + 댓글 + 태그
- v1.1 – attachment-service 연동
- v1.2 – 카테고리 관리
- v1.3 – Swagger 문서 추가
- v1.4 – 검색 고도화