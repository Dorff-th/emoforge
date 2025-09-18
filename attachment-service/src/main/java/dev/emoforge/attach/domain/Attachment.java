package dev.emoforge.attach.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "attachment")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long postId;             // 게시글 ID
    private String memberUuid;       // 업로드한 사용자 UUID
    private String fileName;         // 서버 저장 파일명
    private String originFileName;   // 원본 파일명
    private String fileUrl;          // 서버 내부 접근 URL
    private String publicUrl;        // 공개 URL
    private String fileType;         // 확장자 or MIME
    private Long fileSize;

    @Enumerated(EnumType.STRING)
    private UploadType uploadType;   // EDITOR_IMAGE / ATTACHMENT / PROFILE_IMAGE

    private LocalDateTime uploadedAt;

    private boolean deleted;
}
