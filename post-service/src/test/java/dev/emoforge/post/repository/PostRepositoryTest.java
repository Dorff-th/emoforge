package dev.emoforge.post.repository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class PostRepositoryTest {

    @Autowired
    private PostRepository postRepository;

    @DisplayName("특정 회원이 작성한 post 개수 조회에 성공한다.")
    @Test
    public void getCountByMemberUuid() {
        String memberUuid = "32b8b3a6-134f-48a5-a3bb-c6e33f988148";

        int postCnt = postRepository.countByMemberUuid(memberUuid);
        System.out.println("\n\n==post count : " + postCnt);

    }
}
