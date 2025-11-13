package dev.emoforge.post.controller;


import dev.emoforge.post.config.CustomUserPrincipal;
import dev.emoforge.post.domain.Post;
import dev.emoforge.post.dto.bff.CommentDetailResponse;
import dev.emoforge.post.dto.internal.CommentRequest;
import dev.emoforge.post.dto.internal.CommentResponse;
import dev.emoforge.post.service.bff.CommentsFacadeService;
import dev.emoforge.post.service.internal.CommentService;
import dev.emoforge.post.service.internal.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@Slf4j
@RequestMapping("/api/posts/{postId}/comments")
public class CommentController {

    private final PostService postService;
    private final CommentService commentService;
    private final CommentsFacadeService commentsFacadeService;

    @GetMapping
    public ResponseEntity<List<CommentDetailResponse>> getCommentsByPostId(@PathVariable("postId") Long postId) {
        List<CommentDetailResponse> comments = commentsFacadeService.getCommentsByPost(postId);
        return ResponseEntity.ok(comments);
    }

    // 댓글 작성
    @PostMapping
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable("postId") Long postId,
            @RequestBody CommentRequest request,
            Authentication authentication
    ) {

        // 1. 게시글 존재 여부 확인
        Post post = postService.getPostById(postId)
            .orElseThrow(() -> new IllegalArgumentException("Post가 존재하지 않습니다!"));

        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        String memberUuid = principal.getUuid();

        CommentResponse response = commentService.createComment(postId, memberUuid, request.getContent());
        return ResponseEntity.ok(response);
    }

    // 댓글 삭제
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable("postId") Long postId,
            @PathVariable("commentId") Long commentId,
            Authentication authentication
    ) {
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        String memberUuid = principal.getUuid();
        commentService.deleteComment(postId, commentId, memberUuid);
        return ResponseEntity.noContent().build();
    }

}
