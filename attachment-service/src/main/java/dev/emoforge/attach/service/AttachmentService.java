package dev.emoforge.attach.service;

import dev.emoforge.attach.domain.Attachment;
import dev.emoforge.attach.domain.AttachmentStatus;
import dev.emoforge.attach.domain.UploadType;
import dev.emoforge.attach.dto.AttachmentResponse;
import dev.emoforge.attach.policy.UploadPolicy;
import dev.emoforge.attach.policy.UploadPolicyRegistry;
import dev.emoforge.attach.repository.AttachmentRepository;
import dev.emoforge.attach.dto.UploadedFileResult;
import dev.emoforge.attach.util.FileUploadUtil;
import dev.emoforge.attach.util.FormatFileSize;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AttachmentService {

    private final FileUploadUtil fileUploadUtil;
    private final UploadPolicyRegistry policyRegistry;
    private final AttachmentRepository attachmentRepository;

    /**
     * 파일 업로드 (공통)
     */
    public Attachment uploadFile(MultipartFile file,
                                 UploadType uploadType,
                                 AttachmentStatus attachmentStatus,
                                 Long postId,
                                 String memberUuid,
                                 String tempKey) throws IOException {

        UploadPolicy policy = policyRegistry.getPolicy(uploadType);

        // 확장자 체크
        validateExtension(file, policy);

        // 사이즈 체크
        if (file.getSize() > policy.getMaxSize()) {
            throw new IllegalArgumentException("File exceeds max size: " + policy.getMaxSize());
        }

        // 공통 저장 로직 실행
        UploadedFileResult result = fileUploadUtil.saveFile(file, policy);

        // Attachment 엔티티 저장
        Attachment attachment = Attachment.builder()
                .postId(postId)
                .memberUuid(memberUuid)
                .fileName(result.getFileName())
                .originFileName(result.getOriginFileName())
                .fileUrl(policy.getBaseDir() + result.getFileName())
                .publicUrl(result.getPublicUrl())
                .fileType(result.getFileType())
                .fileSize(result.getFileSize())
                .uploadType(uploadType)
                .attachmentStatus(attachmentStatus)
                .tempKey(tempKey)
                .deleted(false)
                .build();

        return attachmentRepository.save(attachment);
    }

    /**
     * 첨부파일 삭제 (soft delete + 실제 파일 삭제) <-검토중
     */
    public void deleteFile(Long id) {
        Attachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Attachment not found: " + id));

        // DB soft delete
        attachment.setDeleted(true);

        // 실제 파일 삭제
        fileUploadUtil.deleteFile(attachment.getFileUrl());
    }

    /**
     * tempKey를 조회해서 첨부파일 삭제(실제 DB에서 삭제)
     */
    public void deleteFileByTempKey(String tempKey) {

    }
    /**
     * 게시글 첨부 조회
     */
    @Transactional(readOnly = true)
    public List<Attachment> getAttachmentsByPost(Long postId) {
        return attachmentRepository.findByPostIdAndDeletedFalse(postId);
    }

    /**
     * 사용자 프로필 이미지 조회 (최신 1개)
     */
    @Transactional(readOnly = true)
    public Optional<Attachment> getProfileImage(String memberUuid) {
        return attachmentRepository.findTopByMemberUuidAndUploadTypeAndDeletedFalseOrderByUploadedAtDesc(
                memberUuid, UploadType.PROFILE_IMAGE
        );
    }

    /**
     * 개수 제한 체크 (예: ATTACHMENT 3개 제한)
     */
    @Transactional(readOnly = true)
    public boolean canUploadAttachment(Long postId) {
        long count = attachmentRepository.countByPostIdAndUploadTypeAndDeletedFalse(
                postId, UploadType.ATTACHMENT
        );
        return count < 3;
    }

    /**
     * 확장자 유효성 검사
     */
    private void validateExtension(MultipartFile file, UploadPolicy policy) {
        String originalName = file.getOriginalFilename();
        if (originalName == null) {
            throw new IllegalArgumentException("Invalid file name");
        }
        String ext = originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase();
        if (!policy.allowedExtensions().contains(ext)) {
            throw new IllegalArgumentException("Invalid file extension: " + ext);
        }
    }

    /**
     * post에 첨부된 파일 개수 구하기(Post-Service 에서 bbf로직에서 사용)
     * 목록(posts)에서 첨부된 일반 파일 개수만 구하는것이므로 Upload_type는 'ATTACHMENT'로만 조회
     */
     public Map<Long, Integer> countByPostIds(List<Long> postIds) {
        return attachmentRepository.countByPostIds(postIds, UploadType.ATTACHMENT).stream()
            .collect(Collectors.toMap(
                row -> (Long) row[0],   // postId
                row -> ((Number) row[1]).intValue() // count
            ));
     }

    /**
     * post detail 에 첨부된 파일 정보 구하기(Post-Service 에서 bbf로직에서 사용)
     * 여기서는 첨부된 에디터 이미지(UPLOAD_TYPE = 'EDITOR_IMAGE')
     * 일반 첨부파일 정보를 (UPLOAD_TYPE = 'ATTACHMENT')
     *  uploadType값에 따라 달리한다.
     */
    public List<AttachmentResponse> findByPostId(Long postId, UploadType uploadType) {
         return attachmentRepository.findByPostId(postId, uploadType).stream()
                 .map(attachment -> {
                     return AttachmentResponse.builder()
                             .id(attachment.getId())
                             .postId(attachment.getId())
                             .memberUuid(attachment.getMemberUuid())
                             .originFileName(attachment.getOriginFileName())
                             .fileName(attachment.getFileName())
                             .fileType(attachment.getFileType())
                             .fileSize(attachment.getFileSize())
                             .fileSizeText(FormatFileSize.formatFileSize(attachment.getFileSize()))
                             .publicUrl(attachment.getPublicUrl())
                             .uploadType(attachment.getUploadType())
                             .uploadedAt(attachment.getUploadedAt())
                             .build();
                    }
                 ).toList();
    }
}
