package dev.emoforge.post.dto.bff;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record SearchResultDTO(
        Long postId,
        String title,
        String content,
        LocalDateTime createdAt,
        String writerName,
        String categoryName,
        String commentContent,
        String commentWriter,
        String summary,
        MatchedField matchedField,
        String highlightedTitle
) {
}
