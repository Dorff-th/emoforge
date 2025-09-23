package dev.emoforge.post;

import dev.emoforge.post.domain.Post;
import dev.emoforge.post.repository.PostRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@SpringBootTest(classes = PostServiceApplication.class)
class PostTestDataInitializer {

    private static final List<String> MEMBER_UUIDS = List.of(
            "32b8b3a6-134f-48a5-a3bb-c6e33f988148",
            "83fddd5f-a074-4b49-a5a7-daa24206d5ca",
            "7e68cc8f-aefe-466e-a91e-c29e10ec0260",
            "a2d30ebe-793e-4bf0-b844-1ad9bfe40573"
    );

    @Autowired
    private PostRepository postRepository;

    @Test
    void insertSamplePosts() {
        List<String> memberAssignments = new ArrayList<>(60);
        for (String memberUuid : MEMBER_UUIDS) {
            for (int count = 0; count < 15; count++) {
                memberAssignments.add(memberUuid);
            }
        }

        shuffle(memberAssignments);

        List<Post> posts = new ArrayList<>(60);
        for (int i = 0; i < memberAssignments.size(); i++) {
            int sequence = i + 1;
            String memberUuid = memberAssignments.get(i);
            long categoryId = randomCategoryId();
            Post post = Post.create("테스트 게시글 " + sequence,
                    "내용 " + sequence, categoryId, memberUuid);
            posts.add(post);
        }

        postRepository.saveAll(posts);
    }

    private void shuffle(List<String> values) {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        for (int i = values.size() - 1; i > 0; i--) {
            int swapIndex = random.nextInt(i + 1);
            Collections.swap(values, i, swapIndex);
        }
    }

    private long randomCategoryId() {
        return ThreadLocalRandom.current().nextLong(1, 6);
    }
}
