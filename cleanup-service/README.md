# 🧹 **cleanup-service – Attachment Garbage Collector (Spring Boot)**

*emoforge 플랫폼의 파일 정리 전용 독립 실행형 서비스*

---

`cleanup-service`는 emoforge 플랫폼에서

“프로필 이미지 / 에디터 이미지 / 첨부파일” 등의 **고아 데이터(Orphan Files)** 를 자동 정리하는

독립적인 Spring Boot 기반 CLI 서비스이다.

Docker Compose에 포함되지 않으며,

EC2 내부에서 단독 실행하는 방식으로 동작한다.

---

# 📌 **1. 주요 목적**

- TEMP 상태로 남은 첨부파일 정리
- 삭제된 게시글/일기와 연결된 파일 정리
- 프로필 이미지 교체 시 이전 이미지 제거
- DB에는 없지만 로컬 디스크에 남아있는 고아 파일 삭제
- 첨부파일 저장소의 용량 절약
- EC2 t2.micro 환경에서 저장소 누적 방지

**핵심 요약:**

> “attachment-service가 사용하는 실제 파일 저장소를 주기적으로 깨끗하게 청소하는 백엔드 유틸리티”
> 

---

# 🏗️ **2. 기술 스택**

- Spring Boot 3
- Spring Data JPA
- MariaDB (AWS RDS)
- Lombok
- Shell Script Wrapper (`cleanup.sh`)
- 독립 실행형(Java CLI) 서비스 구조

---

# 🔧 **3. 클린업 대상 종류**

## 1) 프로필 이미지 정리 (`profile`)

### 정리 대상:

- 최신 이미지 1개 제외하고 모든 이전 프로필 이미지 삭제
- DB(member.profile_image_url)와 실제 파일 불일치되는 경우 삭제
- 파일은 있으나 DB에 존재하지 않는 경우 삭제

→ “사용자가 프로필 이미지 여러 번 변경했을 때 쌓이는 파일을 정리”

---

## 2) 에디터 이미지 정리 (`editor`)

### 정리 대상:

- TEMP 상태에서 CONFIRM 되지 않은 파일
- 게시글/일기에서 더 이상 사용되지 않는 이미지
- editor_images 디렉토리에 남아있는 고아 파일

→ “ToastUI 마크다운 에디터가 업로드한 이미지를 정리”

---

## 3) 첨부파일 정리 (구현예정)

게시글의 첨부파일(ATTACHMENT) 중:

- 게시글이 삭제되었는데 파일만 남은 경우
- DB에는 없는데 디스크에만 존재하는 경우
- 업로드 중 실패하거나 TEMP로만 남은 파일

---

# 🗂️ **4. 디렉토리 구조**

```
cleanup-service/
 ├─ src/main/java/dev/emoforge/cleanup/
 │   ├─ runner/              # 실행 로직
 │   ├─ service/             # clean 로직 구현
 │   ├─ repository/          # DB 쿼리
 │   ├─ entity/              # Attachment 엔티티
 │   ├─ util/                # 파일 삭제 유틸
 │   └─ config/              # 설정
 ├─ cleanup.sh               # 실행 스크립트
 ├─ build.gradle
 └─ README.md  ← (본 문서)

```

---

# 🚀 **5. 실행 방법**

cleanup-service는 웹 서비스가 아니라

**한 번 실행하고 종료되는 배치형 스크립트**이다.

### 1) 빌드

로컬에서 빌드:

```
./cleanup-service/gradlew clean build -x test

```

EC2로 jar 업로드:

```
scp build/libs/cleanup-service.jar ec2-user@your-ec2:/home/ec2-user/emoforge/cleanup-service

```

---

### 2) 실행 (profile 이미지 정리)

```
./cleanup-service/cleanup.sh profile

```

### 3) 실행 (editor 이미지 정리)

```
./cleanup-service/cleanup.sh editor

```

### 4) 실행 로그

```
tail -f cleanup.log

```

---

# ⚙️ **6. cleanup.sh 구조**

```bash
#!/bin/bash

PROFILE=$1

if [ "$PROFILE" = "profile" ]; then
  java -jar cleanup-service.jar --task=profile
elif [ "$PROFILE" = "editor" ]; then
  java -jar cleanup-service.jar --task=editor
else
  echo "Usage: cleanup.sh [profile|editor]"
fi

```

---

# 🔗 **7. attachment-service와의 관계**

첨부파일 관리 구조는 다음과 같다:

```
attachment-service
       ↓ DB
uploads/profile_image/
uploads/editor_images/
uploads/attachments/
       ↓
cleanup-service (주기적 정리)

```

cleanup-service는 attachment-service의

로컬 저장소 디렉토리를 직접 스캔하고,

DB 조회 후 필요 없는 파일 삭제한다.

---

# 🔍 **8. 내부 정리 로직 (요약)**

### 프로필 이미지 (예시)

```
SELECT max(id) FROM attachment WHERE member_uuid = ?
→ 최신 프로필 이미지 1개만 KEEP
→ 나머지는 파일 삭제 & DB 삭제

```

### 에디터 이미지 (예시)

```
SELECT path FROM attachment WHERE upload_type = 'EDITOR_IMAGE'
→ 디스크 전체 이미지 스캔
→ DB에 없는 파일 = 삭제

```

### 첨부파일 고아데이터 (예시)

```
SELECT * FROM attachment WHERE post_id IS NULL
→ 파일 삭제

```

---

# 📦 **9. 환경 변수 예시**

```
FILES_BASE_DIR=/home/ec2-user/emoforge/uploads
SPRING_DATASOURCE_URL=jdbc:mariadb://xxx...
SPRING_DATASOURCE_USERNAME=xxx
SPRING_DATASOURCE_PASSWORD=xxx

```

---

# ⚠️ **10. 주의사항**

- cleanup-service는 Docker Compose 포함 X → **직접 실행 서비스**
- 삭제 로직이므로 *테스트 후 운영 적용 필수*
- 잘못된 매핑은 중요한 사용자 파일 삭제 가능
- 백업 환경 존재하면 더욱 안전
- t2.micro는 파일 수가 많으면 스캔 중 CPU spike 발생 가능

---

# 🚀 **11. 향후 개선 계획**

- 자동 스케줄러(Cron) 기능 도입
- 삭제 보고서 자동 생성(JSON/Slack 연동)
- S3 기반 스토리지로 전환 시 멀티파트 삭제 기능 추가
- TEMP 파일 retention 기간 설정(예: 3일)
- LangGraph-Frontend 에디터 이미지 사용량 분석 연계