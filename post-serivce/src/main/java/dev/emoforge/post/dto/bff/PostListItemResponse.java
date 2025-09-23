package dev.emoforge.post.dto.bff;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record PostListItemResponse(
    Long postId,
    String title,
    LocalDateTime createdAt,
    String categoryName,
    String nickname,
    Long commentCount,
    int attachmentCount
) {}
