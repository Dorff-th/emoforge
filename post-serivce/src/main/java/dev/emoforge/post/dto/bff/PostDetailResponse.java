package dev.emoforge.post.dto.bff;

import dev.emoforge.post.dto.external.AttachmentResponse;
import dev.emoforge.post.dto.external.AttachmentViewResponse;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Builder
public record PostDetailResponse(
        Long id,
        String title,
        String content,
        String memberUuid,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        Long categoryId,
        String categoryName,
        String nickname,
        String profileImageUrl,
        List<AttachmentResponse> editorImages,
        List<AttachmentResponse> attachments

) {
}
