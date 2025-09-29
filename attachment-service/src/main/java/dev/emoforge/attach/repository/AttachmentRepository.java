package dev.emoforge.attach.repository;

import dev.emoforge.attach.domain.Attachment;
import dev.emoforge.attach.domain.AttachmentStatus;
import dev.emoforge.attach.domain.UploadType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

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

    //post에 첨부된 파일 개수 구하기(Post-Service 에서 bbf로직에서 사용)
    @Query("SELECT a.postId, COUNT(a) FROM Attachment a " +
            "WHERE a.postId IN :postIds AND a.uploadType = :uploadType " +
            "GROUP BY a.postId")
    List<Object[]> countByPostIds(
            @Param("postIds") List<Long> postIds,
            @Param("uploadType") UploadType uploadType
    );

    //post에 첨부된 파일 메타 정보 구하기(Post-Service 에서 bbf로직에서 사용)
    @Query("SELECT a FROM Attachment a WHERE a.postId = :postId AND a.uploadType = :uploadType")
    List<Attachment> findByPostId(@Param("postId") Long postId, @Param("uploadType") UploadType uploadType);

    //Post 등록이 성공하면 postId에 가져온 postId값과 status를 CONFIRMED로 업데이트 한다.
    @Modifying
    @Transactional
    @Query("UPDATE Attachment a " +
            "SET a.postId = :postId, a.attachmentStatus = :status " +
            "WHERE a.tempKey = :tempKey")
    int updatePostIdAndConfirmByTempKey(@Param("postId") Long postId,
                                        @Param("status") AttachmentStatus status ,
                                        @Param("tempKey") String tempKey);

}
