# Phase 2 변경 내역 - Query 계층 중립성 확보 리팩토링

> 작성일: 2026-01-19
> 목적: 공용 Query 계층의 Context 중립성 확보

---

## 1. 삭제된 클래스

| 파일 | 경로 | 삭제 이유 |
|------|------|----------|
| `AdminPostSearchRequest.java` | `admin/dto/` | Query 계층에 HTTP/Admin 컨텍스트 침투 |
| `AdminSearchType.java` | `admin/dto/` | Admin 전용 Enum, Query 계층 중립성 위반 |
| `AdminPostListItemResponse.java` | `admin/dto/` | Admin 전용 응답 DTO, Phase 3에서 재생성 필요 |

---

## 2. 수정된 파일

### 2.1 SearchMapper.java

**경로**: `src/main/java/dev/emoforge/post/mapper/SearchMapper.java`

**변경 전**:
```java
// Admin 컨텍스트 DTO 사용
List<PostSearchResultDTO> searchPostsForAdmin(@Param("request") AdminPostSearchRequest request);
Integer searchPostsForAdminCount(@Param("request") AdminPostSearchRequest request);
```

**변경 후**:
```java
package dev.emoforge.post.mapper;

import dev.emoforge.post.dto.internal.PageRequestDTO;
import dev.emoforge.post.dto.internal.PostSearchResultDTO;
import dev.emoforge.post.dto.internal.SearchFilterDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 게시글 검색 MyBatis Mapper.
 *
 * 공용 Query 계층으로, Context(Admin/User) 구분 없이
 * 조건 기반 게시글 검색 쿼리를 정의한다.
 */
@Mapper
public interface SearchMapper {

    List<PostSearchResultDTO> searchPostsByFilter(
        @Param("filter") SearchFilterDTO filter,
        @Param("page") PageRequestDTO page
    );

    int countPostsByFilter(@Param("filter") SearchFilterDTO filter);
}
```

---

### 2.2 SearchMapper.xml

**경로**: `src/main/resources/mapper/search/SearchMapper.xml`

**주요 변경 사항**:
- 기존 note-forge 유산 쿼리 전부 삭제
- `<sql id="searchWhereConditions">` 공용 WHERE 조건 분리
- `filter`/`page` 파라미터 사용
- OR 검색 조건 괄호로 정확히 처리

**변경 후 전체 내용**:
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="dev.emoforge.post.mapper.SearchMapper">

    <!-- 검색 결과 매핑 -->
    <resultMap id="PostSearchResultMap" type="dev.emoforge.post.dto.internal.PostSearchResultDTO">
        <result property="id" column="id" />
        <result property="title" column="title" />
        <result property="content" column="content" />
        <result property="createdAt" column="created_at" />
        <result property="memberUuid" column="member_uuid" />
        <result property="categoryId" column="category_id" />
        <result property="categoryName" column="category_name" />
        <result property="commentCount" column="comment_count" />
    </resultMap>

    <!-- 공용 WHERE 조건 (list/count 쿼리 동일하게 사용) -->
    <sql id="searchWhereConditions">
        <!-- 카테고리 필터 -->
        <if test="filter.categoryId != null and filter.categoryId > 0">
            AND p.category_id = #{filter.categoryId}
        </if>

        <!-- 키워드 검색 -->
        <if test="filter.keyword != null and filter.keyword != ''">
            <choose>
                <!-- 제목 + 내용 OR 검색 (둘 다 체크된 경우) -->
                <when test="filter.titleChecked == true and filter.contentChecked == true">
                    AND (
                        p.title LIKE CONCAT('%', #{filter.keyword}, '%')
                        OR p.content LIKE CONCAT('%', #{filter.keyword}, '%')
                    )
                </when>
                <!-- 제목만 검색 -->
                <when test="filter.titleChecked == true">
                    AND p.title LIKE CONCAT('%', #{filter.keyword}, '%')
                </when>
                <!-- 내용만 검색 -->
                <when test="filter.contentChecked == true">
                    AND p.content LIKE CONCAT('%', #{filter.keyword}, '%')
                </when>
                <!-- 댓글 내용 검색 (확장용) -->
                <when test="filter.commentChecked == true">
                    AND EXISTS (
                        SELECT 1 FROM comment cm
                        WHERE cm.post_id = p.id
                        AND cm.content LIKE CONCAT('%', #{filter.keyword}, '%')
                    )
                </when>
                <!-- 기본: 제목 + 내용 OR 검색 -->
                <otherwise>
                    AND (
                        p.title LIKE CONCAT('%', #{filter.keyword}, '%')
                        OR p.content LIKE CONCAT('%', #{filter.keyword}, '%')
                    )
                </otherwise>
            </choose>
        </if>

        <!-- 기간 필터 -->
        <if test="filter.startDate != null and filter.endDate != null">
            AND p.created_at BETWEEN #{filter.startDate} AND #{filter.endDate}
        </if>
    </sql>

    <!-- 조건 기반 게시글 목록 검색 (페이징 포함) -->
    <select id="searchPostsByFilter" resultMap="PostSearchResultMap">
        SELECT
            p.id,
            p.title,
            p.content,
            p.created_at,
            p.member_uuid,
            p.category_id,
            c.name AS category_name,
            (SELECT COUNT(*) FROM comment cm WHERE cm.post_id = p.id) AS comment_count
        FROM post p
            LEFT JOIN category c ON p.category_id = c.id
        WHERE 1 = 1
        <include refid="searchWhereConditions"/>

        <!-- 정렬 -->
        ORDER BY
        <choose>
            <when test="page.sort == 'title'">p.title</when>
            <when test="page.sort == 'viewCount'">p.view_count</when>
            <when test="page.sort == 'id'">p.id</when>
            <otherwise>p.created_at</otherwise>
        </choose>
        <choose>
            <when test="page.direction.name() == 'ASC'">ASC</when>
            <otherwise>DESC</otherwise>
        </choose>

        <!-- 페이징 -->
        LIMIT #{page.size} OFFSET #{page.offset}
    </select>

    <!-- 조건 기반 게시글 검색 개수 -->
    <select id="countPostsByFilter" resultType="int">
        SELECT COUNT(*)
        FROM post p
            LEFT JOIN category c ON p.category_id = c.id
        WHERE 1 = 1
        <include refid="searchWhereConditions"/>
    </select>

</mapper>
```

---

### 2.3 PostSearchQueryService.java

**경로**: `src/main/java/dev/emoforge/post/service/internal/PostSearchQueryService.java`

**변경 전**:
```java
// Admin 컨텍스트 import 및 메서드
import dev.emoforge.post.admin.dto.AdminPostSearchRequest;

public PostSearchResult searchPosts(AdminPostSearchRequest request) {
    log.debug("Admin post search: ...");
    // ...
}
```

**변경 후**:
```java
package dev.emoforge.post.service.internal;

import dev.emoforge.post.dto.internal.PageRequestDTO;
import dev.emoforge.post.dto.internal.PostSearchResultDTO;
import dev.emoforge.post.dto.internal.SearchFilterDTO;
import dev.emoforge.post.mapper.SearchMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 게시글 검색 Query 서비스.
 *
 * 설계 원칙:
 * - 공용 Query 계층: Context(Admin/User) 구분 없음
 * - 검색 조건(SearchFilterDTO)과 페이징(PageRequestDTO)만 전달받음
 * - Facade 계층에서 해석된 조건만 사용
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PostSearchQueryService {

    private final SearchMapper searchMapper;

    @Transactional(readOnly = true)
    public PostSearchResult searchPosts(SearchFilterDTO filter, PageRequestDTO pageRequest) {
        log.debug("Post search: keyword={}, titleChecked={}, contentChecked={}, categoryId={}, page={}, size={}",
            filter.keyword(),
            filter.titleChecked(),
            filter.contentChecked(),
            filter.categoryId(),
            pageRequest.page(),
            pageRequest.size()
        );

        List<PostSearchResultDTO> posts = searchMapper.searchPostsByFilter(filter, pageRequest);
        int totalCount = searchMapper.countPostsByFilter(filter);

        log.debug("Post search result: found {} posts (total: {})", posts.size(), totalCount);

        return new PostSearchResult(posts, totalCount);
    }

    public record PostSearchResult(
        List<PostSearchResultDTO> posts,
        int totalCount
    ) {}
}
```

---

## 3. 유지된 파일 (변경 없음)

| 파일 | 경로 | 역할 |
|------|------|------|
| `SearchFilterDTO.java` | `dto/internal/` | 의미 중립적 검색 조건 |
| `PageRequestDTO.java` | `dto/internal/` | 의미 중립적 페이징 정보 |
| `PostSearchResultDTO.java` | `dto/internal/` | Query 결과 DTO |

---

## 4. Query 계층 공용성 보장 방법

| 원칙 | 구현 |
|------|------|
| **Context 중립적 파라미터** | `SearchFilterDTO` + `PageRequestDTO`만 사용 |
| **Admin/User 단어 금지** | 메서드명, 로그, 주석에서 완전 제거 |
| **HTTP 요청 DTO 금지** | Facade에서 변환 책임 |
| **WHERE 조건 일관성** | `<sql id="searchWhereConditions">` 공용화 |
| **OR 검색 정확성** | 괄호로 감싸서 처리 |

---

## 5. 최종 파일 구조

```
src/main/java/dev/emoforge/post/
├── admin/dto/                              [비어있음 - Phase 3에서 재생성]
│
├── dto/internal/
│   ├── SearchFilterDTO.java                [유지]
│   ├── PageRequestDTO.java                 [유지]
│   └── PostSearchResultDTO.java            [유지]
│
├── mapper/
│   └── SearchMapper.java                   [수정]
│
└── service/internal/
    └── PostSearchQueryService.java         [수정]

src/main/resources/mapper/search/
└── SearchMapper.xml                        [수정]
```

---

## 6. Phase 3에서 재생성 필요

Facade/Controller 영역에서 다음 파일들을 새로 생성해야 함:
- `AdminPostSearchRequest.java`
- `AdminSearchType.java`
- `AdminPostListItemResponse.java`

이 DTO들은 **Facade 계층에서 `SearchFilterDTO`로 변환**하는 책임을 가짐.
