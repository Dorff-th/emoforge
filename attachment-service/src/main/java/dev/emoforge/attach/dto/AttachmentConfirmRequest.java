package dev.emoforge.attach.dto;

/**
 * Post
 */
/**
 * 첨부파일 확정 요청 DTO.
 * - 글 작성 완료 시, tempKey로 업로드된 첨부파일들을 postId와 매핑하고
 *   상태를 CONFIRMED로 변경하기 위한 요청 값 전달용.
 */
public record AttachmentConfirmRequest(
        String groupTempKey,
        Long postId
) {}
