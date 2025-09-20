package dev.emoforge.attach.dto;

import dev.emoforge.attach.domain.UploadType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 업로드 결과 응답 DTO
 */
@Data
@Builder
public class AttachmentResponse {
    private Long id;
    private Long postId;
    private String memberUuid;
    private String originFileName;
    private String fileName;
    private String fileType;
    private long fileSize;
    private String publicUrl;
    private UploadType uploadType;
    private LocalDateTime uploadedAt;
}
