package dev.emoforge.post.dto.internal;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CommentRequest {

    @NotBlank(message = "\uB0B4\uC6A9\uC740 \uD544\uC218 \uC785\uB825 \uD56D\uBAA9\uC785\uB2C8\uB2E4")
    private String content;

    public CommentRequest(String content) {
        this.content = content;
    }
}