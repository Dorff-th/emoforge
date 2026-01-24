package dev.emoforge.post.mapper;

import dev.emoforge.post.dto.internal.PageRequestDTO;
import dev.emoforge.post.dto.internal.PostSearchResultDTO;
import dev.emoforge.post.dto.internal.SearchFilterDTO;
import dev.emoforge.post.dto.internal.SortDirection;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;



@SpringBootTest
@ActiveProfiles("dev")
@Transactional
class SearchMapperTest {



    @Autowired
    private SearchMapper searchMapper;

    @Test
    @DisplayName("조건 기반 게시글 검색 - title OR content + 페이징")
    void searchPostsByFilter_titleOrContent_withPaging() {

        String keyword = "도커";
        // given
        SearchFilterDTO filter = SearchFilterDTO.builder()
            .keyword(keyword)
            .titleChecked(true)
            .contentChecked(true)
            .categoryId(null)
            .build();

        PageRequestDTO pageRequest = PageRequestDTO.builder()
            .page(1)
            .size(10)
            .sort("createdAt")
            .direction(SortDirection.DESC)
            .build();

        // when
        List<PostSearchResultDTO> results =
            searchMapper.searchPostsByFilter(filter, pageRequest);

        int totalCount =
            searchMapper.countPostsByFilter(filter);

        // then
        assertThat(results).isNotNull();
        assertThat(results.size()).isLessThanOrEqualTo(10);
        assertThat(totalCount).isGreaterThanOrEqualTo(results.size());

        // (선택) 데이터 검증
        results.forEach(post -> {
            assertThat(
                post.title().contains(keyword)
                    || post.content().contains(keyword)
            ).isTrue();
        });

        System.out.println("\n\n\n");
        System.out.println("==totalCount : " + totalCount);
        System.out.println("\n");
        results.forEach(postSearchResultDTO -> {System.out.println(postSearchResultDTO);});
    }
}
