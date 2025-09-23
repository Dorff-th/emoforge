package dev.emoforge.post.dto.internal;

import dev.emoforge.post.domain.Comment;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record CommentResponseDTO(
        Long id,
        String content,
        LocalDateTime createdAt,
        Long postId,
        String memberUuid
) {
    public static CommentResponseDTO fromEntity(Comment comment) {
        return CommentResponseDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .postId(comment.getPostId())
                .memberUuid(comment.getMemberUuid())
                .build();
    }
}
