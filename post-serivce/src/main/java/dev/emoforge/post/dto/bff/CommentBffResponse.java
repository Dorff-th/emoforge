package dev.emoforge.post.dto.bff;

import java.time.LocalDateTime;

public record CommentBffResponse(
        Long id,
        Long postId,
        String content,
        LocalDateTime createdAt,
        String memberUuid,
        String nickname,
        String profileImageUrl
) {
}
