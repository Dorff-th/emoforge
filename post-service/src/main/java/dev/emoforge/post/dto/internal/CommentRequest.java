package dev.emoforge.post.dto.internal;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CommentRequest {

    @NotBlank(message = "내용 입력은 필수입니다.")
    private String content;

    public CommentRequest(String content) {
        this.content = content;
    }
}
