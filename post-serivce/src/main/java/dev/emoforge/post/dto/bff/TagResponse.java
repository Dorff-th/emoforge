package dev.emoforge.post.dto.bff;

import lombok.Builder;

@Builder
public record TagResponse(
        Long id,
        String name
) {
}
