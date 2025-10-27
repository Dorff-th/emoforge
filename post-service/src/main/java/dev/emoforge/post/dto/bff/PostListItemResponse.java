package dev.emoforge.post.dto.bff;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record PostListItemResponse(
    //Long postId,
    Long id,
    String title,
    LocalDateTime createdAt,
    String categoryName,
    String nickname,
    String profileImageUrl,  // ✅ 추가
    Long commentCount,
    int attachmentCount

) {}
