# 📎 **attachment-service – File & Image Management Backend**

`attachment-service`는 emoforge 플랫폼 전체에서 사용하는 **이미지 및 첨부파일 관리 전용 독립 백엔드 서비스**입니다.

게시판(Post), 감정일기(Diary), 사용자 프로필(Auth) 등 모든 서비스가 여기에 파일 업로드를 요청하며,

TEMP → CONFIRMED 구조와 가비지 정리 전략을 통해 안정적인 파일관리를 제공합니다.

---

# 📌 **1. 서비스 개요**

`attachment-service`는 다음 기능을 담당합니다:

- 사용자 **프로필 이미지 업로드/삭제**
- 게시판 **일반 첨부파일 업로드/다운로드**
- ToastUI 에디터에서 사용하는 **에디터 이미지 업로드**
- **TEMP → CONFIRMED** 파일 관리 전략
    
    (게시글·일기 작성 중 업로드된 파일 → 실제 저장 시 Confirm)
    
- 사용되지 않는 이미지 및 파일 정리(Garbage Collection)
- 각 서비스(Auth / Post / Diary)와 통합 인증 (JWT 기반)
- Nginx를 통한 public URL 제공

이 서비스는 emoforge 플랫폼의 모든 파일 처리를 담당하는 **공통 파일 저장소** 역할을 합니다.

---

# 🏗️ **2. 주요 기술 스택**

### Backend

- **Spring Boot 3.3.x**
- **Spring Security**
- **JPA / Hibernate**
- **MariaDB (AWS RDS)** – `nfe_file_db`
- **Lombok**

### Infra

- Docker
- Docker Compose
- AWS RDS
- Nginx Static Resource Handler
- Certbot HTTPS 구성에서 Serving URL 연계

---

# 🗂️ **3. 디렉토리 구조**

```
attachment-service/
 ├─ src/
 │   ├─ main/java/dev/emoforge/attach/
 │   │   ├─ controller/     # 업로드/조회/삭제 API
 │   │   ├─ service/        # 파일 처리 + 저장 로직
 │   │   ├─ repository/     # Attachment 엔티티 조회
 │   │   ├─ entity/         # 첨부파일 엔티티
 │   │   ├─ dto/            # Request/Response DTO
 │   │   ├─ config/         # WebConfig(정적 파일 serving)
 │   │   └─ security/       # JWT 검증
 │   └─ resources/
 │       ├─ application.yml
 │       └─ schema.sql
 ├─ uploads/ (로컬 또는 volume)
 ├─ Dockerfile
 └─ README.md  ← (본 문서)

```

---

# 🗄️ **4. 데이터베이스 구조**

DB name: **nfe_file_db**

### 📌 `attachment` 테이블 주요 컬럼

| 필드명 | 타입 | 설명 |
| --- | --- | --- |
| **id (PK)** | bigint(20) | 고유 ID (auto_increment) |
| **post_id** | bigint(20) | 연결된 게시글 ID (게시판 첨부파일용, diary-service는 사용 X) |
| **member_uuid** | varchar(255) | 업로드한 사용자 UUID |
| **file_name** | varchar(255) | 저장된 파일명 |
| **origin_file_name** | varchar(255) | 원본 파일명 |
| **file_url** | varchar(255) | 내부 파일 시스템 경로(로컬용) |
| **public_url** | varchar(255) | 외부에서 접근 가능한 URL (Nginx ResourceHandler 경로) |
| **file_type** | varchar(100) | MIME Type 또는 확장자 |
| **file_size** | bigint(20) | 파일 크기(Byte) |
| **upload_type** | enum('ATTACHMENT','EDITOR_IMAGE','PROFILE_IMAGE') | 업로드 유형(첨부파일/에디터 이미지/프로필 이미지) |
| **uploaded_at** | datetime | 업로드된 날짜 (기본값: current_timestamp) |
| **deleted** | tinyint(1) | 삭제 여부 플래그(0=정상, 1=삭제) |
| **status** | varchar(255) | 파일 상태(TEMP / CONFIRMED 등) |
| **temp_key** | varchar(255) | TEMP 업로드 시 개별 파일 키 |
| **created_at** | datetime(6) | 생성일 |

---

# 🔧 **5. 파일 저장 구조**

### 📁 실제 파일 저장 위치

(EC2 내부 Docker Volume 기준)

```
/home/ec2-user/emoforge/uploads/
 ├─ profile_image/
 ├─ editor_images/
 └─ attachments/

```

Nginx WebConfig에서:

```
/uploads/editor_images/**  → editor_image_base_dir
/uploads/profile_image/**  → profile_image_base_dir

```

이렇게 매핑해서 public URL 접근을 지원합니다.

---

# ♻️ **6. TEMP → CONFIRMED 구조 (핵심 전략)**

Attachment-Service의 가장 중요한 기능!

1. 사용자가 게시글/일기를 작성하면서 이미지를 업로드 → TEMP 상태로 기록
2. 실제 게시글/일기 저장 시 TEMP를 CONFIRMED로 전환
3. 저장이 취소되거나 삭제되면 TEMP 파일은 버려짐

이 구조 덕분에:

- 불필요한 파일이 쌓이지 않고
- orphan(주인없는) 이미지 정리가 쉬우며
- 에디터에서 취소했을 때 잘못된 파일이 남지 않음

---

# 🔐 **7. 인증 구조**

Attachment-Service는 emoforge의 가상 BFF 구조에 따라:

- URL 접근은 Allowed
- 실제 API 요청은 **Authorization: Bearer {JWT}** 필요
- USER Token / ADMIN Token 모두 사용 가능

Auth-Service에서 발급한 JWT를 받아

`JwtAuthenticationFilter` 에서 검증 후 Controller로 전달합니다.

---

# 🧰 **8. 주요 API**

### 🔹 1) 프로필 이미지 업로드/~~삭제~~

```
POST /api/attach?upload_type=PROFILE_IMAGE
~~DELETE /api/attachments/profile~~

```

### 🔹 2) 게시판 첨부파일 업로드 (파일 첨부)

```
POST /api/attach?upload_type=ATTACHMENT

```

### 🔹 3) ToastUI 에디터 이미지 업로드

```
POST /api/attach?upload_type=EDITOR_IMAGE

```

### 🔹 4) 첨부파일 조회

```
GET /api/attach/download/{id}

```

### 🔹 5) TEMP → CONFIRMED

(게시글 저장 시 Post-Service에서 호출)

```
POST /api/attach/confirm

```

---

# 🧽 **9. 가비지 삭제(Garbage Cleanup)**

별도로 운영하는 **cleanup-service**가 attachment-service DB를 기준으로 다음을 제거함:

- 더 이상 사용되지 않는 프로필 이미지 파일
- group_temp_key나 temp_key만 존재하는 orphan 이미지
- 에디터에서 업로드했지만 Confirm되지 않은 이미지들

정리 규칙은 다음을 포함:

- 동일 member_uuid의 PROFILE_IMAGE 중 최신 1개만 남김
- 에디터 이미지 중 postId/diaryId에 연결되지 않은 파일 삭제

---

# 🐳 **10. Docker 빌드 & 배포**

로컬 빌드:

```
./attachment-service/gradlew clean build -x test

```

EC2에서 Docker 이미지 빌드:

```
sudo docker-compose -f docker-compose.backend.prod.yml build attachment-service

```

컨테이너 실행:

```
sudo docker-compose -f docker-compose.backend.prod.yml --env-file .env.prod up -d attachment-service

```

로그 확인:

```
sudo docker logs -f attachment-service

```

---

# 🔧 **11. 환경 변수 (.env.prod 예시 - 자세한것은 ../docker-compose.backend.prod.yml 참조)**

```
DB_URL=jdbc:mariadb://xxx.amazonaws.com:3306/nfe_file_db
DB_USERNAME=xxxx
DB_PASSWORD=xxxx

FILE_UPLOAD_BASE=/home/ec2-user/emoforge/uploads
FILE_PUBLIC_URL=https://www.emoforge.dev/uploads/

JWT_USER_SECRET=xxxx
JWT_ADMIN_SECRET=xxxx

```

---

# 🌐 **12. Nginx Static Resource 매핑 (중요)**

`WebConfig.java` 의 설정과 Nginx가 반드시 일치해야 함.

Nginx example:

```
 location /api/attach {
        proxy_pass http://attachment-service:8082;
        rewrite ^/api/attach/(uploads/.*)$ /$1 break;  # ✅ uploads만 rewrite
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
    }

```

파일 public_url 예시:

- [https://www.emoforge.dev/api/attach/uploads/profile_image/](https://www.emoforge.dev/api/attach/uploads/profile_image/0aa1035a244f4cf8aeea484f2a6f598a.png)xya.png
- [https://www.emoforge.dev/api/attach/uploads/images/](https://www.emoforge.dev/api/attach/uploads/images/dfd5b702c0ec425fbf4a0e08baae2daa.png)zyx.png

---

# 📘 **13. Swagger 문서**

Swagger UI 경로:

```
/swagger-ui/index.html

```

(Swagger 활성화는 프록시 내부에서만 노출하도록 운영환경에서는 제한 가능)

---

# ⚠️ **14. 주의사항**

- 프로필 이미지는 항상 가장 최신 1개만 유지
- group_temp_key / temp_key가 너무 많아지면 cleanup-service 실행 필수
- 파일명은 UUID 기반으로 자동생성됨 → 충돌 없음
- t2.micro 환경에서는 대용량 이미지 처리 주의
- 에디터 이미지가 많을수록 orphan 확률 증가 → 주기적 정리 필요

---

# 📌 **15. 향후 확장 계획**

- S3 업로드 전환 (현재는 EC2 로컬 스토리지)
- CloudFront CDN 연계
- 파일 크기/확장자 백엔드 필터링 강화
- 이미지 리사이징 자동화
- 서버 압박 시 파일 저장소 분리 (attachment-service-only EC2)