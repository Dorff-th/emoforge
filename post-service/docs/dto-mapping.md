| 기존 DTO | 기존 사용처 | 새로운 구조 (MSA+BFF) | 비고 |
| --- | --- | --- | --- |
| `dev.emoforge.post.dto.CategoryRequest` | 관리자 카테고리 생성 요청 DTO, 현재 직접 사용처 없음 (`src/main/java/dev/emoforge/post/dto/CategoryRequest.java`) | `dto/internal/CategoryRequest` | 컨트롤러 도입 전 임시 요청 모델, 서비스 계층용으로 분류 |
| `dev.emoforge.post.dto.CategoryUpdateRequest` | 카테고리 수정 요청 DTO, 현재 직접 사용처 없음 (`src/main/java/dev/emoforge/post/dto/CategoryUpdateRequest.java`) | `dto/internal/CategoryUpdateRequest` | 관리 기능용 업데이트 커맨드, 내부 서비스 로직에서만 활용 예정 |
| `dev.emoforge.post.dto.CommentRequest` | 댓글 생성 요청 바디, 현재 직접 사용처 없음 (`src/main/java/dev/emoforge/post/dto/CommentRequest.java`) | `dto/internal/CommentRequest` | 추후 BFF에서 검증된 값 전달받도록 내부 커맨드 DTO로 유지 |
| `dev.emoforge.post.dto.CommentResponseDTO` | 댓글 목록 JPA 프로젝션 (`src/main/java/dev/emoforge/post/repository/CommentRepository.java:16`) | `dto/bff/CommentResponseDTO` | 화면 전용 응답; fromEntity에서 memberUuid 필드와 memberId 사용 불일치 주의 |
| `dev.emoforge.post.dto.MatchedField` | 검색 하이라이팅 대상 열거형, 현재 직접 사용처 없음 (`src/main/java/dev/emoforge/post/dto/MatchedField.java`) | `dto/bff/MatchedField` | 검색 결과 강조 표시를 위한 UI 메타데이터, BFF 응답 전용으로 이동 |
| `dev.emoforge.post.dto.PageRequestDTO` | MyBatis 검색 페이징 파라미터 (`src/main/java/dev/emoforge/post/mapper/SearchMapper.java:17`) | `dto/internal/PageRequestDTO` | 내부 조회 로직에서 Pageable 변환 및 오프셋 계산에 활용 |
| `dev.emoforge.post.dto.PageResponseDTO` | 페이지네이션 응답 컨테이너, 현재 직접 사용처 없음 (`src/main/java/dev/emoforge/post/dto/PageResponseDTO.java`) | `dto/bff/PageResponseDTO` | 화면 페이지 네비게이션 정보 포함, BFF 응답 전용으로 이동 |
| `dev.emoforge.post.dto.PostDetailDTO` | 게시글 상세 JPA 프로젝션 (`src/main/java/dev/emoforge/post/repository/PostRepository.java:60`) | `dto/bff/PostDetailDTO` | 첨부파일 응답 포함한 화면 전용 DTO, BFF 계층에서 조립 |
| `dev.emoforge.post.dto.PostDTO` | 게시글 목록 JPA 프로젝션 (`src/main/java/dev/emoforge/post/repository/PostRepository.java:26`) | `dto/bff/PostDTO` | 목록 화면 응답; Query 결과 변환 정리 필요 |
| `dev.emoforge.post.dto.PostRequestDTO` | 게시글 등록 요청 바디, 현재 직접 사용처 없음 (`src/main/java/dev/emoforge/post/dto/PostRequestDTO.java`) | `dto/internal/PostRequestDTO` | MultipartFile 등 웹 계층 의존성, BFF에서 정제 후 서비스로 전달 예정 |
| `dev.emoforge.post.dto.PostUpdateDTO` | 게시글 수정 커맨드 (`src/main/java/dev/emoforge/post/repository/PostRepository.java:80`) | `dto/internal/PostUpdateDTO` | JPA 업데이트 쿼리 바인딩에 사용, 서비스 내부 전용 유지 |
| `dev.emoforge.post.dto.SearchFilterDTO` | 검색 조건 파라미터 (`src/main/java/dev/emoforge/post/mapper/SearchMapper.java:21`) | `dto/internal/SearchFilterDTO` | 내부 검색 쿼리 조립용 DTO, 외부 노출 불필요 |
| `dev.emoforge.post.dto.SearchRequestWrapper` | 검색 요청 바디 래퍼, 현재 직접 사용처 없음 (`src/main/java/dev/emoforge/post/dto/SearchRequestWrapper.java`) | `dto/internal/SearchRequestWrapper` | 공통 PageRequestDTO 의존, 서비스 진입점에서만 사용하도록 내부 분류 |
| `dev.emoforge.post.dto.SearchResultDTO` | 검색 결과 MyBatis 매핑 (`src/main/resources/mapper/search/SearchMapper.xml:8`) | `dto/bff/SearchResultDTO` | UI 하이라이트 필드 포함, BFF 응답 패키지로 이동 |
| `dev.emoforge.post.dto.SortDirection` | 페이징 정렬 방향 enum (`src/main/java/dev/emoforge/post/dto/PageRequestDTO.java:25`) | `dto/internal/SortDirection` | 내부 페이징 계산용 도메인 헬퍼 |
| `dev.emoforge.post.dto.TagDTO` | PostTag 연관 태그 DTO, 현재 직접 사용처 없음 (`src/main/java/dev/emoforge/post/dto/TagDTO.java`) | `dto/internal/TagDTO` | 엔티티 연관 포함, 서비스 내부 조합용으로 유지 |
| `dev.emoforge.post.dto.TagResponse` | React 화면 태그 응답 DTO (`src/main/java/dev/emoforge/post/dto/TagResponse.java:7`) | `dto/bff/TagResponse` | 화면 응답 전용으로 확인, BFF 계층으로 이동 |
| `dev.emoforge.post.domain.Comment` | Post/Member 연관을 직접 보유한 JPA 엔티티 (`src/main/java/dev/emoforge/post/domin/Comment.java` 삭제됨) | `dev.emoforge.post.domain.Comment` | 연관 제거 후 `postId`, `memberUuid` 원시값 컬럼만 유지 |
| `dev.emoforge.post.dto.CommentResponseDTO` | 엔티티에서 회원/게시글 정보를 모두 조합 (`src/main/java/dev/emoforge/post/dto/CommentResponseDTO.java`) | `dto/bff/CommentBffResponse` | BFF DTO 신설, CommentResponseDTO는 엔티티 필드만 노출하는 보조 DTO로 축소 |
| - | 댓글 저장용 별도 DTO 부재 | `dto/internal/CommentCommand` | 댓글 생성/수정 커맨드 DTO 신규 정의 |
| - | 외부 서비스 응답 모델 부재 | `dto/external/MemberProfileResponse`, `dto/external/ProfileImageResponse` | Auth/Attach 서비스 응답 DTO 분리 |
