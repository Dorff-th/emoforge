package dev.emoforge.post.controller;


import dev.emoforge.post.dto.bff.CommentDetailResponse;
import dev.emoforge.post.dto.internal.CommentRequest;
import dev.emoforge.post.dto.internal.CommentResponse;
import dev.emoforge.post.service.bff.CommentsFacadeService;
import dev.emoforge.post.service.internal.CommentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@Slf4j
@RequestMapping("/api/posts/{postId}/comments")
public class CommentController {

    private final CommentService commentService;
    private final CommentsFacadeService commentsFacadeService;

    @GetMapping
    public ResponseEntity<List<CommentDetailResponse>> getCommentsByPostId(@PathVariable("postId") Long postId) {
        List<CommentDetailResponse> comments = commentsFacadeService.getCommentsByPost(postId);
        return ResponseEntity.ok(comments);
    }

    // 댓글 작성
    /*@PostMapping
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable("postId") Long postId,
            @AuthenticationPrincipal MemberDetails loginUser,
            @RequestBody CommentRequest request
    ) {
        CommentResponse response = commentService.createComment(postId, loginUser.getId(), request.getContent());
        return ResponseEntity.ok(response);
    }*/

    // 댓글 삭제
    /*@DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable("postId") Long postId,
            @PathVariable("commentId") Long commentId,
            @AuthenticationPrincipal MemberDetails loginUser
    ) {
        commentService.deleteComment(postId, commentId, loginUser.getId());
        return ResponseEntity.noContent().build();
    }*/

}
