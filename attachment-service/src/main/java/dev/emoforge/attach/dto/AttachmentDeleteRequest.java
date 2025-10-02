package dev.emoforge.attach.dto;

import lombok.Data;

import java.util.List;

/**
 * 요청: 첨부파일 일괄 삭제
 * URL: POST /attach/delete/batch
 */
@Data
public class AttachmentDeleteRequest {
    private List<Long> attachmentIds; // 삭제할 첨부파일 ID 목록
}
