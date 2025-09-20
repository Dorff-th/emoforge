package dev.emoforge.attach.service;

import dev.emoforge.attach.domain.Attachment;
import dev.emoforge.attach.domain.UploadType;
import dev.emoforge.attach.policy.UploadPolicy;
import dev.emoforge.attach.policy.UploadPolicyRegistry;
import dev.emoforge.attach.repository.AttachmentRepository;
import dev.emoforge.attach.dto.UploadedFileResult;
import dev.emoforge.attach.util.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

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
                                 Long postId,
                                 String memberUuid) throws IOException {

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
                .deleted(false)
                .build();

        return attachmentRepository.save(attachment);
    }

    /**
     * 첨부파일 삭제 (soft delete + 실제 파일 삭제)
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
}
