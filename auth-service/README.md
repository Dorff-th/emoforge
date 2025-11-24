# 1) auth-service

# 🔐 **auth-service – Authentication & Authorization Backend**

Spring Boot 3 기반의 인증/인가 서비스로, emoforge 플랫폼의 핵심 엔진입니다.

Kakao OAuth2 로그인, JWT 발급/검증, 사용자 프로필 관리, 관리자 기능 등을 제공합니다.

---

# 📌 **1. 서비스 개요**

`auth-service`는 다음 기능을 담당하는 독립적인 인증 서버입니다:

- Kakao OAuth2 기반 로그인 및 자동 회원가입
- JWT Access/Refresh Token 발급
    
    (USER / ADMIN 토큰 분리)
    
- 사용자 프로필 조회/수정
    
    (닉네임 · 이메일 · 프로필 이미지)
    
- 회원 탈퇴 / 탈퇴 취소
- 관리자 전용 회원관리 API 제공
    
    (상태변경, 탈퇴여부 변경 등)
    
- 다른 서비스(Post/Diary/Attachment)에서 인증 정보를 확인할 수 있는 중앙 인증소 역할

---

# 🏗️ **2. 주요 기술 스택**

### Backend

- **Spring Boot 3.3.x**
- **Spring Security 6**
- **JPA / Hibernate**
- **JWT 기반 인증/인가**
- **Kakao OAuth2 로그인**
- **MariaDB (AWS RDS)**
- **Lombok**
- **Swagger / Springdoc**

### Infra

- Docker / Docker Compose
- AWS EC2 (t2.micro)
- AWS RDS (MySQL/MariaDB)
- Nginx Gateway (HTTPS 연동)

---

# 🗂️ **3. 디렉토리 구조**

```
auth-service/
 ├─ src/
 │   ├─ main/java/dev/emoforge/auth/
 │   │   ├─ controller/     # REST API
 │   │   ├─ service/        # 비즈니스 로직
 │   │   ├─ repository/     # JPA Repository
 │   │   ├─ entity/         # Member 엔티티
 │   │   ├─ security/       # JWT, 필터, OAuth2
 │   │   └─ dto/            # Request/Response DTO
 │   └─ resources/
 │       ├─ application.yml
 │       └─ schema.sql
 ├─ build.gradle
 ├─ Dockerfile
 ├─ README.md  ← (본 문서)
 └─ ...

```

---

# 🔑 **4. 인증 구조 요약**

### 🔸 1) Kakao OAuth2 로그인 Flow

```
auth-frontend → auth-service → Kakao API → auth-service → JWT 발급 → 프론트로 귀환

```

### 🔸 2) 발급되는 JWT

| Token 종류 | 설명 |
| --- | --- |
| **USER Access Token** | 일반 사용자 기능 |
| **USER Refresh Token** | 재발급 시 사용 |
| **ADMIN Token** | 관리자 페이지 전용 (별도 Secret key 사용) |

### 🔸 3) 인증 필터

- `JwtAuthenticationFilter`
- `JwtTokenProvider`
- `JwtValidationService`
    
    → Nginx를 거쳐 들어오는 모든 요청에서 인증 헤더를 검증
    

---

# 🧰 **5. 주요 기능 (API Overview)**

### 🔹 Kakao 로그인

```
POST /api/auth/kakao/signup
POST /api/auth/kakao

```

### 🔹 사용자 정보

```
GET    /api/auth/me
~~PUT    /api/auth/me/profile~~
PUT    /api/auth/members/nickname
PUT    /api/auth/members/email
POST   /api/auth/me/withdrawal        # 탈퇴
POST   /api/auth/me/withdrawal/cancel # 탈퇴 철회

```

### 🔹 관리자 전용

```
GET  /api/auth/admin/members
PUT  /api/auth/admin/members/{uuid}/status
PUT  /api/auth/admin/members/{uuid}/deleted

```

### 🔹 Swagger UI

> /swagger-ui/index.html
> 
> 
> Nginx를 통해 외부 접속 제한 가능.
> 

---

# 🗄️ **6. 데이터베이스 구조**

### MariaDB (AWS RDS)

DB name: **nfe_auth_db**

### 주요 테이블: `member`

| 필드 | 설명 |
| --- | --- |
| uuid (PK) | 회원 고유 식별자 |
| kakao_id | 카카오 고유 ID |
| username | 로그인 ID (이메일 기반) |
| email | 사용자 이메일 |
| nickname | 사용자 닉네임 |
| password | 랜덤 패스워드(로그인에 사용되지 않음) |
| role | USER / ADMIN |
| ~~profile_image_url~~ | ~~프로필 이미지~~ |
| deleted | 탈퇴 여부 |
| created_at / updated_at | 생성 / 수정 시간 |

---

# 🐳 **7. 빌드 & 배포**

### 1) 로컬 빌드

```
./gradlew clean build -x test

```

### 2) EC2에 업로드 후 Docker 이미지 빌드

```
sudo docker-compose -f docker-compose.backend.prod.yml build auth-service

```

### 3) 컨테이너 실행

```
sudo docker-compose -f docker-compose.backend.prod.yml --env-file .env.prod up -d auth-service

```

### 4) 로그 확인

```
sudo docker logs -f auth-service

```

---

# 🔧 **8. 환경 변수 (.env.prod 예시)**

```
DB_URL=jdbc:mariadb://xxx.amazonaws.com:3306/nfe_auth_db
DB_USERNAME=xxxx
DB_PASSWORD=xxxx

JWT_SECRET_USER=xxxx
JWT_SECRET_ADMIN=xxxx

KAKAO_CLIENT_ID=xxxx
KAKAO_CLIENT_SECRET=xxxx
KAKAO_REDIRECT_URI=https://www.emoforge.dev/auth/kakao/callback

```

---

# 🛡️ **9. 관리자(Admin) 관련 보안 요소**

- 관리자 전용 JWT는 **별도의 Secret key**로 서명
- 관리자 페이지 접근은 관리자 전용 토큰 필요
- reCAPTCHA 기반 로그인 방어(admin-frontend에서 적용)

---

# 🧪 **10. 테스트 / Swagger 문서**

- Controller & DTO 기반 Swagger 문서화 완료
- Service 로직 수준 설명도 Notion에 정리됨
- JWT 헤더 테스트는 Postman 콜렉션 제공 가능

---

# 📌 **11. 주의사항 (운영 환경)**

- t2.micro는 메모리가 매우 적어
    
    → **auth-service는 backend compose 파일에서 가장 먼저 기동하는 서비스**
    
- 카카오 OAuth2 Redirect URI는 반드시 HTTPS
- JWT Secret은 절대 GitHub에 올리면 안됨

---

# 📘 **12. 릴리즈 히스토리 (간단 버전)**

- v1.0 – JWT 로그인 구조 확립
- v1.1 – Kakao OAuth2 로그인 완성
- v1.2 – 프로필 이미지 연동 (attachment-service)
- v1.3 – 관리자 기능 추가
- v1.4 – Swagger 문서 개선
- v1.5 – Admin Token / USER Token 구조 분리

---

# 🎯 **13. 향후 개선 계획**

- 비밀번호 컬럼 제거 (현재는 랜덤값 저장)
- RefreshToken 테이블 분리
- OAuth Provider 확장 (Google, Apple)
- IP 기반 Rate-Limiting 추가 (Nginx)