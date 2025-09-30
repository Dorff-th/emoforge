package dev.emoforge.attach.controller;

import dev.emoforge.attach.domain.Attachment;
import dev.emoforge.attach.domain.AttachmentStatus;
import dev.emoforge.attach.domain.UploadType;
import dev.emoforge.attach.dto.AttachmentConfirmRequest;
import dev.emoforge.attach.dto.AttachmentMapper;
import dev.emoforge.attach.dto.AttachmentResponse;
import dev.emoforge.attach.service.AttachmentService;
import dev.emoforge.attach.util.FileDownloadUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/attach")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;
    private final FileDownloadUtil fileDownloadUtil;

    /**
     * 파일 업로드
     * @param file 업로드할 파일
     * @param uploadType 업로드 타입 (PROFILE_IMAGE, EDITOR_IMAGE, ATTACHMENT)
     *
     * @param postId 게시글 ID (첨부/에디터 이미지일 경우 필요)
     * @param memberUuid 업로더 UUID (프로필 이미지일 경우 필요)
     */
    @PostMapping
    public ResponseEntity<AttachmentResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("uploadType") UploadType uploadType,
            @RequestParam("attachmentStatus") AttachmentStatus attachmentStatus,
            @RequestParam(value = "postId", required = false) Long postId,
            @RequestParam(value = "memberUuid", required = false) String memberUuid,
            @RequestParam(value = "tempKey", required = false) String tempKey
    ) throws IOException {
        Attachment saved = attachmentService.uploadFile(file, uploadType, attachmentStatus, postId, memberUuid, tempKey);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(AttachmentMapper.toResponse(saved));
    }

    /**
     * 파일 삭제 (soft delete + 실제 파일 삭제)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable("id") Long id) {
        attachmentService.deleteFile(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 게시글 첨부파일 조회 - unUsed (첨부파일 조회는 Post-Service에서 bbf로 호출하기때문에 api 호출은 필요가 없음.
     */
    /*@GetMapping("/post/{postId}")
    public ResponseEntity<List<AttachmentResponse>> getAttachmentsByPost(@PathVariable("postId") Long postId) {
        return ResponseEntity.ok(
                attachmentService.getAttachmentsByPost(postId)
                        .stream()
                        .map(AttachmentMapper::toResponse)
                        .toList()
        );
    }*/

    /**
     * 사용자 프로필 이미지 조회 (최신 1개)
     */
    @GetMapping("/profile/{memberUuid}")
    public ResponseEntity<AttachmentResponse> getProfileImage(@PathVariable("memberUuid") String memberUuid) {
        return attachmentService.getProfileImage(memberUuid)
                .map(AttachmentMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 특정 게시글이 첨부 업로드 가능한 상태인지 확인 (3개 제한)
     */
    @GetMapping("/post/{postId}/can-upload")
    public ResponseEntity<Boolean> canUploadAttachment(@PathVariable Long postId) {
        return ResponseEntity.ok(attachmentService.canUploadAttachment(postId));
    }

    /**
     * post에 첨부된 파일 개수 구하기(Post-Service 에서 bbf로직에서 사용)
     */
    @PostMapping("/count/batch")
    public Map<Long, Integer> countByPostIds(@RequestBody List<Long> postIds) {
        return attachmentService.countByPostIds(postIds);
    }

    /**
     * post에 첨부된 파일 정보 구하기(Post-Service 에서 bbf로직에서 사용)
     * uploadType (EDITOR_IMAGE, ATTACHMENT)
     */
    @GetMapping("/post/{postId}")
    public List<AttachmentResponse> findByPostId(@PathVariable("postId") Long postId, @RequestParam("uploadType") UploadType uploadType) {
        return attachmentService.findByPostId(postId, uploadType);
    }

    @GetMapping("/profile-images/{memberUuid}")
    public ResponseEntity<AttachmentResponse> getLatestProfileImage(@PathVariable("memberUuid") String memberUuid) {
        return ResponseEntity.ok(
                attachmentService.getProfileImage(memberUuid)
                        .map(AttachmentMapper::toResponse)
                        .orElse(null)   // 없는 경우 null 반환
        );
    }

    /**
     * Post 등록이 성공하면 postId에 가져온 postId값과 status를 CONFIRMED로 업데이트 한다.
     */
    @PostMapping("/confirm")
    public ResponseEntity<?> attachmentConfirm(@RequestBody AttachmentConfirmRequest request) {
        attachmentService.confirmAttachments(request.postId(), request.groupTempKey());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> download(@PathVariable("id") Long id) {
        Attachment attachment = attachmentService.getById(id).orElseThrow(() -> new IllegalArgumentException("해당 id를 갖는 첨부파일이 없습니다!"));
        return fileDownloadUtil.getDownloadResponse(attachment.getFileUrl(), attachment.getOriginFileName());
    }

}
