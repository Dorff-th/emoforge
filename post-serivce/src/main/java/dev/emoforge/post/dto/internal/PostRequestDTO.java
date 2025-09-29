package dev.emoforge.post.dto.internal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;

import java.util.List;

@Builder
public record PostRequestDTO(
        @NotBlank(message = "{NotBlankPostTitle}") String title,
        @NotBlank(message = "{NotBlankPostContent}") String content,
        @NotNull Long categoryId,
        //@NotBlank String memberUuid,
        String tags
        //List<String> attachmentIds
) {
}
