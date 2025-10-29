package dev.emoforge.diary.dto.music;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 프론트엔드로 반환할 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendResultDTO {
    private String keyword;
    private List<SongDTO> songs;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SongDTO {
        private String artist;
        private String title;
        private String youtubeUrl;
        private String thumbnailUrl;
    }

    public static RecommendResultDTO from(LangGraphResponse response) {
        return RecommendResultDTO.builder()
                .keyword(response.getKeyword())
                .songs(response.getRecommendations().stream()
                        .map(r -> new SongDTO(r.getArtist(), r.getTitle(), r.getUrl(), r.getThumbnail()))
                        .collect(Collectors.toList()))
                .build();
    }
}