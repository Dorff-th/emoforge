package dev.emoforge.post.controller;

import dev.emoforge.post.domain.Post;
import dev.emoforge.post.dto.bff.PageResponseDTO;
import dev.emoforge.post.dto.bff.PostDetailResponse;
import dev.emoforge.post.dto.bff.PostListItemResponse;
import dev.emoforge.post.dto.bff.TagResponse;
import dev.emoforge.post.dto.internal.PageRequestDTO;

import dev.emoforge.post.dto.internal.PostRequestDTO;
import dev.emoforge.post.dto.internal.PostUpdateDTO;
import dev.emoforge.post.service.bff.CommentsFacadeService;
import dev.emoforge.post.service.bff.PostDetailFacadeService;
import dev.emoforge.post.service.bff.PostListFacadeService;
import dev.emoforge.post.service.internal.PostService;
import dev.emoforge.post.service.internal.PostTagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.javassist.NotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posts")
@Slf4j
public class PostController {

    private final PostListFacadeService postListFacadeService;  // bff
    private final PostDetailFacadeService postDetailFacadeService; // bff
    private final PostTagService postTagService;
    private final PostService postService;


    /**
     * 게시글 목록 조회 (페이징 포함)
     */
    @GetMapping
    public PageResponseDTO<PostListItemResponse> getPostList(PageRequestDTO requestDTO) {
        return postListFacadeService.getPostList(null, requestDTO);
    }

    /**
     * 특정태그가 있는 게시글 목록 조회(페이징 포함)
     */
    @GetMapping("/tags/{tagName}")
    public PageResponseDTO<PostListItemResponse> getPostListByTag(
        @PathVariable("tagName") String tagName,
        PageRequestDTO requestDTO) {
        return postListFacadeService.getPostList(tagName, requestDTO);
    }

    /**
     * 게시글 상세 조회
     */
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<PostDetailResponse> getPost(@PathVariable("id") Long id) throws NotFoundException {

        PostDetailResponse resultDTO = postDetailFacadeService.getPostDetail(id);

        return ResponseEntity.ok(resultDTO);
    }

    /**
     * 게시글에 포함된 태그 목록 조회
     */
    @GetMapping("/{id}/tags")
    public ResponseEntity<List<TagResponse>> getPostTags(@PathVariable("id") Long id) {

        List<TagResponse> tags = postTagService.getByPostId(id)
            .stream()
            .map(tagDTO ->
                new TagResponse(tagDTO.getPostTag().getTag().getId(), tagDTO.getName())
            )
            .collect(Collectors.toList());
        return ResponseEntity.ok(tags);
    }

    /**
     * 신규 등록 요청
     */
    @PostMapping
    public ResponseEntity<?> createPost(
        Authentication authentication,
        @Valid @RequestBody  PostRequestDTO dto
    ) {
        String memberUuid = authentication.getPrincipal().toString();
        Post saved = postService.createPost(dto, memberUuid);

        return ResponseEntity.ok(saved.getId()); // 일단 ID만 반환
    }

    /**
     * 수정 (PUT) 요청 - TODO
     */
    @PutMapping("/{id}")
    public ResponseEntity<Long> updatePost(
        Authentication authentication,
        @RequestBody PostUpdateDTO dto) {

        // 1. 게시글 존재 여부 확인
        Post post = postService.getPostById(dto.id())
            .orElseThrow(() -> new IllegalArgumentException("Post가 존재하지 않습니다!"));

        // 2. 권한 체크 (본인만 수정 가능)
        String memberUuid = authentication.getPrincipal().toString();
        if(!memberUuid.equals(dto.authorUuid())) {
            throw new AccessDeniedException("권한이 없습니다.");
        }

        // 4. 업데이트 수행
        Post updated = postService.editPost(dto);

        // 5. postId 반환
        return ResponseEntity.ok(updated.getId());
    }
    /**
     * 삭제 (PUT) 요청 - TODO
     */
}

