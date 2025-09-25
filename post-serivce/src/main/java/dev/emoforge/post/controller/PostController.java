package dev.emoforge.post.controller;

import dev.emoforge.post.dto.bff.PageResponseDTO;
import dev.emoforge.post.dto.bff.PostDetailResponse;
import dev.emoforge.post.dto.bff.PostListItemResponse;
import dev.emoforge.post.dto.bff.TagResponse;
import dev.emoforge.post.dto.internal.PageRequestDTO;

import dev.emoforge.post.service.bff.CommentsFacadeService;
import dev.emoforge.post.service.bff.PostDetailFacadeService;
import dev.emoforge.post.service.bff.PostListFacadeService;
import dev.emoforge.post.service.internal.PostTagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.javassist.NotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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



    /**
     * 게시글 목록 조회 (페이징 포함)
     */
    public PageResponseDTO<PostListItemResponse> getPostList(PageRequestDTO requestDTO) {
        return postListFacadeService.getPostList(null, requestDTO);
    }

    /**
     * 특정태그가 있는 게시글 목록 조회(페이징 포함)
     */
    @GetMapping("/api/posts/{tagName}")
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
     * 신규 등록 요청 - TODO
     */

    /**
     * 수정 (PUT) 요청 - TODO
     */

    /**
     * 삭제 (PUT) 요청 - TODO
     */
}

