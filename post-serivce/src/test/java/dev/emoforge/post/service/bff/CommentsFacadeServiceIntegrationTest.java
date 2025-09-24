package dev.emoforge.post.service.bff;

import dev.emoforge.post.dto.bff.CommentDetailResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

@SpringBootTest
@Transactional
class CommentsFacadeServiceIntegrationTest {

    @Autowired
    private CommentsFacadeService commentsFacadeService;

    @Test
    @DisplayName("특정 게시글의 댓글 목록을 닉네임, 프로필 이미지와 함께 조회한다")
    void getCommentsByPost_shouldReturnCommentsWithNicknameAndProfileImage() {
        // given
        Long postId = 60L; // ✅ 미리 테스트 데이터가 들어있는 postId

        // when
        List<CommentDetailResponse> responses = commentsFacadeService.getCommentsByPost(postId);

        // then
        assertThat(responses).isNotEmpty();

        responses.forEach(comment -> {
            System.out.println("댓글 ID: " + comment.id());
            System.out.println("내용: " + comment.content());
            System.out.println("작성자 UUID: " + comment.memberUuid());
            System.out.println("작성자 닉네임: " + comment.nickname());
            System.out.println("작성자 프로필 URL: " + comment.profileImageUrl());
            System.out.println("==================================");

            assertThat(comment.nickname()).isNotBlank();
            // 프로필 이미지가 없는 경우도 있으니 null 허용
        });
    }
}
