package dev.emoforge.post.dto.internal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;


@Builder
public record PostUpdateDTO(
        @NotNull Long id,
        @NotBlank(message = "{NotBlankPostTitle}") String title,
        @NotBlank(message = "{NotBlankPostContent}") String content,
        @NotNull Long categoryId,
        String authorUuid,

        String tags, // hidden input "tags"  (신규 입력 tag 들)
        String deleteTagIds,  // 삭제 대상 tag id 들
        LocalDateTime updatedAt
) {
    public PostUpdateDTO {
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }
}
