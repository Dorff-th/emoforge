package dev.emoforge.attach.dto;

import dev.emoforge.attach.domain.Attachment;
/**
 * 변환 유틸 (엔티티 → DTO)
 */
public class AttachmentMapper {

    public static AttachmentResponse toResponse(Attachment entity) {
        return AttachmentResponse.builder()
                .id(entity.getId())
                .postId(entity.getPostId())
                .memberUuid(entity.getMemberUuid())
                .originFileName(entity.getOriginFileName())
                .fileName(entity.getFileName())
                .fileType(entity.getFileType())
                .fileSize(entity.getFileSize())
                .publicUrl(entity.getPublicUrl())
                .uploadType(entity.getUploadType())
                .uploadedAt(entity.getUploadedAt())
                .build();
    }
}
