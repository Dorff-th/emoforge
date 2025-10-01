package dev.emoforge.attach.service;

import dev.emoforge.attach.domain.UploadType;
import dev.emoforge.attach.repository.AttachmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttachmentCleanupService {

    private final AttachmentRepository attachmentRepository;

    @Transactional
    public void cleanupEditorImages(Long postId, List<String> fileUrls) {

        if (fileUrls == null || fileUrls.isEmpty()) {
            // 본문에 이미지가 하나도 없으면 전부 삭제
            attachmentRepository.deleteAll(attachmentRepository.findByPostId(postId, UploadType.EDITOR_IMAGE));
            return;
        }

        // 본문에 남아있는 이미지 → CONFIRMED
        attachmentRepository.confirmEditorImages(postId, UploadType.EDITOR_IMAGE, fileUrls);

        // 본문에 없는 이미지 → DELETE
        attachmentRepository.deleteUnusedEditorImages(postId, UploadType.EDITOR_IMAGE, fileUrls );
    }
}
