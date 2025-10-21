package dev.emoforge.attach.controller;

import dev.emoforge.attach.domain.Attachment;
import dev.emoforge.attach.domain.UploadType;
import dev.emoforge.attach.repository.AttachmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/attach")
@Slf4j
public class PublicAttachController {
    private  final AttachmentRepository attachmentRepository;
    @GetMapping("/public/profile")
    public ResponseEntity<Map<String, String>> getProfileImage(
            @RequestParam("memberUuid") String memberUuid,
            @RequestParam("uploadType") UploadType uploadType
    ) {
        log.debug("\n\n\n=========PublicAttachController debuging");
        log.debug("memberUuid : " + memberUuid);
        log.debug("uploadType : " + uploadType);

        Attachment attach = attachmentRepository
                .findTopByMemberUuidAndUploadTypeOrderByUploadedAtDesc(memberUuid, uploadType)
                .orElse(null);

        String url = attach != null ? attach.getPublicUrl() : null;

        log.debug("url : " + url);

        return ResponseEntity.ok(Map.of("publicUrl", url));
    }
}
