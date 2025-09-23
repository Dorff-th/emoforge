package dev.emoforge.post.dto.internal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.List;

@Builder
public record PostUpdateDTO(
        @NotNull Long id,
        @NotBlank(message = "{NotBlankPostTitle}") String title,
        @NotBlank(message = "{NotBlankPostContent}") String content,
        @NotNull Long categoryId,
        List<String> tagNames,
        List<Long> deleteTagIds,
        List<String> attachmentIdsToAdd,
        List<Long> attachmentIdsToDelete
) {
}
