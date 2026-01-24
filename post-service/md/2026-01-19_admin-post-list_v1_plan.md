# Admin 게시물 목록 기능 구현 플랜 (v1)

> 작성일: 2026-01-19
> 버전: v1
> 목적: 관리자 시점의 게시물 목록 조회 기능 상세 설계

---

## 1. 전체 호출 흐름

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Admin-FE                                       │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │ GET /api/posts/admin/posts
                                  │ ?page=1&size=10&searchType=TITLE&keyword=xxx
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AdminPostController                                 │
│  - 요청 파라미터 수신 (AdminPostSearchRequest)                               │
│  - ROLE_ADMIN 권한 검증 (SecurityConfig에서 처리)                            │
│  - Facade 호출                                                              │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     AdminPostListFacadeService                              │
│  [Step 1] Request → SearchFilterDTO 변환                                    │
│  [Step 2] PostSearchQueryService 호출 → 게시글 목록 조회                     │
│  [Step 3] AttachClient 호출 → 첨부파일 개수 조회 (Batch)                     │
│  [Step 4] AuthClient 호출 → 작성자 프로필 조회 (Batch, Cache)               │
│  [Step 5] AdminPostListItemResponse 조립                                    │
│  [Step 6] PageResponseDTO<AdminPostListItemResponse> 반환                   │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PostSearchQueryService                                │
│  - SearchFilterDTO 수신                                                     │
│  - SearchMapper (MyBatis) 호출                                              │
│  - 페이징 처리 (totalCount + 목록)                                           │
│  - 순수 조회 결과 반환 (외부 서비스 호출 없음)                                │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SearchMapper                                      │
│  - MyBatis XML 쿼리 실행                                                    │
│  - 기존 searchPostsUnified / searchPostsUnifiedCount 재사용 또는 확장       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 시퀀스 요약 (텍스트)

```
1. AdminPostController.getAdminPostList(AdminPostSearchRequest)
2.   → AdminPostListFacadeService.getPostList(AdminPostSearchRequest)
3.     → PostSearchQueryService.searchPosts(SearchFilterDTO, PageRequestDTO)
4.       → SearchMapper.searchPostsUnified(...)
5.       ← List<PostSearchResultDTO> + totalCount
6.     → AttachClient.countByPostIds(postIds)  // Batch 호출
7.     ← Map<Long, Integer> attachCounts
8.     → AuthClient.getPublicMemberProfile(uuid) // 캐싱 적용
9.     ← Map<String, PublicProfileResponse> profiles
10.    ← PageResponseDTO<AdminPostListItemResponse>
11. ← ResponseEntity<PageResponseDTO<AdminPostListItemResponse>>
```

---

## 2. 패키지 / 클래스 구성도

```
dev.emoforge.post
├── admin/
│   ├── controller/
│   │   ├── AdminCategoryController.java      [기존]
│   │   ├── AdminTestController.java          [기존]
│   │   └── AdminPostController.java          [신규] ★
│   │
│   ├── service/
│   │   ├── AdminCategoryService.java         [기존]
│   │   └── AdminPostListFacadeService.java   [신규] ★
│   │
│   └── dto/
│       ├── AdminPostSearchRequest.java       [신규] ★ 요청 파라미터
│       ├── AdminPostListItemResponse.java    [신규] ★ 응답 아이템
│       └── AdminSearchType.java              [신규] ★ 검색 타입 Enum
│
├── service/
│   ├── bff/                                  [기존 - 수정 없음]
│   │   ├── PostListFacadeService.java        [기존 - User용, 수정 금지]
│   │   └── ...
│   │
│   ├── internal/
│   │   └── PostSearchQueryService.java       [신규] ★ 공용 Query Service
│   │
│   └── external/
│       ├── AuthClient.java                   [기존 - 재사용]
│       └── AttachClient.java                 [기존 - 재사용]
│
├── mapper/
│   └── SearchMapper.java                     [기존 - 메서드 추가 가능]
│
├── dto/
│   ├── internal/
│   │   ├── SearchFilterDTO.java              [기존 - 재사용]
│   │   ├── PageRequestDTO.java               [기존 - 재사용]
│   │   └── PostSearchResultDTO.java          [신규] ★ Query 결과 DTO
│   │
│   └── bff/
│       └── PageResponseDTO.java              [기존 - 재사용]
│
└── resources/
    └── mapper/search/
        └── SearchMapper.xml                  [기존 - 쿼리 추가/수정 가능]
```

### 신규 생성 파일 목록

| 파일 | 위치 | 역할 |
|------|------|------|
| `AdminPostController.java` | `admin/controller/` | Admin 게시글 API 엔드포인트 |
| `AdminPostListFacadeService.java` | `admin/service/` | Admin 목록 조회 유스케이스 |
| `AdminPostSearchRequest.java` | `admin/dto/` | 검색 요청 파라미터 |
| `AdminPostListItemResponse.java` | `admin/dto/` | 목록 응답 아이템 |
| `AdminSearchType.java` | `admin/dto/` | 검색 타입 Enum |
| `PostSearchQueryService.java` | `service/internal/` | 공용 검색 Query 서비스 |
| `PostSearchResultDTO.java` | `dto/internal/` | Query 결과 DTO |

---

## 3. AdminPostController 설계

### 3.1 클래스 위치
```
src/main/java/dev/emoforge/post/admin/controller/AdminPostController.java
```

### 3.2 클래스 스켈레톤

```java
package dev.emoforge.post.admin.controller;

@Tag(name = "Admin Post API", description = "관리자 전용 게시글 관리 API")
@RestController
@RequestMapping("/api/posts/admin/posts")
@RequiredArgsConstructor
public class AdminPostController {

    private final AdminPostListFacadeService adminPostListFacadeService;

    /**
     * 관리자용 게시글 목록 조회
     */
    @Operation(summary = "게시글 목록 조회 (Admin)", description = "...")
    @GetMapping
    public ResponseEntity<PageResponseDTO<AdminPostListItemResponse>> getAdminPostList(
        @Valid AdminPostSearchRequest request
    ) {
        // Facade 호출
        PageResponseDTO<AdminPostListItemResponse> result =
            adminPostListFacadeService.getPostList(request);
        return ResponseEntity.ok(result);
    }
}
```

### 3.3 요청 파라미터 구조 (AdminPostSearchRequest)

```java
package dev.emoforge.post.admin.dto;

@Schema(description = "관리자 게시글 검색 요청")
public record AdminPostSearchRequest(

    @Schema(description = "검색 타입", example = "TITLE")
    AdminSearchType searchType,    // TITLE, CONTENT, TITLE_CONTENT

    @Schema(description = "검색 키워드", example = "Spring")
    String keyword,

    @Schema(description = "카테고리 ID (null이면 전체)", example = "1")
    Long categoryId,

    @Schema(description = "페이지 번호 (1부터 시작)", example = "1")
    @Min(1)
    int page,

    @Schema(description = "페이지 크기", example = "20")
    @Min(1) @Max(100)
    int size,

    @Schema(description = "정렬 기준", example = "createdAt")
    String sort,

    @Schema(description = "정렬 방향", example = "DESC")
    SortDirection direction

) {
    // 기본값 처리 (Compact Constructor)
    public AdminPostSearchRequest {
        if (page < 1) page = 1;
        if (size < 1) size = 20;
        if (sort == null || sort.isBlank()) sort = "createdAt";
        if (direction == null) direction = SortDirection.DESC;
        if (searchType == null) searchType = AdminSearchType.TITLE_CONTENT;
    }
}
```

### 3.4 검색 타입 Enum (AdminSearchType)

```java
package dev.emoforge.post.admin.dto;

public enum AdminSearchType {
    TITLE,           // 제목만
    CONTENT,         // 내용만
    TITLE_CONTENT    // 제목 + 내용 (OR)
}
```

### 3.5 응답 타입

```
ResponseEntity<PageResponseDTO<AdminPostListItemResponse>>
```

- 기존 `PageResponseDTO<T>` 제네릭 클래스 재사용
- 내부 리스트 요소는 `AdminPostListItemResponse`

---

## 4. AdminPostListFacadeService 설계

### 4.1 클래스 위치
```
src/main/java/dev/emoforge/post/admin/service/AdminPostListFacadeService.java
```

### 4.2 책임 요약

| 책임 | 설명 |
|------|------|
| Request 변환 | `AdminPostSearchRequest` → `SearchFilterDTO` |
| Query 호출 | `PostSearchQueryService`로 게시글 목록 조회 |
| 외부 서비스 조합 | Auth(작성자 프로필), Attach(첨부 개수) |
| Response 조립 | `AdminPostListItemResponse` 생성 |

### 4.3 클래스 스켈레톤

```java
package dev.emoforge.post.admin.service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminPostListFacadeService {

    private static final int PAGE_BLOCK_SIZE = 10;

    private final PostSearchQueryService postSearchQueryService;
    private final AttachClient attachClient;
    private final AuthClient authClient;

    /**
     * 관리자용 게시글 목록 조회
     */
    @Transactional(readOnly = true)
    public PageResponseDTO<AdminPostListItemResponse> getPostList(
        AdminPostSearchRequest request
    ) {
        // Step 1: Request → SearchFilterDTO 변환
        // Step 2: PostSearchQueryService 호출 → 게시글 목록 조회
        // Step 3: AttachClient 호출 → 첨부파일 개수 조회
        // Step 4: AuthClient 호출 → 작성자 프로필 조회 (캐싱)
        // Step 5: AdminPostListItemResponse 조립
        // Step 6: PageResponseDTO 생성 및 반환
    }
}
```

### 4.4 내부 처리 단계 상세

#### Step 1: Request → SearchFilterDTO 변환

```java
private SearchFilterDTO toSearchFilter(AdminPostSearchRequest request) {
    List<String> searchFields = switch (request.searchType()) {
        case TITLE -> List.of("title");
        case CONTENT -> List.of("content");
        case TITLE_CONTENT -> List.of("title", "content");
    };

    return SearchFilterDTO.builder()
        .keyword(request.keyword())
        .categoryId(request.categoryId())
        .searchFields(searchFields)
        // 기존 boolean 필드 대신 searchFields 사용
        .titleChecked(false)   // 사용 안함 (searchFields로 대체)
        .contentChecked(false)
        .commentChecked(false) // v1에서는 댓글 검색 제외
        .startDate(null)       // v1에서는 기간 검색 제외
        .endDate(null)
        .build();
}
```

#### Step 2: PostSearchQueryService 호출

```java
PageRequestDTO pageRequest = PageRequestDTO.builder()
    .page(request.page())
    .size(request.size())
    .sort(request.sort())
    .direction(request.direction())
    .build();

PostSearchResult searchResult = postSearchQueryService.searchPosts(
    searchFilter,
    pageRequest
);
// searchResult.posts(): List<PostSearchResultDTO>
// searchResult.totalCount(): int
```

#### Step 3: AttachClient 호출 (Batch)

```java
List<Long> postIds = searchResult.posts().stream()
    .map(PostSearchResultDTO::id)
    .toList();

Map<Long, Integer> attachCounts = postIds.isEmpty()
    ? Collections.emptyMap()
    : attachClient.countByPostIds(postIds);
```

#### Step 4: AuthClient 호출 (캐싱 적용)

```java
// 중복 UUID 제거
Set<String> memberUuids = searchResult.posts().stream()
    .map(PostSearchResultDTO::memberUuid)
    .collect(Collectors.toSet());

Map<String, AuthClient.PublicProfileResponse> profileCache = new HashMap<>();

for (String uuid : memberUuids) {
    try {
        profileCache.put(uuid, authClient.getPublicMemberProfile(uuid));
    } catch (Exception e) {
        log.warn("Failed to load profile for uuid={}", uuid);
        profileCache.put(uuid, new AuthClient.PublicProfileResponse("알 수 없음", null));
    }
}
```

#### Step 5: AdminPostListItemResponse 조립

```java
List<AdminPostListItemResponse> responses = searchResult.posts().stream()
    .map(post -> {
        AuthClient.PublicProfileResponse profile =
            profileCache.getOrDefault(post.memberUuid(),
                new AuthClient.PublicProfileResponse("알 수 없음", null));

        return AdminPostListItemResponse.builder()
            .id(post.id())
            .title(post.title())
            .createdAt(post.createdAt())
            .categoryId(post.categoryId())
            .categoryName(post.categoryName())
            .memberUuid(post.memberUuid())         // Admin 전용: UUID 노출
            .nickname(profile.nickname())
            .profileImageUrl(profile.profileImageUrl())
            .commentCount(post.commentCount())
            .attachmentCount(attachCounts.getOrDefault(post.id(), 0))
            .build();
    })
    .toList();
```

#### Step 6: PageResponseDTO 생성

```java
return new PageResponseDTO<>(
    pageRequest,
    searchResult.totalCount(),
    responses,
    PAGE_BLOCK_SIZE
);
```

---

## 5. PostSearchQueryService 설계

### 5.1 클래스 위치
```
src/main/java/dev/emoforge/post/service/internal/PostSearchQueryService.java
```

### 5.2 설계 원칙

| 원칙 | 설명 |
|------|------|
| **순수 Query 계층** | DB 조회만 담당, 외부 서비스 호출 없음 |
| **User/Admin 구분 없음** | 검색 조건만 받아서 실행 |
| **MyBatis 래핑** | SearchMapper 호출을 캡슐화 |
| **단일 책임** | 게시글 검색 + 페이징만 담당 |

### 5.3 클래스 스켈레톤

```java
package dev.emoforge.post.service.internal;

@Service
@RequiredArgsConstructor
public class PostSearchQueryService {

    private final SearchMapper searchMapper;

    /**
     * 게시글 검색 (페이징 포함)
     *
     * @param filter 검색 조건
     * @param pageRequest 페이징 정보
     * @return 검색 결과 (목록 + 전체 개수)
     */
    public PostSearchResult searchPosts(
        SearchFilterDTO filter,
        PageRequestDTO pageRequest
    ) {
        // 1. 목록 조회
        List<PostSearchResultDTO> posts = searchMapper.searchPostsForAdmin(
            filter,
            pageRequest
        );

        // 2. 전체 개수 조회
        int totalCount = searchMapper.searchPostsForAdminCount(filter);

        return new PostSearchResult(posts, totalCount);
    }
}
```

### 5.4 결과 래퍼 클래스

```java
package dev.emoforge.post.service.internal;

public record PostSearchResult(
    List<PostSearchResultDTO> posts,
    int totalCount
) {}
```

### 5.5 MyBatis 연계 방식

#### 옵션 A: 기존 쿼리 재사용 (권장)
- `searchPostsUnified` / `searchPostsUnifiedCount` 쿼리 그대로 사용
- `SearchFilterDTO.searchFields`로 검색 대상 지정
- 단, 기존 쿼리의 `searchFields` 로직이 AND 조건이므로 OR 조건 처리 필요

#### 옵션 B: Admin 전용 쿼리 신규 작성
- `searchPostsForAdmin` / `searchPostsForAdminCount` 신규 작성
- title + content OR 검색 로직 명확히 구현
- 향후 Admin 전용 조건 추가 용이

#### 권장: 옵션 B

기존 `searchPostsUnified`의 searchFields 처리가 `AND` 조건으로 되어 있어서
`title + content OR` 검색을 위해서는 새 쿼리가 필요합니다.

### 5.6 SearchMapper 추가 메서드

```java
// SearchMapper.java 추가
@Mapper
public interface SearchMapper {

    // 기존 메서드들...

    // [신규] Admin 게시글 목록 검색
    List<PostSearchResultDTO> searchPostsForAdmin(
        @Param("filter") SearchFilterDTO filter,
        @Param("pageRequest") PageRequestDTO pageRequest
    );

    // [신규] Admin 게시글 목록 개수
    Integer searchPostsForAdminCount(@Param("filter") SearchFilterDTO filter);
}
```

### 5.7 SearchMapper.xml 추가 쿼리 (개념)

```xml
<!-- Admin 게시글 목록 조회 -->
<select id="searchPostsForAdmin" resultType="dev.emoforge.post.dto.internal.PostSearchResultDTO">
    SELECT
        p.id,
        p.title,
        p.content,
        p.created_at AS createdAt,
        p.member_uuid AS memberUuid,
        p.category_id AS categoryId,
        c.name AS categoryName,
        (SELECT COUNT(*) FROM comment cm WHERE cm.post_id = p.id) AS commentCount
    FROM post p
        LEFT JOIN category c ON p.category_id = c.id
    WHERE 1 = 1

    <!-- 카테고리 필터 -->
    <if test="filter.categoryId != null and filter.categoryId > 0">
        AND p.category_id = #{filter.categoryId}
    </if>

    <!-- 키워드 검색 (OR 조건) -->
    <if test="filter.keyword != null and filter.keyword != ''">
        <choose>
            <!-- TITLE_CONTENT: title OR content -->
            <when test="filter.searchFields != null and filter.searchFields.size() > 1">
                AND (
                    p.title LIKE CONCAT('%', #{filter.keyword}, '%')
                    OR p.content LIKE CONCAT('%', #{filter.keyword}, '%')
                )
            </when>
            <!-- TITLE only -->
            <when test="filter.searchFields != null and filter.searchFields.contains('title')">
                AND p.title LIKE CONCAT('%', #{filter.keyword}, '%')
            </when>
            <!-- CONTENT only -->
            <when test="filter.searchFields != null and filter.searchFields.contains('content')">
                AND p.content LIKE CONCAT('%', #{filter.keyword}, '%')
            </when>
        </choose>
    </if>

    ORDER BY
        <choose>
            <when test="pageRequest.sort == 'title'">p.title</when>
            <when test="pageRequest.sort == 'viewCount'">p.view_count</when>
            <otherwise>p.created_at</otherwise>
        </choose>
        <if test="pageRequest.direction.name() == 'DESC'">DESC</if>
        <if test="pageRequest.direction.name() == 'ASC'">ASC</if>

    LIMIT #{pageRequest.size} OFFSET #{pageRequest.offset}
</select>
```

---

## 6. Admin 전용 Response DTO 설계

### 6.1 AdminPostListItemResponse

```java
package dev.emoforge.post.admin.dto;

@Schema(description = "관리자용 게시글 목록 아이템")
@Builder
public record AdminPostListItemResponse(

    @Schema(description = "게시글 ID", example = "42")
    Long id,

    @Schema(description = "게시글 제목", example = "Spring Boot 가이드")
    String title,

    @Schema(description = "작성일시")
    LocalDateTime createdAt,

    @Schema(description = "카테고리 ID", example = "1")
    Long categoryId,

    @Schema(description = "카테고리 이름", example = "Spring")
    String categoryName,

    // ===== Admin 전용 필드 =====

    @Schema(description = "작성자 UUID (Admin 전용)", example = "550e8400-e29b-41d4-a716-446655440000")
    String memberUuid,

    @Schema(description = "작성자 닉네임", example = "개발자Kim")
    String nickname,

    @Schema(description = "작성자 프로필 이미지 URL")
    String profileImageUrl,

    // ===== 통계 정보 =====

    @Schema(description = "댓글 개수", example = "5")
    Long commentCount,

    @Schema(description = "첨부파일 개수", example = "2")
    int attachmentCount

) {}
```

### 6.2 User DTO와의 차이점

| 필드 | User (PostListItemResponse) | Admin (AdminPostListItemResponse) |
|------|----------------------------|-----------------------------------|
| `memberUuid` | **없음** | **있음** (관리자가 작성자 식별용) |
| `categoryId` | **없음** | **있음** (필터링 연동용) |
| `content` (본문) | 없음 | 없음 (목록에서는 불필요) |

### 6.3 PostSearchResultDTO (Query 결과용)

```java
package dev.emoforge.post.dto.internal;

/**
 * PostSearchQueryService에서 반환하는 순수 조회 결과
 * Auth/Attach 정보 없음
 */
public record PostSearchResultDTO(
    Long id,
    String title,
    String content,          // 필요 시 본문 미리보기용
    LocalDateTime createdAt,
    String memberUuid,
    Long categoryId,
    String categoryName,
    Long commentCount        // 서브쿼리로 함께 조회
) {}
```

---

## 7. 구현 순서 제안 (Step-by-Step)

### Phase 1: DTO 및 Enum 생성

| 순서 | 파일 | 설명 |
|------|------|------|
| 1-1 | `AdminSearchType.java` | 검색 타입 Enum |
| 1-2 | `AdminPostSearchRequest.java` | 요청 파라미터 DTO |
| 1-3 | `PostSearchResultDTO.java` | Query 결과 DTO |
| 1-4 | `AdminPostListItemResponse.java` | 응답 DTO |

**검증 포인트**: 컴파일 성공 확인

---

### Phase 2: Query 계층 구현

| 순서 | 파일 | 설명 |
|------|------|------|
| 2-1 | `SearchMapper.java` | 메서드 시그니처 추가 |
| 2-2 | `SearchMapper.xml` | 쿼리 작성 |
| 2-3 | `PostSearchQueryService.java` | 공용 Query 서비스 |

**검증 포인트**:
- 단위 테스트 작성 (SearchMapper 직접 호출)
- 검색 조건별 쿼리 동작 확인
  - 키워드 없음 → 전체 조회
  - TITLE 검색
  - CONTENT 검색
  - TITLE_CONTENT OR 검색
  - 카테고리 필터
  - 페이징/정렬

---

### Phase 3: Facade 계층 구현

| 순서 | 파일 | 설명 |
|------|------|------|
| 3-1 | `AdminPostListFacadeService.java` | Facade 서비스 |

**검증 포인트**:
- 통합 테스트 (Facade 단위)
- Auth/Attach 호출 Mocking
- 응답 DTO 조립 확인

---

### Phase 4: Controller 계층 구현

| 순서 | 파일 | 설명 |
|------|------|------|
| 4-1 | `AdminPostController.java` | API 엔드포인트 |

**검증 포인트**:
- Swagger UI에서 API 확인
- Postman/curl로 실제 호출 테스트
- Admin JWT 토큰으로 인증 테스트

---

### Phase 5: 통합 검증

| 항목 | 테스트 내용 |
|------|------------|
| 권한 테스트 | User 토큰으로 접근 시 403 반환 |
| 페이징 테스트 | page=1, size=10 등 정상 동작 |
| 검색 테스트 | 각 searchType별 결과 확인 |
| 빈 결과 | 검색 결과 없을 때 빈 배열 반환 |
| 외부 서비스 장애 | Auth/Attach 호출 실패 시 fallback 동작 |

---

## 8. 설계 체크리스트

### 반드시 지켜야 할 원칙

- [x] User / Admin 목록 로직 분리 (Facade 레벨)
- [x] 공용 계층(PostSearchQueryService, Repository)만 공유
- [x] 기존 User 코드 수정 없음
- [x] Soft Delete / Status 필드 미도입 (v1)
- [x] Audit 로그 미도입 (v1)

### v2 확장 후보 (참고용)

| 기능 | 비고 |
|------|------|
| 댓글 내용 검색 | `AdminSearchType.COMMENT` 추가 |
| 기간 검색 | `startDate`, `endDate` 파라미터 |
| 작성자 UUID 검색 | 특정 회원 게시글 필터 |
| 상태 필터 | Post.status 도입 시 |
| 일괄 삭제/숨김 | 체크박스 선택 후 처리 |

---

## 9. 파일 경로 요약

### 신규 생성 파일

```
src/main/java/dev/emoforge/post/
├── admin/
│   ├── controller/
│   │   └── AdminPostController.java
│   ├── service/
│   │   └── AdminPostListFacadeService.java
│   └── dto/
│       ├── AdminSearchType.java
│       ├── AdminPostSearchRequest.java
│       └── AdminPostListItemResponse.java
│
├── service/internal/
│   └── PostSearchQueryService.java
│
└── dto/internal/
    └── PostSearchResultDTO.java
```

### 수정 파일 (추가만)

```
src/main/java/dev/emoforge/post/mapper/
└── SearchMapper.java                    # 메서드 2개 추가

src/main/resources/mapper/search/
└── SearchMapper.xml                     # 쿼리 2개 추가
```

---

*이 플랜은 실제 코드 구현, Admin-FE 연동, Swagger 문서화의 기준 문서로 사용됩니다.*
