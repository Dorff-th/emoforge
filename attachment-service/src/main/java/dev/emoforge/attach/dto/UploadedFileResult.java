package dev.emoforge.attach.dto;

import lombok.Builder;
import lombok.Data;

/**
 * 업로드 결과 DTO
 */
@Data
@Builder
public class UploadedFileResult {
    private String fileName;
    private String originFileName;
    private String fileType;
    private long fileSize;
    private String publicUrl;
}
