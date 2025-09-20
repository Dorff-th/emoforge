package dev.emoforge.attach.repository;

import dev.emoforge.attach.domain.Attachment;
import dev.emoforge.attach.domain.UploadType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    // 게시글별 첨부 조회 (삭제 제외)
    List<Attachment> findByPostIdAndDeletedFalse(Long postId);

    // 특정 타입(예: 프로필 이미지) 최신 1개
    Optional<Attachment> findTopByMemberUuidAndUploadTypeAndDeletedFalseOrderByUploadedAtDesc(
            String memberUuid, UploadType uploadType
    );

    // 게시글별/타입별 개수 (예: 일반 첨부 3개 제한 체크)
    long countByPostIdAndUploadTypeAndDeletedFalse(Long postId, UploadType uploadType);

    // 소유자 기준 전체 조회 (필요 시)
    List<Attachment> findByMemberUuidAndDeletedFalse(String memberUuid);
}
