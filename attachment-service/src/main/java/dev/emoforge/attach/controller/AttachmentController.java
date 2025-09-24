package dev.emoforge.attach.controller;

import dev.emoforge.attach.domain.Attachment;
import dev.emoforge.attach.domain.UploadType;
import dev.emoforge.attach.dto.AttachmentMapper;
import dev.emoforge.attach.dto.AttachmentResponse;
import dev.emoforge.attach.service.AttachmentService;
import lombok.RequiredArgsConstructor;
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

    /**
     * 파일 업로드
     * @param file 업로드할 파일
     * @param uploadType 업로드 타입 (PROFILE_IMAGE, EDITOR_IMAGE, ATTACHMENT)
     * @param postId 게시글 ID (첨부/에디터 이미지일 경우 필요)
     * @param memberUuid 업로더 UUID (프로필 이미지일 경우 필요)
     */
    @PostMapping
    public ResponseEntity<AttachmentResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("uploadType") UploadType uploadType,
            @RequestParam(value = "postId", required = false) Long postId,
            @RequestParam(value = "memberUuid", required = false) String memberUuid
    ) throws IOException {
        Attachment saved = attachmentService.uploadFile(file, uploadType, postId, memberUuid);
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
}
