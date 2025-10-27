package dev.emoforge.post.dto.internal;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CategoryUpdateRequest {
    @NotBlank(message = "수정할 카테고리 이름은 필수입니다")
    private String name;
}
