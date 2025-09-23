package dev.emoforge.post.dto.internal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TagDTO {
    private Long postId;
    private Long tagId;
    private String name;
}
