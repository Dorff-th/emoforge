package dev.emoforge.post.dto.external;


import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 업로드 결과 응답 DTO
 */
@Builder
public record AttachmentResponse (
     Long id,
     Long postId,
     String memberUuid,
     String originFileName,
     String fileName,
     String fileType,
     long fileSize,
     String publicUrl,
    String fileSizeText
) {}
