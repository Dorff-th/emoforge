package dev.emoforge.cleanup.service;

import dev.emoforge.cleanup.entitiy.Attachment;
import dev.emoforge.cleanup.repository.AttachmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileImageCleanupService {

    private final AttachmentRepository attachmentRepository;

    @Value("${file.upload.path.profile-image.base-dir}")
    private String profileImageBaseDir;

    public void clean() {

        List<Attachment> garbage = attachmentRepository.findGarbageProfileImages();

        for (Attachment a : garbage) {
            String fileUrl = a.getFileUrl();
            Path path;

            // 1) 절대경로인지 여부 판단
            boolean isAbsolute = fileUrl.matches("^[A-Za-z]:.*") || fileUrl.startsWith("/");

            // 2) 절대경로면 그대로 사용
            if (isAbsolute) {
                path = Paths.get(fileUrl);
            }

            // 3) 상대경로면 baseDir과 합쳐서 생성
            else {
                path = Paths.get(profileImageBaseDir, fileUrl);
            }

            try {
                Files.deleteIfExists(path);
                log.info("Deleted Profile file: {}", path);
            } catch (Exception e) {
                log.error("Failed to delete file: {}", path, e);
            }
        }

        int deleted = attachmentRepository.deleteGarbageProfileImages();
        log.info("DB Profile deleted count = {}", deleted);
    }
}
