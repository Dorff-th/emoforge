package dev.emoforge.cleanup.entitiy;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "attachment")
public class Attachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long postId;

    private String memberUuid;

    private String uploadType;  // PROFILE_IMAGE

    private String fileUrl;

    private LocalDateTime createdAt;

    private String status;
}
