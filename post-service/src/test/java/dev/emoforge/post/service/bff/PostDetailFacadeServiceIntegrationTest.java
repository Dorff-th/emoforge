package dev.emoforge.post.service.bff;

import dev.emoforge.post.dto.bff.PostDetailResponse;
import dev.emoforge.post.repository.PostRepository;
import org.apache.ibatis.javassist.NotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class PostDetailFacadeServiceIntegrationTest {

    @Autowired
    private PostDetailFacadeService postDetailFacadeService;

    @Autowired
    private PostRepository postRepository;

    @Test
    void 게시글상세조회_성공() throws NotFoundException {
        Long postId = 60L;

        // when
        PostDetailResponse response = postDetailFacadeService.getPostDetail(postId);

        // then
        assertThat(response.id()).isEqualTo(postId);
        assertThat(response.title()).isEqualTo("제목");
        assertThat(response.nickname()).isNotBlank(); // Auth-Service 응답
        assertThat(response.editorImages()).isNotEmpty(); // Attach-Service 응답
    }
}
