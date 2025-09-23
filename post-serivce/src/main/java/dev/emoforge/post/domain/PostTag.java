package dev.emoforge.post.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "post_tag")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(access = AccessLevel.PRIVATE)
public class PostTag {

    @EmbeddedId
    private PostTagId id;

    public static PostTag link(Long postId, Long tagId) {
        return PostTag.builder()
                .id(new PostTagId(postId, tagId))
                .build();
    }
}
