package dev.emoforge.post.dto.bff;

import dev.emoforge.post.dto.external.AttachmentViewResponse;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Builder
public record PostDetailDTO(
        Long id,
        String title,
        String content,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        Long categoryId,
        String categoryName,
        String memberUuid,
        String nickname,
        List<AttachmentViewResponse> attachments,
        List<String> tags
) {
}
