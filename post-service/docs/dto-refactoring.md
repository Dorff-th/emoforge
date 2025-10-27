# Post 서비스 DTO/엔티티 리팩터링 결과

## 엔티티 구조 변경
| 구분 | 리팩터링 전 | 리팩터링 후 | 비고 |
| --- | --- | --- | --- |
| Comment | `dev.emoforge.post.domin.Comment`가 Post/Member 연관을 직접 보유 | `dev.emoforge.post.domain.Comment`가 `postId`, `memberUuid` 원시 필드만 유지 | 교차 서비스 식별자를 UUID/ID로만 관리 |
| Post | Category/Member/Comment/Attachment 연관을 보유한 다목적 엔티티 | `dev.emoforge.post.domain.Post`가 `categoryId`, `memberUuid` 등 식별자 위주로 단순화 | 조회·조립 로직은 BFF/서비스 계층에서 처리 |
| Category | 단순 구조이나 패키지 오타(`domin`)에 존재 | `dev.emoforge.post.domain.Category`로 이동, 생성/수정 유틸 메서드 추가 | 기본 카테고리 플래그 유지 |
| Tag | `dev.emoforge.post.domin.Tag` | `dev.emoforge.post.domain.Tag`로 이동, 정적 팩토리 제공 | |
| PostTag | Post/Tag 엔티티 연관 기반 다대다 매핑 | `dev.emoforge.post.domain.PostTag` + `PostTagId` 임베디드 키로 단순 ID 매핑 | 다른 엔티티를 직접 참조하지 않음 |

## DTO 재분류 및 신규 도입
| 계층 | 클래스 | 리팩터링 전 위치/역할 | 리팩터링 후 위치/역할 |
| --- | --- | --- | --- |
| Internal | `CategoryRequest`, `CategoryUpdateRequest`, `CommentRequest`, `CommentCommand`, `PostRequestDTO`, `PostUpdateDTO`, `PageRequestDTO`, `SortDirection`, `SearchFilterDTO`, `SearchRequestWrapper`, `CommentResponseDTO`, `TagDTO` | 대부분 `dev.emoforge.post.dto` 루트에 혼재, 웹 계층 의존(`MultipartFile`) 포함 | `dev.emoforge.post.dto.internal`로 이동, 레코드/빌더 기반 DTO로 정리, 외부 의존 제거 |
| External | `MemberProfileResponse`, `ProfileImageResponse`, `AttachmentViewResponse` | 존재하지 않음 | `dev.emoforge.post.dto.external`에 Auth/Attach 호출 응답 모델 신규 정의 |
| BFF | `CommentBffResponse`, `PostDTO`, `PostDetailDTO`, `PageResponseDTO`, `TagResponse`, `MatchedField`, `SearchResultDTO` | 일부는 엔티티/리포지토리에서 직접 조합됨 | `dev.emoforge.post.dto.bff`로 이동, 화면 응답 조립 전용 DTO로 사용 |

## Repository/매퍼 조정
- `PostRepository`는 엔티티 반환 위주로 단순화하여 BFF/서비스 계층에서 DTO 조합을 담당하도록 변경
- `CommentRepository`는 `postId` 기반 조회로 정비
- MyBatis `SearchMapper` 및 XML 매핑은 내부/외부 패키지 경로 변경에 맞추어 수정, 별칭 패키지 설정을 `application.yml`에서 갱신

## 후속 작업 가이드
1. 서비스/애플리케이션 계층에서 신규 DTO 구조에 맞게 매핑 로직을 구현 (`Post`, `Comment` 엔티티를 이용해 BFF DTO 생성)
2. 외부 서비스 연동부(Auth/Attach)의 클라이언트와 응답 매핑을 `MemberProfileResponse`, `ProfileImageResponse`, `AttachmentViewResponse`를 활용하도록 정비
3. 제거한 JPA 커스텀 쿼리를 대체할 서비스 로직/쿼리(MyBatis 또는 QueryDSL 등)를 도입해 목록/상세 응답을 구성
4. 문서/테스트 업데이트: 변경된 패키지와 DTO 구조에 맞게 단위/통합 테스트를 정리하고, 기존 `docs/dto-mapping.md`는 신규 문서를 참조하도록 정합성 확인
