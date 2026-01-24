package dev.emoforge.post.admin.service.bff;

import dev.emoforge.post.admin.dto.bff.AdminPageResponseDTO;
import dev.emoforge.post.admin.dto.bff.AdminPostListItemDTO;
import dev.emoforge.post.dto.bff.PageResponseDTO;
import dev.emoforge.post.dto.bff.PostListItemResponse;
import dev.emoforge.post.dto.internal.PageRequestDTO;
import dev.emoforge.post.dto.internal.SortDirection;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.task.TaskExecutionAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

import java.util.concurrent.Executor;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
class AdminPostListFacadeServiceTest {

    @TestConfiguration
    static class NoAsyncConfig {
        @Bean(name = TaskExecutionAutoConfiguration.APPLICATION_TASK_EXECUTOR_BEAN_NAME)
        public Executor applicationTaskExecutor() {
            // 모든 @Async 호출을 동기 실행으로 바꿔버림
            return Runnable::run;
        }
    }

    @Autowired
    private AdminPostListFacadeService adminPostListFacadeService;

    @Test
    void Admin_게시판목록_실제서비스_조립성공() {
        // given
        PageRequestDTO request = new PageRequestDTO(1, 10, "id", SortDirection.DESC);

        // when
        AdminPageResponseDTO<AdminPostListItemDTO> result = adminPostListFacadeService.getPostList(request);

        // then
        result.getDtoList().forEach(item -> {
            System.out.println(
                "제목: " + item.title()
                    + ", 작성자: " + item.nickname()
                    + ", 댓글수: " + item.commentCount()
                    + ", 첨부수: " + item.attachmentCount()
            );
        });
    }

}
