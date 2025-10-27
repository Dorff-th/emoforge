package dev.emoforge.post.service.bff;

import dev.emoforge.post.dto.bff.PageResponseDTO;
import dev.emoforge.post.dto.bff.PostListItemResponse;
import dev.emoforge.post.dto.external.MemberProfileResponse;
import dev.emoforge.post.dto.internal.PageRequestDTO;
import dev.emoforge.post.dto.internal.SortDirection;
import dev.emoforge.post.repository.PostRepository;
import dev.emoforge.post.service.external.AttachClient;
import dev.emoforge.post.service.external.AuthClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import static org.mockito.Mockito.*;

import java.util.Map;
import java.util.UUID;

@SpringBootTest
class PostListFacadeServiceTest {

    @Autowired
    private PostListFacadeService postListFacadeService;

    @Autowired
    private PostRepository postRepository;

    @MockBean
    private AuthClient authClient;

    @MockBean
    private AttachClient attachmentClient;

    @Test
    void 게시판목록_조립_성공() {
        // given: DB에 insert된 Post 엔티티 존재 (data.sql or testcontainer 기반)
        UUID memberUuid = UUID.fromString("32b8b3a6-134f-48a5-a3bb-c6e33f988148");
        String memberUuidStr = memberUuid.toString();

        // Mock Auth 응답
        when(authClient.getMemberProfile(anyString()))
            .thenReturn(new MemberProfileResponse(
                memberUuidStr,
                "테스트닉네임"
            ));

        // Mock Attachment 응답
        when(attachmentClient.countByPostIds(anyList()))
            .thenReturn(Map.of(
                58L, 2,
                59L, 1,
                60L, 0
            ));

        // when
        PageResponseDTO<PostListItemResponse> result =
            postListFacadeService.getPostList(null, new PageRequestDTO(1,10, "id", SortDirection.DESC));

        // then
        result.getDtoList().forEach(item -> {
            System.out.println("제목: " + item.title()
                + ", 작성자: " + item.nickname()
                + ", 댓글수: " + item.commentCount()
                + ", 첨부수: " + item.attachmentCount());
        });
    }
}
