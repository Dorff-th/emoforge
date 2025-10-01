package dev.emoforge.attach.controller;

import dev.emoforge.attach.service.AttachmentCleanupService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/attach/cleanup")
@RequiredArgsConstructor
@Slf4j
public class AttachmentCleanupController {

    private final AttachmentCleanupService attachmentCleanupService;

    @PostMapping("/editor")
    public ResponseEntity<Void> cleanupEditor(@RequestBody CleanupRequest request) {

        attachmentCleanupService.cleanupEditorImages(request.getPostId(), request.getFileUrls());
        return ResponseEntity.ok().build();
    }

    @Data
    @ToString
    public static class CleanupRequest {
        private Long postId;
        private List<String> fileUrls; // 에디터에 남아있는 이미지 URL
    }
}
