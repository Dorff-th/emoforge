package dev.emoforge.attach.util;


import dev.emoforge.attach.domain.UploadType;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class FileDownloadUtil {

    /**
     * 지정된 경로의 파일을 다운로드 가능한 형태로 반환
     *
     * @param fullPath       서버 내부 저장 경로 (ex: /uploads/attachments/UUID_filename.txt)
     * @param originalName   사용자가 업로드한 원본 파일명
     * @return ResponseEntity<Resource> → 파일 다운로드 응답
     */
    public ResponseEntity<Resource> getDownloadResponse(String fullPath, String originalName) {
        try {
            File file = new File(fullPath);
            if (!file.exists()) {
                throw new RuntimeException("파일이 존재하지 않습니다: " + fullPath);
            }

            FileSystemResource resource = new FileSystemResource(file);

            String encodedFileName = URLEncoder.encode(originalName, StandardCharsets.UTF_8)
                    .replaceAll("\\+", "%20");

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + encodedFileName + "\"")
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(resource.contentLength()))
                    .body(resource);

        } catch (Exception e) {
            log.error("파일 다운로드 실패: {}", e.getMessage(), e);
            throw new RuntimeException("파일 다운로드 중 오류가 발생했습니다.");
        }
    }

}
