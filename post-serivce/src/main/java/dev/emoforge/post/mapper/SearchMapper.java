package dev.emoforge.post.mapper;


import dev.emoforge.post.dto.internal.PageRequestDTO;
import dev.emoforge.post.dto.internal.SearchFilterDTO;
import dev.emoforge.post.dto.bff.SearchResultDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SearchMapper {
    List<SearchResultDTO>  searchPostsByKeyword(@Param("keyword") String keyword);

    List<SearchResultDTO>  searchPostsByKeywordWithPaging(@Param("keyword") String keyword,
                                                          @Param("pageRequest") PageRequestDTO pageRequestDTO);
    Integer searchPostsByKeywordCount(@Param("keyword") String keyword);


    List<SearchResultDTO> searchFilteredPostsWithPaging(@Param("searchFilterDTO")SearchFilterDTO filterDTO,
                                                        @Param("pageRequest") PageRequestDTO pageRequestDTO);

    Integer searchFilteredPostsCount(@Param("searchFilterDTO")SearchFilterDTO filterDTO);


    List<SearchResultDTO> searchPostsUnified(@Param("searchFilterDTO") SearchFilterDTO filterDTO,
                                                        @Param("pageRequest") PageRequestDTO pageRequestDTO);

    Integer searchPostsUnifiedCount(@Param("searchFilterDTO")SearchFilterDTO filterDTO);

}
