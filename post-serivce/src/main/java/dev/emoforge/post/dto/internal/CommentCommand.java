package dev.emoforge.post.dto.internal;

import lombok.Builder;

@Builder
public record CommentCommand(
        Long postId,
        String memberUuid,
        String content
) {
}
