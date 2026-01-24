# Post-Service Backend 분석 리포트

> 작성일: 2026-01-19
> 목적: Admin 게시판 관리 기능 설계를 위한 기초 분석
> 분석자: AI Architect

---

## 1. 서비스 개요 요약

### 1.1 기술 스택
| 항목 | 기술 |
|------|------|
| Framework | Spring Boot |
| ORM | JPA (Spring Data JPA) |
| 검색 | MyBatis (SearchMapper) - 복잡한 검색 쿼리용 |
| 외부 통신 | OpenFeign (Auth-Service, Attach-Service) |
| 인증 | JWT (User/Admin 분리된 Secret Key) |
| API 문서 | Swagger/OpenAPI 3.0 |

### 1.2 패키지 구조

```
dev.emoforge.post
├── admin/
│   ├── controller/     # Admin 전용 컨트롤러 (AdminCategoryController, AdminTestController)
│   └── service/        # Admin 전용 서비스 (AdminCategoryService)
├── config/             # Security, JWT, CORS, Feign 설정
├── controller/         # 일반 사용자 API 컨트롤러
├── domain/             # JPA 엔티티 (Post, Comment, Category, Tag, PostTag)
├── dto/
│   ├── bff/            # BFF 응답 DTO (조합된 응답)
│   ├── external/       # 외부 서비스 연동 DTO
│   └── internal/       # 내부 처리용 DTO
├── mapper/             # MyBatis Mapper (SearchMapper)
├── repository/         # Spring Data JPA Repository
├── service/
│   ├── bff/            # Facade 서비스 (BFF 패턴)
│   ├── external/       # Feign Client (AuthClient, AttachClient)
│   └── internal/       # 순수 비즈니스 로직 서비스
└── util/               # 유틸리티 클래스
```

### 1.3 외부 서비스 의존 포인트

| 외부 서비스 | 클라이언트 | 주요 호출 목적 |
|-------------|-----------|----------------|
| Auth-Service | `AuthClient` | 사용자 프로필 조회 (닉네임, 프로필 이미지) |
| Attach-Service | `AttachClient` | 첨부파일 개수/목록 조회, 첨부파일 삭제 |

---

## 2. 게시글(Post) 도메인 분석

### 2.1 Post 엔티티 필드 요약

| 필드 | 타입 | 설명 | 특이사항 |
|------|------|------|----------|
| `id` | Long | PK, Auto Increment | - |
| `title` | String(200) | 게시글 제목 | NOT NULL |
| `content` | TEXT | 게시글 본문 | NOT NULL |
| `viewCount` | int | 조회수 | 기본값 0 |
| `createdAt` | LocalDateTime | 생성일시 | `@CreationTimestamp`, 수정 불가 |
| `updatedAt` | LocalDateTime | 수정일시 | `@LastModifiedDate` |
| `memberUuid` | String(36) | 작성자 UUID | NOT NULL, 수정 불가 |
| `categoryId` | Long | 카테고리 FK | NOT NULL |
| `postTags` | List<PostTag> | 태그 관계 | `@OneToMany`, LAZY |

### 2.2 삭제 방식

| 항목 | 현재 구현 |
|------|----------|
| **삭제 방식** | **Hard Delete** |
| 삭제 메서드 | `postRepository.deleteById(id)` |
| Soft Delete 필드 | **없음** (deleted, deletedAt 등 부재) |

**분석 결과:**
- 현재 Soft Delete가 구현되어 있지 않음
- Admin 기능에서 "숨김/블라인드" 처리를 위해서는 **상태 필드 추가 필요**

### 2.3 상태값(Status/Flag) 존재 여부

| 엔티티 | 상태 필드 | 현황 |
|--------|----------|------|
| Post | status, hidden, blocked 등 | **없음** |
| Comment | status 등 | **없음** |
| Category | `defaultCategory` (boolean) | 기본 카테고리 여부만 존재 |

**분석 결과:**
- 게시글/댓글에 대한 상태 관리 필드가 없음
- Admin 관리 기능 구현 시 상태 필드 도입 검토 필요

### 2.4 작성자 식별 방식

```java
@Column(name = "member_uuid", nullable = false, length = 36, updatable = false)
private String memberUuid;
```

- **UUID 기반 식별**: Auth-Service의 Member UUID를 저장
- JWT에서 추출한 `uuid`와 비교하여 권한 검증
- 수정 불가(`updatable = false`)로 설정되어 작성자 변경 방지

---

## 3. 현재 게시글 목록/조회 로직 분석

### 3.1 목록 조회 API 구조

| API | 메서드 | 설명 |
|-----|--------|------|
| `GET /api/posts` | `PostController.getPostList()` | 전체 게시글 목록 (페이징) |
| `GET /api/posts/tags/{tagName}` | `PostController.getPostListByTag()` | 특정 태그 기반 목록 |
| `GET /api/posts/{id}` | `PostController.getPost()` | 게시글 상세 조회 |

### 3.2 BFF(Facade) 패턴 적용 현황

```
PostController
    ├── PostListFacadeService     → Post + Auth + Attach 조합
    ├── PostDetailFacadeService   → Post + Auth + Attach 조합
    ├── PostDeleteFacadeService   → Post + Comment + PostTag + Attach 일괄 삭제
    └── CommentsFacadeService     → Comment + Auth 조합
```

**현재 BFF 서비스 역할:**
- `PostListFacadeService`: 목록 조회 시 작성자 프로필 + 첨부파일 개수 조합
- `PostDetailFacadeService`: 상세 조회 시 작성자 프로필 + 첨부파일 목록 조합
- `PostDeleteFacadeService`: 삭제 시 관련 데이터(태그, 댓글, 첨부) 일괄 삭제
- `CommentsFacadeService`: 댓글 조회 시 작성자 프로필 조합

### 3.3 검색 조건

**JPA Repository 기반:**
| 메서드 | 검색 조건 |
|--------|----------|
| `findAllPosts()` | 전체 조회 (카테고리 JOIN) |
| `findAllPostsByTag()` | 태그명 필터링 |
| `findAllByCategoryId()` | 카테고리 ID 필터링 |
| `findAllByMemberUuid()` | 작성자 UUID 필터링 |

**MyBatis (SearchMapper) 기반:**
| 메서드 | 검색 조건 |
|--------|----------|
| `searchPostsByKeyword()` | 키워드 검색 |
| `searchFilteredPostsWithPaging()` | 복합 필터 (제목/내용/댓글, 카테고리, 기간) |
| `searchPostsUnified()` | 통합 검색 |

**SearchFilterDTO 필드:**
- `keyword`: 검색어
- `titleChecked`, `contentChecked`, `commentChecked`: 검색 대상 선택
- `categoryId`: 카테고리 필터
- `startDate`, `endDate`: 기간 필터

### 3.4 페이징 처리 방식

**PageRequestDTO:**
```java
public record PageRequestDTO(
    int page,      // 1부터 시작
    int size,      // 기본값 10
    String sort,   // 기본값 "id"
    SortDirection direction  // 기본값 DESC
)
```

**PageResponseDTO:**
- UI 페이지네이션을 위한 계산된 값 포함
- `startPage`, `endPage`, `prev`, `next` 등

### 3.5 정렬 기준

- 기본 정렬: `id DESC` (최신순)
- 클라이언트 지정 가능: `sort` + `direction` 파라미터

---

## 4. 권한 관점 분석

### 4.1 현재 Security 설정 구조

```java
// SecurityConfig.java - 두 개의 FilterChain 분리

@Order(1) - adminFilterChain
├── securityMatcher: "/api/posts/admin/**"
├── 권한: hasRole("ADMIN")
└── JWT 검증: Admin용 Secret Key

@Order(2) - filterChain (일반 사용자)
├── GET /api/posts/** : permitAll()
├── POST/PUT/DELETE /api/posts/** : authenticated()
└── JWT 검증: User용 Secret Key
```

### 4.2 사용자(User) 기준 로직

| 기능 | 권한 체크 방식 |
|------|---------------|
| 게시글 작성 | JWT 인증 필수 |
| 게시글 수정 | JWT UUID == Post.memberUuid |
| 게시글 삭제 | JWT UUID == Post.memberUuid |
| 게시글 조회 | 누구나 가능 (permitAll) |

**PostController에서의 권한 체크 예시:**
```java
// 수정 시
if(!memberUuid.equals(dto.authorUuid())) {
    throw new AccessDeniedException("권한이 없습니다.");
}

// 삭제 시
if(!memberUuid.equals(post.getMemberUuid())) {
    throw new AccessDeniedException("권한이 없습니다.");
}
```

### 4.3 Admin 관점에서의 재사용성 분석

| 영역 | 재사용 가능 | 분리 필요 | 비고 |
|------|-------------|----------|------|
| **Repository 계층** | O | - | 대부분 그대로 사용 가능 |
| **PostService (CRUD)** | △ | O | 권한 체크 없이 사용하려면 분리 필요 |
| **BFF Facade Services** | O | - | 조회 로직은 재사용 가능 |
| **SearchMapper** | O | - | 검색 로직 재사용 가능 |
| **Controller 계층** | X | O | Admin 전용 Controller 필요 |

### 4.4 Admin 기능 추가 시 충돌 가능성

1. **권한 체크 로직 충돌**
   - 현재 `PostController`의 수정/삭제 로직에 "본인 확인" 로직이 하드코딩됨
   - Admin은 타인 게시글도 수정/삭제 가능해야 함
   - **해결 방안**: Admin 전용 Controller 분리 또는 권한별 분기 처리

2. **삭제 로직 차이**
   - User: Hard Delete (완전 삭제)
   - Admin: Soft Delete (숨김/블라인드) 필요 가능성
   - **해결 방안**: 상태 필드 추가 및 별도 삭제 로직 구현

3. **조회 범위 차이**
   - User: 공개된 게시글만 조회
   - Admin: 숨김/블라인드 게시글 포함 전체 조회 필요
   - **해결 방안**: 상태 필터 조건 추가

---

## 5. Admin 게시판 관리 관점에서의 분석

### 5.1 현재 구조에서 재사용 가능한 Service

| Service | 재사용 가능 기능 | 비고 |
|---------|-----------------|------|
| `PostListFacadeService` | 목록 조회 로직 (프로필 조합) | Admin용 파라미터 확장 필요 |
| `PostDetailFacadeService` | 상세 조회 로직 | 그대로 사용 가능 |
| `CommentsFacadeService` | 댓글 조회 로직 | 그대로 사용 가능 |
| `SearchMapper` | 복합 검색 로직 | Admin 필터 조건 추가 필요 |

### 5.2 분리하는 것이 자연스러운 영역

| 영역 | 분리 이유 |
|------|----------|
| **AdminPostController** | 권한 체크 로직이 다름 (본인 확인 불필요) |
| **AdminPostService** | 삭제/숨김 처리 로직이 다름 |
| **AdminPostListService** | 전체 게시글 조회 (숨김 포함), 사용자별 필터링 |

### 5.3 Admin 전용 기능으로 예상되는 항목

| 기능 | 현재 상태 | 필요 조치 |
|------|----------|----------|
| 전체 게시글 조회 | `findAllPosts()` 존재 | 상태 필터 추가 필요 |
| 사용자별 게시글 필터링 | `findAllByMemberUuid()` 존재 | Admin Controller에서 호출 |
| 숨김/블라인드 처리 | **미구현** | Post 엔티티에 status 필드 추가 필요 |
| 삭제 처리 | Hard Delete만 존재 | Soft Delete 옵션 추가 검토 |
| 신고/비정상 게시글 관리 | **미구현** | 신고 도메인 신규 설계 필요 |

### 5.4 Admin API 배치 옵션별 장단점

#### Option A: 기존 Post-Service 내부에 Admin API 추가

**장점:**
- 동일한 Repository/Service 재사용 용이
- 배포 단위 단순화 (단일 서비스)
- 현재 `admin` 패키지 구조 이미 존재 (AdminCategoryController 등)

**단점:**
- User/Admin 로직 혼재 가능성
- 권한 분리 로직이 복잡해질 수 있음
- 서비스 규모 증가에 따른 관리 복잡도 증가

#### Option B: 별도 Admin 전용 Facade/Service로 분리

**장점:**
- 관심사 명확 분리 (SRP 원칙)
- Admin 전용 비즈니스 로직 독립적 관리
- 테스트 용이성 향상

**단점:**
- 일부 코드 중복 가능성
- 서비스 간 호출 구조 복잡화
- 별도 배포 필요 시 운영 복잡도 증가

**권장 방안:**
현재 구조(`admin` 패키지 분리)를 유지하면서 **Post-Service 내부에 Admin 기능 추가**하는 방식이 적합함. 이미 `AdminCategoryController`/`AdminCategoryService` 패턴이 존재하므로 동일한 패턴으로 `AdminPostController`/`AdminPostService` 추가.

---

## 6. 현재 구조의 장점

1. **명확한 계층 분리**
   - Controller → Facade(BFF) → Service → Repository 패턴 일관성
   - internal/external/bff DTO 분리로 계층 간 책임 명확

2. **BFF 패턴 적용**
   - 여러 서비스 응답을 조합하는 Facade 서비스 존재
   - 프론트엔드 요구사항에 맞는 응답 구조 제공

3. **Admin 패키지 기반 구조**
   - `admin.controller`, `admin.service` 패키지 이미 존재
   - Admin 기능 확장을 위한 구조적 기반 마련됨

4. **Security 설정 분리**
   - User/Admin 별도 FilterChain 및 JWT Secret 분리
   - `/api/posts/admin/**` 경로에 대한 ROLE_ADMIN 권한 적용 완료

5. **유연한 검색 기능**
   - JPA + MyBatis 혼합 사용으로 복잡한 검색 쿼리 지원
   - `SearchFilterDTO`를 통한 복합 조건 검색 가능

---

## 7. Admin 기능 관점에서의 구조적 한계

1. **상태 관리 필드 부재**
   - Post/Comment 엔티티에 status, hidden, blocked 등 필드 없음
   - 숨김/블라인드 처리를 위한 상태 필드 추가 필요

2. **Soft Delete 미구현**
   - 현재 Hard Delete만 존재
   - Admin 삭제 시 복구 가능성을 위한 Soft Delete 검토 필요

3. **권한 체크 로직 분산**
   - Controller에서 직접 `memberUuid` 비교 수행
   - Admin은 다른 권한 로직 필요 (타인 게시글 접근 가능)

4. **신고 기능 미구현**
   - 신고(Report) 도메인/엔티티 없음
   - 비정상 게시글 관리를 위한 신규 설계 필요

5. **Audit 로그 부재**
   - Admin 작업에 대한 감사 로그 기록 기능 없음
   - 관리 행위 추적을 위한 Audit 테이블 검토 필요

---

## 8. Admin 게시판 관리 기능을 위한 설계 방향 제안

### 8.1 권장 아키텍처 방향

```
Post-Service
├── controller/              # 일반 User API (기존)
├── admin/
│   ├── controller/
│   │   ├── AdminCategoryController  (기존)
│   │   ├── AdminPostController      (신규)
│   │   └── AdminCommentController   (신규)
│   └── service/
│       ├── AdminCategoryService     (기존)
│       ├── AdminPostService         (신규)
│       └── AdminCommentService      (신규)
├── service/
│   ├── bff/                 # 재사용 가능한 Facade (기존)
│   └── internal/            # 순수 비즈니스 로직 (기존)
└── repository/              # 공통 Repository (기존 + 확장)
```

### 8.2 엔티티 확장 방향 (예시)

```java
// Post 엔티티 확장 제안
@Entity
public class Post {
    // ... 기존 필드 ...

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostStatus status = PostStatus.ACTIVE;  // 신규

    @Column
    private LocalDateTime deletedAt;  // Soft Delete용

    @Column
    private String deletedBy;  // 삭제 수행자 (Admin UUID)
}

public enum PostStatus {
    ACTIVE,     // 정상 공개
    HIDDEN,     // 숨김 (작성자만 볼 수 있음)
    BLOCKED,    // 블라인드 (관리자에 의해 차단)
    DELETED     // 삭제됨 (Soft Delete)
}
```

### 8.3 Admin API 설계 방향 (예시)

| API | 메서드 | 설명 |
|-----|--------|------|
| `GET /api/posts/admin/posts` | 전체 게시글 조회 | 상태 필터, 사용자 필터, 기간 필터 포함 |
| `GET /api/posts/admin/posts/{id}` | 게시글 상세 (Admin용) | 숨김/차단 게시글도 조회 가능 |
| `PATCH /api/posts/admin/posts/{id}/status` | 게시글 상태 변경 | ACTIVE/HIDDEN/BLOCKED 전환 |
| `DELETE /api/posts/admin/posts/{id}` | 게시글 삭제 | Soft Delete 또는 Hard Delete |
| `GET /api/posts/admin/posts/member/{memberUuid}` | 특정 회원 게시글 조회 | 회원별 게시글 필터링 |

---

## 9. 다음 단계로 진행하면 좋은 작업 제안

### Step 1: 엔티티 및 데이터 모델 확장 설계
1. Post 엔티티에 `status` 필드 추가 설계
2. Soft Delete를 위한 `deletedAt`, `deletedBy` 필드 설계
3. DB 마이그레이션 스크립트 준비
4. (선택) Report(신고) 엔티티 설계

### Step 2: Admin Post API 설계 및 구현
1. `AdminPostController` 생성
   - 전체 게시글 목록 조회 (필터 포함)
   - 게시글 상태 변경 API
   - 게시글 삭제 API (Soft Delete)
2. `AdminPostService` 생성
   - 권한 체크 없이 게시글 접근
   - 상태 변경 로직
   - 삭제 로직 (Soft/Hard 옵션)
3. Repository 메서드 확장
   - 상태별 조회 쿼리
   - 사용자별 + 상태별 복합 조회

### Step 3: Admin Comment API 설계 및 구현
1. `AdminCommentController` 생성
2. `AdminCommentService` 생성
3. 댓글 숨김/삭제 기능

### Step 4: Admin-FE 연동 및 테스트
1. Admin-FE에서 호출할 API 스펙 확정
2. Swagger 문서 업데이트
3. 통합 테스트 수행

### Step 5: (선택) 신고 기능 설계
1. Report 엔티티 설계
2. 신고 API 설계
3. 신고된 게시글 관리 화면 설계

---

## 10. 부록: 주요 파일 참조 위치

| 파일 | 경로 |
|------|------|
| Post 엔티티 | `src/main/java/dev/emoforge/post/domain/Post.java` |
| PostController | `src/main/java/dev/emoforge/post/controller/PostController.java` |
| PostService | `src/main/java/dev/emoforge/post/service/internal/PostService.java` |
| PostRepository | `src/main/java/dev/emoforge/post/repository/PostRepository.java` |
| PostListFacadeService | `src/main/java/dev/emoforge/post/service/bff/PostListFacadeService.java` |
| SecurityConfig | `src/main/java/dev/emoforge/post/config/SecurityConfig.java` |
| AdminCategoryController | `src/main/java/dev/emoforge/post/admin/controller/AdminCategoryController.java` |
| AdminCategoryService | `src/main/java/dev/emoforge/post/admin/service/AdminCategoryService.java` |
| SearchMapper | `src/main/java/dev/emoforge/post/mapper/SearchMapper.java` |

---

*이 분석 리포트는 Admin-FE 게시판 관리 기능 설계 및 BFF/Admin 전용 API 분리 여부 판단을 위한 기준 자료로 활용될 예정입니다.*
