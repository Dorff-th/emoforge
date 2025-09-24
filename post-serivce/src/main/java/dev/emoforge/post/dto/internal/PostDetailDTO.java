package dev.emoforge.post.dto.internal;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
* Post 상세내용을 반환하는 DTO (internal)
*/
@NoArgsConstructor
//@Builder
@Data
public class PostDetailDTO {
    private Long id;
    private String memberUuid;
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long categoryId;
    private String categoryName;

    public PostDetailDTO(Long id, String memberUuid, String title, String content, LocalDateTime createdAt,
                         LocalDateTime updatedAt,
                         Long categoryId, String categoryName) {
        this.id = id;
        this.memberUuid = memberUuid;
        this.title = title;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.categoryName = categoryName;
        this.categoryId = categoryId;
    }



}
