package dev.emoforge.post.dto.bff;

import java.time.LocalDateTime;

/**
 *
 * @param id
 * @param postId
 * @param content
 * @param createdAt
 * @param memberUuid
 * @param nickname
 * @param profileImageUrl
 */
public record CommentDetailResponse(
        Long id,
        Long postId,
        String memberUuid,
        String content,
        LocalDateTime createdAt,

        String nickname,
        String profileImageUrl
) {
}
